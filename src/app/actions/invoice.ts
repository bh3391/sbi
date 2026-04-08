"use server";

import { auth } from "@/lib/auth";
import { sendFonneNotification } from "@/lib/fonnte";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function generateMonthlyInvoices() {
  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));
  try {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const dueDate = new Date(year, month, 5);

    // 1. Ambil semua Parent & Anak Aktif
    const parents = await prisma.parent.findMany({
      include: {
        students: {
          where: { status: "ACTIVE" },
          include: { package: true },
        },
      },
    });

    let totalInvoicesCreated = 0;

    for (const parent of parents) {
      if (parent.students.length === 0) continue;

      let totalFamilyBaseAmount = 0;
      let childrenInvoiced: string[] = [];
      let currentDepositBalance = parent.depositBalance;
      const initialDeposit = parent.depositBalance;

      // 2. Loop per siswa untuk generate Invoice & Payment Deposit
      for (const student of parent.students) {
        const existing = await prisma.invoice.findFirst({
          where: { studentId: student.id, month, year },
        });

        if (existing) continue;

        const baseAmount = student.package?.price || 0;
        const usedFromDeposit = Math.min(currentDepositBalance, baseAmount);
        currentDepositBalance -= usedFromDeposit;
        const finalBill = baseAmount - usedFromDeposit;

        // DATABASE TRANSACTION
        await prisma.$transaction(async (tx) => {
          // A. Buat Invoice
          const newInvoice = await tx.invoice.create({
            data: {
              invoiceNo: `INV-${year}${month}-${student.id.slice(-4).toUpperCase()}`,
              studentId: student.id,
              month,
              year,
              amount: baseAmount,
              discount: usedFromDeposit,
              totalToPay: finalBill,
              dueDate: dueDate,
              status: finalBill <= 0 ? "PAID" : "UNPAID",
              paidAt: finalBill <= 0 ? new Date() : null,
              paymentMethod: usedFromDeposit > 0 ? "DEPOSIT" : null,
            },
          });

          // B. Catat di tabel Payment jika ada pemotongan deposit
          if (usedFromDeposit > 0) {
            await tx.payment.create({
              data: {
                amount: usedFromDeposit,
                method: "DEPOSIT",
                status: "SUCCESS", // Langsung sukses karena potong saldo internal
                category: "TUITION",
                month: month,
                year: year,
                notes: `Auto-debet deposit untuk ${student.fullName}`,
                invoiceId: newInvoice.id,
                // Menghubungkan ke siswa (Relasi Student[] @relation("StudentPayments"))
                students: {
                  connect: { id: student.id },
                },
                verifiedAt: new Date(),
              },
            });
          }

          // C. Update saldo di tabel Parent
          await tx.parent.update({
            where: { id: parent.id },
            data: { depositBalance: currentDepositBalance },
          });
        });

        totalFamilyBaseAmount += baseAmount;
        childrenInvoiced.push(student.fullName);
        totalInvoicesCreated++;
      }

      // 3. Logika Notifikasi WhatsApp Grouping
      if (childrenInvoiced.length > 0 && parent.contact) {
        const totalUsedDeposit = initialDeposit - currentDepositBalance;
        const finalFamilyBill = totalFamilyBaseAmount - totalUsedDeposit;

        const encodedParentName = encodeURIComponent(parent.name || "");
        const periodeTxt = now.toLocaleString("id-ID", {
          month: "long",
          year: "numeric",
        });

        const message =
          `📝 *TAGIHAN KURSUS BIMBEL PRO*\n\n` +
          `Halo Ayah/Bunda *${parent.name}*,\n` +
          `Semoga sehat selalu. Berikut rincian tagihan kursus untuk Ananda:\n\n` +
          `*SISWA:*\n${childrenInvoiced.map((name) => `   - ${name}`).join("\n")}\n\n` +
          `*PERIODE:* ${periodeTxt}\n` +
          `--------------------------------\n` +
          `Total Tagihan: Rp ${totalFamilyBaseAmount.toLocaleString("id-ID")}\n` +
          `Total Deposit: -Rp ${totalUsedDeposit.toLocaleString("id-ID")}\n` +
          `--------------------------------\n` +
          `*SISA TAGIHAN: Rp ${finalFamilyBill.toLocaleString("id-ID")}*\n` +
          `--------------------------------\n\n` +
          `Sisa Saldo Deposit Anda: Rp ${currentDepositBalance.toLocaleString("id-ID")}\n\n` +
          `Cek rincian & kuitansi melalui link resmi ini:\n` +
          `🔗 http://localhost:3000/parent/invoice/${encodedParentName}\n\n` +
          `Pembayaran via BCA: 1234567890 (A/N Bhakti Pratama).\n` +
          `Terima kasih! 🙏✨`;

        try {
          await sendFonneNotification(parent.contact, message);
          await sleep(10000);
        } catch (waError) {
          console.error(`Gagal kirim WA ke ${parent.contact}:`, waError);
        }
      }
    }

    revalidatePath("/invoice");
    return {
      success: true,
      message: `Berhasil memproses ${totalInvoicesCreated} invoice.`,
    };
  } catch (error) {
    console.error("Critical Error in generateMonthlyInvoices:", error);
    return {
      success: false,
      message: "Terjadi kesalahan sistem saat generate invoice.",
    };
  }
}

