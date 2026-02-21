"use server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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
  try {
    // 1. Ambil data kredit sesi dari package yang dipilih
    let initialSesi = 0;
    if (formData.packageId) {
      const pkg = await prisma.package.findUnique({
        where: { id: formData.packageId }
      });
      initialSesi = pkg?.sesiCredit || 0;
    }

    // 2. Simpan ke database
    await prisma.student.create({
    data: {
      fullName: formData.fullName,
      nickname: formData.nickname,
      parentName: formData.parentName, // Tambahan
      parentContact: formData.parentContact,
      locationId: formData.locationId,
      packageId: formData.packageId,
      subjectId: formData.subjectId,
      status: formData.status || "ACTIVE", // Default Active
      remainingSesi: initialSesi,
      imageProfile: formData.imageProfileUrl || null, // Sesuaikan dengan storage kamu
    },
  });

    revalidatePath("/admin/data-siswa");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Gagal mendaftarkan siswa" };
  }
}
export async function getFormDataReferences() {
  const [locations, packages, subjects] = await Promise.all([
    prisma.location.findMany({ select: { id: true, name: true } }),
    prisma.package.findMany({ select: { id: true, name: true, sesiCredit: true } }),
    prisma.subject.findMany({ select: { id: true, name: true } }),
  ]);

  return { locations, packages, subjects };
}
