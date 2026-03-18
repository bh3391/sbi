// src/app/actions/payments.ts
"use server"


import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma"; // Sesuaikan dengan path prisma client Anda
import { sendFonneNotification } from "@/lib/fonnte"; // Sesuaikan dengan path utility WA Anda
import { revalidatePath } from "next/cache";

export async function handleConfirm(paymentId: string) {
  try {
    const session = await auth();
    const currentUserId = session?.user?.id;

    if (!currentUserId) {
      throw new Error("Unauthorized: Anda harus login untuk melakukan verifikasi.");
    }

    const result = await prisma.$transaction(async (tx) => {
      const pay = await tx.payment.findUnique({
        where: { id: paymentId },
        include: {
          students: { 
            include: { 
              package: true,
              addons: true // Ambil data addons yang terhubung dengan siswa
            },
          },
        },
      });

      if (!pay) throw new Error("Data pembayaran tidak ditemukan.");
      if (pay.status === "SUCCESS") throw new Error("Pembayaran ini sudah diverifikasi sebelumnya.");

      // A. Update status pembayaran
      await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: "SUCCESS",
          verifiedAt: new Date(),
          verifiedById: currentUserId,
        },
      });

      // B. Update Sesi Siswa
      const sessionBoostingCategories = ["RENEWAL", "REGISTRATION", "REACTIVATION"];
      const updateReports: any[] = [];

      if (sessionBoostingCategories.includes(pay.category || "")) {
        for (const student of pay.students) {
          // Hitung Sesi dari Paket Utama
          const sessionsEarned = student.package?.sesiCredit || 0;
          
          // Hitung Sesi dari semua Addons yang dipilih
          const addOnSessionsEarned = student.addons.reduce((sum, addon) => sum + (addon.sesiCredit || 0), 0);
          
          if (sessionsEarned > 0 || addOnSessionsEarned > 0) {
            const updatedStudent = await tx.student.update({
              where: { id: student.id },
              data: {
                remainingSesi: { increment: sessionsEarned },
                addOnSesi: { increment: addOnSessionsEarned }, // Update kolom baru
                status: "ACTIVE",
              },
            });

            updateReports.push({
              fullName: student.fullName,
              parentName: student.parentName,
              parentContact: student.parentContact,
              sessionsEarned,
              addOnSessionsEarned,
              newTotalSesi: updatedStudent.remainingSesi,
              newAddOnSesi: updatedStudent.addOnSesi,
            });
          }
        }
      }

      return { pay, updateReports };
    });

    // 2. Notifikasi WhatsApp (Grouping by Parent Contact)
    const reportsByContact = result.updateReports.reduce((acc: any, curr: any) => {
      if (!acc[curr.parentContact]) acc[curr.parentContact] = [];
      acc[curr.parentContact].push(curr);
      return acc;
    }, {});

    for (const contact in reportsByContact) {
      const children = reportsByContact[contact];
      const parentName = children[0].parentName;
      
      const sessionDetails = children.map((c: any) => {
        let detail = `• *${c.fullName}*:\n`;
        detail += `  - Paket: +${c.sessionsEarned} (Total: ${c.newTotalSesi})`;
        if (c.addOnSessionsEarned > 0) {
          detail += `\n  - Add-on: +${c.addOnSessionsEarned} (Total: ${c.newAddOnSesi})`;
        }
        return detail;
      }).join("\n\n");

      const message = 
        `*✅ PEMBAYARAN TERVERIFIKASI*\n\n` +
        `Halo Ayah/Bunda *${parentName}*,\n` +
        `Pembayaran tagihan telah diverifikasi. Sesi belajar telah ditambahkan ke akun Ananda. 🙏\n\n` +
        `*RINCIAN TRANSAKSI:*\n` +
        `• Kategori: ${result.pay.category}\n` +
        `• Nominal: Rp ${result.pay.amount.toLocaleString("id-ID")}\n` +
        `--------------------------------\n` +
        `*UPDATE SESI BELAJAR:*\n\n` +
        `${sessionDetails}\n` +
        `--------------------------------\n\n` +
        `Selamat belajar! ✨`;

      try {
        await sendFonneNotification(contact, message);
      } catch (waError) {
        console.error(`Gagal mengirim WA:`, waError);
      }
    }

    revalidatePath(`/admin/payment`, "layout");
    return { success: true, message: "Verifikasi berhasil!" };

  } catch (error: any) {
    console.error("Confirm Payment Error:", error);
    return { success: false, message: error.message || "Gagal verifikasi" };
  }
}

/**
 * Fungsi untuk mencatat pembayaran manual (FAB Add Payment)
 */
