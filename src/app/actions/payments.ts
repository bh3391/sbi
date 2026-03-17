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

    // 1. Jalankan Database Transaction
    const result = await prisma.$transaction(async (tx) => {
      // Ambil data pembayaran beserta info paket siswa
      const pay = await tx.payment.findUnique({
        where: { id: paymentId },
        include: {
          student: {
            include: { package: true },
          },
        },
      });

      if (!pay) throw new Error("Data pembayaran tidak ditemukan.");
      if (pay.status === "SUCCESS") throw new Error("Pembayaran ini sudah diverifikasi sebelumnya.");

      // A. Update status pembayaran menjadi SUCCESS
      const updatedPayment = await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: "SUCCESS",
          verifiedAt: new Date(),
          verifiedById: currentUserId,
        },
      });

      // B. Logika Penambahan Sesi
      const sessionBoostingCategories = ["RENEWAL", "REGISTRATION", "REACTIVATION"];
      let sessionsEarned = 0;

      if (sessionBoostingCategories.includes(pay.category || "")) {
        // Ambil sesiCredit dari paket, jika null maka 0
        sessionsEarned = pay.student.package?.sesiCredit || 0;

        if (sessionsEarned > 0) {
          await tx.student.update({
            where: { id: pay.studentId },
            data: {
              remainingSesi: { increment: sessionsEarned },
              status: "ACTIVE", // Pastikan murid otomatis aktif setelah bayar
            },
          });
        }
      }

      // Kembalikan data yang dibutuhkan untuk WhatsApp
      return {
        pay: pay,
        sessionsEarned,
        // Kalkulasi sesi sekarang untuk dikirim ke WA (Sesi awal + penambahan)
        newTotalSesi: (pay.student.remainingSesi || 0) + sessionsEarned,
      };
    });

    // 2. Notifikasi WhatsApp (Diluar transaction agar tidak blocking)
    const parentContact = result.pay.student.parentContact;
    
    // Perbaikan error 'string | null': Pastikan contact ada sebelum panggil fungsi
    if (parentContact) {
      const { pay, sessionsEarned, newTotalSesi } = result;

      const message = 
        `*✅ PEMBAYARAN TERVERIFIKASI*\n\n` +
        `Halo Ayah/Bunda *${pay.student.parentName}*,\n` +
        `Pembayaran untuk Ananda *${pay.student.fullName}* telah kami terima dan diverifikasi. Terima kasih! 🙏\n\n` +
        `*RINCIAN TRANSAKSI:*\n` +
        `• Kategori: ${pay.category}\n` +
        `• Nominal: Rp ${pay.amount.toLocaleString("id-ID")}\n` +
        `• Tanggal: ${new Date().toLocaleDateString("id-ID")}\n` +
        `--------------------------------\n` +
        `*UPDATE SESI BELAJAR:*\n` +
        `• Sesi Didapat: +${sessionsEarned}\n` +
        `• *Total Sesi Aktif: ${newTotalSesi} Sesi*\n` +
        `--------------------------------\n\n` +
        `Selamat belajar dan sampai jumpa di kelas! ✨`;

      // Menggunakan try-catch kecil agar error WA tidak membatalkan suksesnya database
      try {
        await sendFonneNotification(parentContact, message);
      } catch (waError) {
        console.error("Gagal mengirim WhatsApp:", waError);
      }
    }

    // 3. Revalidate cache agar UI langsung update
    revalidatePath(`/admin/payment`, "layout");
    
    return { 
      success: true, 
      message: "Pembayaran berhasil diverifikasi dan sesi telah ditambahkan!" 
    };

  } catch (error: any) {
    console.error("Confirm Payment Error:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Terjadi kesalahan sistem saat verifikasi" 
    };
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
      const payment = await tx.payment.create({
        data: {
          studentId,
          amount: parseFloat(amount),
          category,
          method,
          status: method === "TRANSFER" ? "PENDING" : "SUCCESS",
          month: parseInt(month),
          year: parseInt(year),
          notes,
          createdById: currentUserId || null,
        },
        include: { 
          student: {
            include: { package: true }
          }
        }
      });

      let sessionsAdded = 0;
      const sessionBoostingCategories = ["REGISTRATION", "RENEWAL", "REACTIVATION"];
      
      // Sesi bertambah otomatis HANYA jika CASH (karena status langsung SUCCESS)
      if (sessionBoostingCategories.includes(category) && method !== "TRANSFER") {
        if (payment.student?.package) {
          sessionsAdded = payment.student.package.sesiCredit;
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
        sessionsAdded, 
        newTotalSesi: (payment.student.remainingSesi || 0) + sessionsAdded 
      };
    });

    // LOGIKA NOTIFIKASI WHATSAPP BERDASARKAN KATEGORI & METODE
    const parentContact = result.payment.student.parentContact;
    if (parentContact) {
      const { payment, sessionsAdded, newTotalSesi } = result;
      const isTransfer = payment.method === "TRANSFER";
      const cat = payment.category;
      const amountStr = payment.amount.toLocaleString('id-ID');
      const studentName = payment.student.fullName;
      const parentName = payment.student.parentName;

      let header = "";
      let body = "";

      if (cat === "REGISTRATION") {
        if (isTransfer) {
          header = `*⏳ PENDAFTARAN - MENUNGGU KONFIRMASI*`;
          body = `Pendaftaran Ananda *${studentName}* telah diterima. Mohon kirimkan bukti transfer sebesar *Rp ${amountStr}* untuk *Aktivasi Sesi Belajar*.`;
        } else {
          header = `*✅ PENDAFTARAN - TRANSAKSI BERHASIL*`;
          body = `Pendaftaran Ananda *${studentName}* telah berhasil. Sesi belajar telah aktif sebanyak *${newTotalSesi} Sesi*.`;
        }
      } 
      else if (cat === "RENEWAL") {
        if (isTransfer) {
          header = `*⏳ RENEWAL - MENUNGGU KONFIRMASI*`;
          body = `Permintaan perpanjangan sesi Ananda *${studentName}* telah diterima. Sesi akan bertambah otomatis setelah bukti transfer *Rp ${amountStr}* diverifikasi Admin.`;
        } else {
          header = `*🔄 PERPANJANGAN BERHASIL*`;
          body = `Perpanjangan sesi Ananda *${studentName}* sukses. Sesi bertambah +${sessionsAdded}. Total sesi sekarang: *${newTotalSesi} Sesi*.`;
        }
      }
      else if (cat === "DEPOSIT") {
        header = `*💰 DEPOSIT DITERIMA*`;
        body = `Deposit sejumlah *Rp ${amountStr}* untuk Ananda *${studentName}* telah kami terima melalui ${payment.method}. Dana akan tersimpan sebagai saldo cadangan.`;
      }
      else {
        header = `*📩 PEMBAYARAN DITERIMA*`;
        const noteDetail = payment.notes ? `(${payment.notes})` : "";
        body = `Pembayaran ${noteDetail} sejumlah *Rp ${amountStr}* untuk Ananda *${studentName}* telah kami terima.`;
      }

      const waMessage = 
        `${header}\n\n` +
        `Halo Ayah/Bunda *${parentName}*,\n` +
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