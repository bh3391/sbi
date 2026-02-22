// src/app/actions/payments.ts
"use server"

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";


export async function handleConfirm(paymentId: string) {
  
  await prisma.$transaction(async (tx) => {
    const pay = await tx.payment.update({
      where: { id: paymentId },
      data: { status: 'SUCCESS', verifiedAt: new Date(), method: 'TRANSFER' }, // default transfer jika via web
      include: { student: true }
    });

    if (pay.student.status === 'NEWSTUDENT') {
      await tx.student.update({
        where: { id: pay.studentId },
        data: { status: 'ACTIVE' }
      });
    }
  });
  revalidatePath(`/admin/payment/[locationId]`);
}

export async function createManualPayment(formData: FormData) {
  try {
    // 1. Ambil data menggunakan .get() karena ini adalah objek FormData
    const studentId = formData.get("studentId") as string;
    const amount = formData.get("amount") as string;
    const category = formData.get("category") as string;
    const method = formData.get("method") as string;
    const month = formData.get("month") as string;
    const year = formData.get("year") as string;
    const notes = formData.get("notes") as string;
    const locationId = formData.get("locationId") as string;

    // Validasi sederhana
    if (!studentId || !amount) {
      return { success: false, message: "Data tidak lengkap" };
    }

    // 2. Gunakan Transaction agar jika salah satu gagal, semua dibatalkan
    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          studentId,
          amount: parseFloat(amount),
          category, 
          method,   
          status: "SUCCESS",
          month: parseInt(month),
          year: parseInt(year),
          notes,
        },
        include: { student: true }
      });

      // 3. Logika penambahan sesi (Hanya jika RENEWAL, REGISTRATION, atau REACTIVATION)
      // Deposit biasanya uang muka, bisa jadi belum nambah sesi tergantung aturan bisnis Anda
      const sessionBoostingCategories = ["REGISTRATION", "RENEWAL", "REACTIVATION", "DEPOSIT"];
      
      if (sessionBoostingCategories.includes(category)) {
        const student = await tx.student.findUnique({
          where: { id: studentId },
          include: { package: true }
        });

        if (student?.package) {
          await tx.student.update({
            where: { id: studentId },
            data: {
              remainingSesi: { increment: student.package.sesiCredit }
            }
          });
        }
      }
      return payment;
    });

    revalidatePath(`/admin/payment/${locationId}`);
    return { success: true, message: "Pembayaran berhasil dicatat!" };
  } catch (error) {
    console.error("Payment Error:", error);
    return { success: false, message: "Gagal menyimpan data ke database" };
  }
}