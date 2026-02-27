"use server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { sendFonneNotification } from "@/lib/fonnte";
import { auth } from "@/lib/auth";


export async function getAllStudents() {
  try {
    const students = await prisma.student.findMany({
      include: {
        location: {
          select: {
            name: true, // Mengambil nama lokasi/cabang
          }
        },
        _count: {
          select: { attendances: true }
        }
      },
      orderBy: {
        fullName: 'asc',
      },
    });

    // Kita transform data agar lebih mudah dibaca oleh komponen UI
    return students.map(s => ({
      ...s,
      locationName: s.location?.name || "No Location",
      totalAttendances: s._count.attendances
    }));
  } catch (error) {
    console.error("Error fetching students:", error);
    return [];
  }
}

export async function createStudent(formData: any) {
  const session = await auth();
  const currentUserId = session?.user?.id;
  try {
    // 1. Ambil data referensi paket terlebih dahulu
    const pkg = await prisma.package.findUnique({
      where: { id: formData.packageId }
    });
    
    if (!pkg) throw new Error("Paket tidak ditemukan");

    // 2. Gunakan TRANSACTION untuk Database
    // Jika ada error di dalam sini, Student dan Payment TIDAK AKAN tersimpan
    const transactionResult = await prisma.$transaction(async (tx) => {
  // 1. Tentukan jumlah sesi awal berdasarkan metode pembayaran
  // Jika Cash, langsung beri sesi dari paket. Jika Transfer, mulai dari 0.
      const initialSesi = formData.method === "CASH" ? pkg.sesiCredit : 0;
      const paymentMethod = formData.method || "TRANSFER";

      const student = await tx.student.create({
        data: {
          fullName: formData.fullName,
          nickname: formData.nickname,
          parentName: formData.parentName,
          parentContact: formData.parentContact,
          locationId: formData.locationId,
          packageId: formData.packageId,
          subjectId: formData.subjectId,
          status: "NEWSTUDENT",
          // Logika Sesi Disini
          remainingSesi: initialSesi, 
        },
      });

      await tx.payment.create({
        data: {
          studentId: student.id,
          amount: pkg.price,
          // Jika Cash, anggap sudah lunas (SUCCESS/PAID). Jika Transfer, PENDING.
          status: formData.method === "CASH" ? "SUCCESS" : "PENDING",
          category: "REGISTRATION",
          notes: "NEWSTUDENT",
          method: paymentMethod, // Ambil dari formData (CASH atau TRANSFER) default TRANSFER
          createdById: currentUserId || null,
        }
      });

      return student;
    });

    // 3. KIRIM WA HANYA JIKA TRANSACTION DI ATAS BERHASIL
    // Taruh di luar block try jika ingin memastikan database aman dulu
    if (transactionResult) {
      // 1. Pengaturan Data Bank (Sesuaikan dengan rekening kamu)
      const bankInfo = {
        nama: "BCA",
        nomor: "1234567890",
        pemilik: "ADMIN BIMBEL CERDAS"
      };

      // 2. Notifikasi WhatsApp ke ADMIN
      const adminMsg = 
        `*🔔 PENDAFTARAN SISWA BARU*\n\n` +
        `Telah masuk pendaftaran baru:\n` +
        `• *Nama:* ${transactionResult.fullName}\n` +
        `• *Ortu:* ${transactionResult.parentName}\n` +
        `• *Paket:* ${pkg.name}\n` +
        `• *Tagihan:* Rp ${pkg.price.toLocaleString('id-ID')}\n\n` +
        `Silakan cek dashboard untuk verifikasi pembayaran.`;

      await sendFonneNotification(
        process.env.ADMIN_PHONE_NUMBER || "6289670431969",
        adminMsg
      );

      // 3. Notifikasi WhatsApp ke ORANG TUA
      if (transactionResult.parentContact) {
        const parentMsg = 
          `Halo Ayah/Bunda *${transactionResult.parentName}*,\n\n` +
          `Pendaftaran Ananda *${transactionResult.fullName}* telah kami terima. ✨\n\n` +
          `*DETAIL TAGIHAN:*\n` +
          `--------------------------------\n` +
          `• Paket: ${pkg.name}\n` +
          `• Total Tagihan: *Rp ${pkg.price.toLocaleString('id-ID')}*\n` +
          `--------------------------------\n\n` +
          `*INSTRUKSI PEMBAYARAN:*\n` +
          `Mohon selesaikan transfer ke rekening berikut:\n\n` +
          `🏦 *Bank ${bankInfo.nama}*\n` +
          `💳 No. Rek: *${bankInfo.nomor}*\n` +
          `👤 A/N: *${bankInfo.pemilik}*\n\n` +
          `Setelah transfer, silakan kirimkan *Bukti Bayar* dengan membalas pesan ini untuk aktivasi sesi belajar Ananda.\n\n` +
          `Terima kasih! 🙏`;

        await sendFonneNotification(
          transactionResult.parentContact,
          parentMsg
        );
      }
    }

    revalidatePath("/admin/data-siswa");
    return { success: true };

  } catch (error) {
    // Jika ada error di langkah mana pun, kode di bawah ini yang jalan
    console.error("Critical Error during registration:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Gagal mendaftarkan siswa" 
    };
  }
}

export async function getFormDataReferences() {
  try {
    const [locations, packages, subjects] = await Promise.all([
      // Mengambil lokasi belajar
      prisma.location.findMany({ 
        select: { id: true, name: true },
        orderBy: { name: 'asc' }
      }),
      // Mengambil paket (Penting: Sertakan price dan sesiCredit untuk kalkulasi Payment)
      prisma.package.findMany({ 
        select: { 
          id: true, 
          name: true, 
          sesiCredit: true,
          price: true // Dibutuhkan untuk mengisi amount di tabel Payment
        },
        orderBy: { sesiCredit: 'asc' }
      }),
      // Mengambil mata pelajaran
      prisma.subject.findMany({ 
        select: { id: true, name: true },
        orderBy: { name: 'asc' }
      }),
    ]);

    return { 
      locations, 
      packages, 
      subjects,
      success: true 
    };
  } catch (error) {
    console.error("Error fetching form references:", error);
    return { 
      locations: [], 
      packages: [], 
      subjects: [], 
      success: false 
    };
  }
}