export async function markAsPaid(invoiceId: string, method: string = "CASH") {
  const session = await auth();
  const currentUserId = session?.user?.id;

  if (!currentUserId) throw new Error("Unauthorized: Silakan login kembali.");

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Ambil data Invoice lengkap dengan relasi ke Parent
      const invoice = await tx.invoice.findUnique({
        where: { id: invoiceId },
        include: {
          student: {
            include: {
              package: true,
              addons: true,
              parent: true, // Ambil data parent untuk cek saldo
            },
          },
        },
      });

      if (!invoice) throw new Error("Invoice tidak ditemukan.");
      if (invoice.status === "PAID") throw new Error("Invoice sudah lunas.");

      // --- LOGIKA DEPOSIT ---
      let finalNewDepositBalance = invoice.student.parent?.depositBalance || 0;

      if (method === "DEPOSIT") {
        if (!invoice.student.parentId)
          throw new Error("Data orang tua tidak ditemukan.");

        // Cek apakah saldo cukup
        if (
          (invoice.student.parent?.depositBalance || 0) < invoice.totalToPay
        ) {
          throw new Error(
            "Saldo deposit tidak mencukupi untuk pembayaran ini.",
          );
        }

        // Potong saldo di tabel Parent
        const updatedParent = await tx.parent.update({
          where: { id: invoice.student.parentId },
          data: { depositBalance: { decrement: invoice.totalToPay } },
        });

        finalNewDepositBalance = updatedParent.depositBalance;
      }
      // ----------------------

      // 2. Update status Invoice
      await tx.invoice.update({
        where: { id: invoiceId },
        data: {
          status: "PAID",
          paymentMethod: method, // Catat metode pembayarannya
          paidAt: new Date(),
        },
      });

      // 3. Hitung Sesi
      const sessionsEarned = invoice.student.package?.sesiCredit || 0;
      const addOnSessionsEarned = invoice.student.addons.reduce(
        (sum, addon) => sum + (addon.sesiCredit || 0),
        0,
      );

      // 4. Update Saldo Sesi Siswa
      const updatedStudent = await tx.student.update({
        where: { id: invoice.studentId },
        data: {
          remainingSesi: { increment: sessionsEarned },
          addOnSesi: { increment: addOnSessionsEarned },
          status: "ACTIVE",
        },
      });

      // 5. Buat Record Payment
      await tx.payment.create({
        data: {
          amount: invoice.totalToPay,
          method: method,
          status: "SUCCESS",
          category: "RENEWAL",
          notes: `Lunas via Admin (${method}). Sesi: +${sessionsEarned}, Addon: +${addOnSessionsEarned}`,
          invoice: { connect: { id: invoice.id } },
          students: { connect: [{ id: invoice.studentId }] },
          createdBy: { connect: { id: currentUserId } },
          verifiedBy: { connect: { id: currentUserId } },
          date: new Date(),
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
          verifiedAt: new Date(),
        },
      });

      return {
        studentName: updatedStudent.fullName,
        parentName: updatedStudent.parentName ?? "Orang Tua",
        parentContact: updatedStudent.parentContact ?? "",
        amount: invoice.totalToPay,
        sessionsEarned,
        addOnSessionsEarned,
        newTotalSesi: updatedStudent.remainingSesi,
        newAddOnSesi: updatedStudent.addOnSesi,
        // TAMBAHKAN INI agar Client bisa update state saldo
        newDepositBalance: finalNewDepositBalance,
      };
    });

    revalidatePath("/admin/invoice");
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Payment Error:", error);
    return { success: false, error: error.message };
  }
}
