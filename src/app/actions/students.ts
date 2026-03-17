"use server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { sendFonneNotification } from "@/lib/fonnte";
import { auth } from "@/lib/auth";
import { StudentStatus } from "@prisma/client";

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
  const REG_FEE = 150000; // Biaya Pendaftaran Tetap

  try {
    // 1. Ambil data paket
    const pkg = await prisma.package.findUnique({
      where: { id: formData.packageId }
    });
    
    if (!pkg) throw new Error("Paket tidak ditemukan");

    // Total yang harus dibayar (Paket + Registrasi)
    const totalInitialAmount = Number(pkg.price) + REG_FEE;

    const transactionResult = await prisma.$transaction(async (tx) => {
      // Sesi hanya diberikan langsung jika bayar CASH
      const initialSesi = formData.method === "CASH" ? pkg.sesiCredit : 0;
      const paymentStatus = formData.method === "CASH" ? "SUCCESS" : "PENDING";

      // 1. Buat Data Siswa
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
          remainingSesi: initialSesi, 
        },
      });

      // 2. Buat Satu Record Pembayaran Gabungan
      await tx.payment.create({
        data: {
          studentId: student.id,
          amount: totalInitialAmount, // Nominal Gabungan
          status: paymentStatus,
          category: "REGISTRATION", // Tetap kategori REGISTRATION karena ini pendaftaran awal
          method: formData.method || "TRANSFER",
          notes: `PENDAFTARAN + PAKET ${pkg.name.toUpperCase()}`,
          createdById: currentUserId || null,
        }
      });

      return { student, totalAmount: totalInitialAmount };
    });

    // --- NOTIFIKASI WHATSAPP ---
    if (transactionResult) {
      const { student, totalAmount } = transactionResult;
      
      // Notifikasi Ortu (Dibuat sangat jelas rinciannya agar tidak bingung)
      if (student.parentContact) {
        const parentMsg = 
          `Halo Ayah/Bunda *${student.parentName}*,\n\n` +
          `Pendaftaran Ananda *${student.fullName}* berhasil kami catat. ✨\n\n` +
          `*DETAIL PEMBAYARAN:*\n` +
          `--------------------------------\n` +
          `• Biaya Registrasi : Rp ${REG_FEE.toLocaleString('id-ID')}\n` +
          `• Paket ${pkg.name} : Rp ${pkg.price.toLocaleString('id-ID')}\n` +
          `--------------------------------\n` +
          `*TOTAL TRANSFER : Rp ${totalAmount.toLocaleString('id-ID')}*\n` +
          `--------------------------------\n\n` +
          `*TRANSFER KE REKENING:*\n` +
          `🏦 *BCA - 1234567890*\n` +
          `👤 *A/N ADMIN BIMBEL*\n\n` +
          `Mohon kirimkan *Bukti Transfer* untuk aktivasi akun Ananda. Terima kasih! 🙏`;

        await sendFonneNotification(student.parentContact, parentMsg);
      }
    }

    revalidatePath("/admin/data-siswa");
    return { success: true };

  } catch (error) {
    console.error("Registration Error:", error);
    return { success: false, message: "Gagal mendaftarkan siswa" };
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

export async function updateStudent(id: string, formData: any) {
  try {
    await prisma.student.update({
      where: { id },
      data: {
        fullName: formData.fullName,
        nickname: formData.nickname,
        parentName: formData.parentName,
        parentContact: formData.parentContact,
        locationId: formData.locationId,
        packageId: formData.packageId,
        subjectId: formData.subjectId,
        status: formData.status, // Penting untuk bisa ubah status ke SUSPEND/ACTIVE
        remainingSesi: formData.remainingSesi, // Memungkinkan admin koreksi sesi
      },
    });

    revalidatePath("/admin/data-siswa");
    return { success: true, message: "Data siswa berhasil diperbarui" };
  } catch (error) {
    console.error("Update Student Error:", error);
    return { success: false, message: "Gagal memperbarui data siswa" };
  }
}

export async function updateStudentStatus(studentId: string, newStatus: string) {
  try {
    await prisma.student.update({
      where: { id: studentId },
      data: { status: newStatus as StudentStatus },
    });

    revalidatePath("/admin/data-siswa");
    return { success: true };
  } catch (error) {
    console.error("UPDATE_STATUS_ERROR:", error);
    return { success: false, message: "Gagal memperbarui status" };
  }
}