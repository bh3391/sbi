// src/app/actions/payments.ts
"use server"

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";


export async function handleConfirm(paymentId: string) {
  try {
    const session = await auth();
    const currentUserId = session?.user?.id;

    if (!currentUserId) throw new Error("Unauthorized");

    const result = await prisma.$transaction(async (tx) => {
      // 1. Ambil data pembayaran beserta info paket siswa
      const pay = await tx.payment.findUnique({
        where: { id: paymentId },
        include: { 
          student: {
            include: { package: true } // Ambil info paket (sesiCredit)
          }
        }
      });

      if (!pay) throw new Error("Data pembayaran tidak ditemukan");
      if (pay.status === "SUCCESS") throw new Error("Pembayaran sudah diverifikasi sebelumnya");

      // 2. Update status pembayaran menjadi SUCCESS
      const updatedPayment = await tx.payment.update({
        where: { id: paymentId },
        data: { 
          status: 'SUCCESS', 
          verifiedAt: new Date(), 
          verifiedById: currentUserId 
        }
      });

      // 3. LOGIKA RENEWAL / PENAMBAHAN SESI
      // Jika kategori adalah RENEWAL, REGISTRATION, atau REACTIVATION
      const sessionBoostingCategories = ["RENEWAL", "REGISTRATION", "REACTIVATION"];
      
      if (sessionBoostingCategories.includes(pay.category || "")) {
        const sesiToAdd = pay.student.package?.sesiCredit || 0;

        if (sesiToAdd > 0) {
          await tx.student.update({
            where: { id: pay.studentId },
            data: {
              remainingSesi: { increment: sesiToAdd },
              status: 'ACTIVE' // Pastikan status jadi ACTIVE
            }
          });
        }
      }

      return updatedPayment;
    });

    revalidatePath(`/admin/payment/[locationId]`, 'page');
    return { success: true, message: "Pembayaran diverifikasi & sesi telah ditambahkan!" };
    
  } catch (error: any) {
    return { success: false, message: error.message || "Gagal verifikasi" };
  }
}

export async function createManualPayment(formData: FormData) {
  const session = await auth();
  const currentUserId = session?.user?.id;
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
          status: method === "TRANSFER" ? "PENDING" : "SUCCESS",
          month: parseInt(month),
          year: parseInt(year),
          notes,
          createdById: currentUserId || null, // Bisa null jika belum login, tapi sebaiknya di-handle di UI agar hanya admin yang bisa akses
        },
        include: { student: true }
      });

      // 3. Logika penambahan sesi (Hanya jika RENEWAL, REGISTRATION, atau REACTIVATION)
      // Deposit biasanya uang muka, bisa jadi belum nambah sesi tergantung aturan bisnis Anda
      const sessionBoostingCategories = ["REGISTRATION", "RENEWAL", "REACTIVATION",];
      
      if (sessionBoostingCategories.includes(category) && method !== "TRANSFER") {
      const student = await tx.student.findUnique({
        where: { id: studentId },
        include: { package: true }
      });

      if (student?.package) {
        await tx.student.update({
          where: { id: studentId },
          data: {
            remainingSesi: { increment: student.package.sesiCredit },
            // Opsional: Langsung set status ACTIVE jika bayar Cash
            status: "ACTIVE" 
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