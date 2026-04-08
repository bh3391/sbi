import prisma from "@/lib/prisma";
import { sendFonneNotification } from "@/lib/fonnte";
import { NextResponse } from "next/server";
import { sendPushNotification } from "@/app/actions/push-notif";

// Helper untuk jeda waktu agar aman dari banned WhatsApp (10 detik)
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST() {
  // Langsung kirim respon ke Client agar Admin tidak menunggu 50 menit
  generateInvoicesInBackground();

  return NextResponse.json({
    success: true,
    message:
      "Proses latar belakang dimulai. Anda akan menerima notifikasi Push saat pengiriman selesai.",
  });
}

async function generateInvoicesInBackground() {
  try {
    const now = new Date();
    const targetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const month = targetDate.getMonth() + 1; // JS month is 0-indexed
    const year = targetDate.getFullYear();
    const dueDate = new Date(year, targetDate.getMonth(), 5);
    const periodeTxt = targetDate.toLocaleString("id-ID", {
      month: "long",
      year: "numeric",
    });

    // 1. Ambil semua orang tua yang memiliki anak aktif
    const parents = await prisma.parent.findMany({
      include: {
        students: {
          where: { status: "ACTIVE" },
          include: { package: true },
        },
      },
    });

    console.log(
      `🚀 Memulai background process untuk ${parents.length} entitas orang tua.`,
    );
    let totalSuccessCount = 0;

    for (const parent of parents) {
      if (parent.students.length === 0) continue;

      let childrenNames: string[] = [];
      let totalFamilyBaseAmount = 0;
      let currentDepositBalance = parent.depositBalance;
      const initialDeposit = parent.depositBalance;

      // 2. Transaksi Database per Orang Tua (Looping Anak)
      for (const student of parent.students) {
        // Cek duplikasi invoice
        const existing = await prisma.invoice.findFirst({
          where: { studentId: student.id, month, year },
        });

        if (existing) continue;

        const baseAmount = student.package?.price || 0;
        const sessionsToAdd = student.package?.sesiCredit || 0;
        const usedFromDeposit = Math.min(currentDepositBalance, baseAmount);
        currentDepositBalance -= usedFromDeposit;
        const finalToPay = baseAmount - usedFromDeposit;

        await prisma.$transaction(async (tx) => {
          // A. Buat Invoice (Status PAID jika deposit cukup, UNPAID jika kurang)
          const inv = await tx.invoice.create({
            data: {
              invoiceNo: `INV-${year}${month}-${student.id.slice(-4).toUpperCase()}`,
              studentId: student.id,
              month,
              year,
              amount: baseAmount,
              discount: usedFromDeposit,
              totalToPay: finalToPay,
              dueDate,
              status: finalToPay <= 0 ? "PAID" : "UNPAID",
              paidAt: finalToPay <= 0 ? new Date() : null,
              paymentMethod: usedFromDeposit > 0 ? "DEPOSIT" : null,
            },
          });

          // B. Tambahkan Sesi Belajar Langsung (UX Seamless)
          // Meskipun belum lunas, sesi tetap diberikan agar operasional lancar.
          // Akses rapor/sertifikat dikunci di level frontend jika status UNPAID.
          await tx.student.update({
            where: { id: student.id },
            data: {
              remainingSesi: { increment: sessionsToAdd },
            },
          });

          // C. Catat History Pembayaran jika deposit terpakai
          if (usedFromDeposit > 0) {
            await tx.payment.create({
              data: {
                amount: usedFromDeposit,
                method: "DEPOSIT",
                status: "SUCCESS",
                category: "TUITION",
                month,
                year,
                invoiceId: inv.id,
                students: { connect: { id: student.id } },
                verifiedAt: new Date(),
                notes: `Potong deposit otomatis periode ${periodeTxt}. Sesi +${sessionsToAdd} ditambahkan.`,
              },
            });
          }

          // D. Update Saldo Parent
          await tx.parent.update({
            where: { id: parent.id },
            data: { depositBalance: currentDepositBalance },
          });
        });

        totalFamilyBaseAmount += baseAmount;
        childrenNames.push(student.fullName);
      }

      // 3. Kirim WhatsApp jika ada minimal satu invoice baru
      if (childrenNames.length > 0 && parent.contact) {
        const totalUsedDeposit = initialDeposit - currentDepositBalance;
        const finalBill = totalFamilyBaseAmount - totalUsedDeposit;
        const encodedName = encodeURIComponent(parent.id || "");

        // --- TEMPLATE PESAN WA ---
        const message = `📝 *TAGIHAN KURSUS & SESI BELAJAR*

Halo Ayah/Bunda *${parent.name}*,
Tagihan periode *${periodeTxt}* telah diterbitkan. Sesi belajar untuk Ananda telah kami tambahkan ke sistem agar kegiatan belajar tetap berjalan lancar.

*Rincian Siswa:*
${childrenNames.map((name) => `• ${name}`).join("\n")}

*Rincian Biaya:*
- Total Biaya: Rp ${totalFamilyBaseAmount.toLocaleString("id-ID")}
- Potong Deposit: -Rp ${totalUsedDeposit.toLocaleString("id-ID")}
--------------------------------
*SISA TAGIHAN: Rp ${finalBill.toLocaleString("id-ID")}*
--------------------------------

*Sisa Saldo Deposit:* Rp ${currentDepositBalance.toLocaleString("id-ID")}

${
  finalBill > 0
    ? `⚠️ _Mohon segera melakukan pelunasan sisa tagihan sebelum tanggal ${dueDate.getDate()} agar akses rapor & sertifikat tetap tersedia._`
    : `✅ _Tagihan telah lunas menggunakan deposit. Terima kasih atas kepercayaannya._`
}

Cek rincian & kuitansi di sini:
🔗 https://bimbelanda.com/parent/invoice/${encodedName}

*Pembayaran (Jika ada sisa):*
BCA: 1234567890 (A/N Bhakti Pratama)

Terima kasih! 🙏✨`;

        try {
          await sendFonneNotification(parent.contact, message);
          totalSuccessCount++;
          console.log(`✅ Terkirim ke: ${parent.name}`);

          // Delay 10 detik antar orang tua agar nomor WA aman
          await sleep(10000);
        } catch (waError) {
          console.error(`❌ Gagal WA ke ${parent.contact}:`, waError);
        }
      }
    }

    // --- 4. KIRIM PUSH NOTIFICATION KE ADMIN SETELAH SELESAI ---
    await sendPushNotification({
      title: "✅ Invoices & Sesi Selesai",
      body: `${totalSuccessCount} tagihan periode ${periodeTxt} telah berhasil dikirim ke orang tua.`,
      url: "/admin/invoice",
    });

    console.log("🏁 Background process selesai seluruhnya.");
  } catch (error) {
    // Alert Admin jika terjadi error fatal di tengah proses
    await sendPushNotification({
      title: "🚨 Proses Invoice Gagal",
      body: "Terjadi kesalahan sistem di background process. Segera cek log server.",
      url: "/admin/invoice",
    });
    console.error("🚨 CRITICAL ERROR:", error);
  }
}