export async function createManualPayment(formData: FormData) {
  const session = await auth();
  const currentUserId = session?.user?.id;

  try {
    const studentId = formData.get("studentId") as string;
    const amount = formData.get("amount") as string;
    const category = formData.get("category") as string;
    const method = formData.get("method") as string;
    const month = formData.get("month") as string;
    const year = formData.get("year") as string;
    const notes = formData.get("notes") as string;
    const locationId = formData.get("locationId") as string;

    if (!studentId || !amount) {
      return { success: false, message: "Data tidak lengkap" };
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Buat Payment dan hubungkan ke Student (Many-to-Many)
      const payment = await tx.payment.create({
        data: {
          amount: parseFloat(amount),
          category,
          method,
          status: method === "TRANSFER" ? "PENDING" : "SUCCESS",
          month: parseInt(month),
          year: parseInt(year),
          notes,
          createdById: currentUserId || null,
          // MENGGUNAKAN CONNECT UNTUK SKEMA BARU
          students: {
            connect: { id: studentId }
          }
        },
        include: { 
          students: {
            where: { id: studentId }, // Kita ambil data siswa spesifik ini saja
            include: { package: true }
          }
        }
      });

      const student = payment.students[0]; // Ambil target siswa
      let sessionsAdded = 0;
      const sessionBoostingCategories = ["REGISTRATION", "RENEWAL", "REACTIVATION"];
      
      // Sesi bertambah otomatis HANYA jika CASH/SUCCESS
      if (sessionBoostingCategories.includes(category) && method !== "TRANSFER") {
        if (student.package) {
          sessionsAdded = student.package.sesiCredit;
          await tx.student.update({
            where: { id: studentId },
            data: {
              remainingSesi: { increment: sessionsAdded },
              status: "ACTIVE" 
            }
          });
        }
      }

      return { 
        payment, 
        student, // Kita kirim balik data student untuk WA
        sessionsAdded, 
        newTotalSesi: (student.remainingSesi || 0) + sessionsAdded 
      };
    });

    // 2. LOGIKA NOTIFIKASI WHATSAPP
    const { payment, student, sessionsAdded, newTotalSesi } = result;
    const parentContact = student.parentContact;

    if (parentContact) {
      const isTransfer = payment.method === "TRANSFER";
      const cat = payment.category;
      const amountStr = payment.amount.toLocaleString('id-ID');

      let header = "";
      let body = "";

      if (cat === "REGISTRATION") {
        if (isTransfer) {
          header = `*⏳ PENDAFTARAN - MENUNGGU KONFIRMASI*`;
          body = `Pendaftaran Ananda *${student.fullName}* telah diterima. Mohon kirimkan bukti transfer sebesar *Rp ${amountStr}* untuk *Aktivasi Sesi Belajar*.`;
        } else {
          header = `*✅ PENDAFTARAN - TRANSAKSI BERHASIL*`;
          body = `Pendaftaran Ananda *${student.fullName}* telah berhasil. Sesi belajar telah aktif sebanyak *${newTotalSesi} Sesi*.`;
        }
      } 
      else if (cat === "RENEWAL") {
        if (isTransfer) {
          header = `*⏳ RENEWAL - MENUNGGU KONFIRMASI*`;
          body = `Permintaan perpanjangan sesi Ananda *${student.fullName}* telah diterima. Sesi akan bertambah otomatis setelah bukti transfer *Rp ${amountStr}* diverifikasi Admin.`;
        } else {
          header = `*🔄 PERPANJANGAN BERHASIL*`;
          body = `Perpanjangan sesi Ananda *${student.fullName}* sukses. Sesi bertambah +${sessionsAdded}. Total sesi sekarang: *${newTotalSesi} Sesi*.`;
        }
      }
      else if (cat === "DEPOSIT") {
        header = `*💰 DEPOSIT DITERIMA*`;
        body = `Deposit sejumlah *Rp ${amountStr}* untuk Ananda *${student.fullName}* telah kami terima melalui ${payment.method}. Dana akan tersimpan sebagai saldo cadangan.`;
      }
      else {
        header = `*📩 PEMBAYARAN DITERIMA*`;
        const noteDetail = payment.notes ? `(${payment.notes})` : "";
        body = `Pembayaran ${noteDetail} sejumlah *Rp ${amountStr}* untuk Ananda *${student.fullName}* telah kami terima.`;
      }

      const waMessage = 
        `${header}\n\n` +
        `Halo Ayah/Bunda *${student.parentName}*,\n` +
        `${body}\n\n` +
        `--------------------------------\n` +
        `Metode: ${payment.method}\n` +
        `Tanggal: ${new Date().toLocaleDateString('id-ID')}\n` +
        `--------------------------------\n\n` +
        `Terima kasih atas kepercayaannya! ✨`;

      try {
        await sendFonneNotification(parentContact, waMessage);
      } catch (waError) {
        console.error("Gagal mengirim WA:", waError);
      }
    }

    revalidatePath(`/admin/payment/${locationId}`);
    return { success: true, message: "Pembayaran berhasil dicatat & WA terkirim!" };

  } catch (error) {
    console.error("Payment Error:", error);
    return { success: false, message: "Gagal menyimpan data ke database" };
  }
}