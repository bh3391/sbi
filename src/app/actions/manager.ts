"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createRoom(formData: FormData) {
  const name = formData.get("name") as string;
  const locationId = formData.get("locationId") as string;

  if (!name || !locationId) return { error: "Nama dan Lokasi wajib diisi" };

  try {
    await prisma.room.create({
      data: {
        name,
        locationId,
      },
    });
    revalidatePath("/admin/manager");
    return { success: true };
  } catch (error) {
    return { error: "Gagal menambahkan ruangan" };
  }
}

export async function createLocation(formData: FormData) {
  const name = formData.get("name") as string;
  const address = formData.get("address") as string;
  // Tambahan field sesuai schema
  const lat = formData.get("latitude") ? parseFloat(formData.get("latitude") as string) : null;
  const lng = formData.get("longitude") ? parseFloat(formData.get("longitude") as string) : null;
  const radius = formData.get("radius") ? parseInt(formData.get("radius") as string) : 1000;

  if (!name) return { error: "Nama lokasi wajib diisi" };

  try {
    await prisma.location.create({
      data: {
        name,
        address,
        latitude: lat,
        longitude: lng,
        radius: radius,
      },
    });
    revalidatePath("/admin/manager");
    return { success: true };
  } catch (error) {
    return { error: "Gagal menambahkan lokasi" };
  }
}

// Action untuk Sesi
export async function createStudentSession(formData: FormData) {
  const name = formData.get("name") as string;
  const startTime = formData.get("startTime") as string;
  const endTime = formData.get("endTime") as string;

  try {
    await prisma.studentSession.create({
      data: { name, startTime, endTime },
    });
    revalidatePath("/admin/manager");
    return { success: true };
  } catch (error) {
    return { error: "Gagal membuat sesi" };
  }
}

// Action untuk Mapel

export async function createSubject(formData: FormData) {
  const name = formData.get("name") as string; // Contoh: "Matematika"

  if (!name) return { error: "Nama mata pelajaran wajib diisi" };

  try {
    await prisma.subject.create({
      data: {
        name,
      },
    });
    revalidatePath("/admin/manager");
    return { success: true };
  } catch (error) {
    // Menangani error jika nama mapel sudah ada (Unique constraint)
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return { error: "Mata pelajaran ini sudah terdaftar" };
    }
    console.error("Error creating subject:", error);
    return { error: "Gagal menambahkan mata pelajaran" };
  }
}

/**
 * ACTION: DELETE LOCATION
 */
export async function deleteLocation(id: string) {
  try {
    await prisma.location.delete({
      where: { id },
    });
    revalidatePath("/admin/manager");
    return { success: true };
  } catch (error: any) {
    // Cek jika error karena masih ada relasi (P2003 adalah kode error Prisma untuk constraint)
    if (error.code === 'P2003') {
      return { error: "Gagal hapus: Cabang ini masih memiliki ruangan atau siswa." };
    }
    return { error: "Gagal menghapus lokasi" };
  }
}

/**
 * ACTION: DELETE ROOM
 */
export async function deleteRoom(id: string) {
  try {
    await prisma.room.delete({
      where: { id },
    });
    revalidatePath("/admin/manager");
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2003') {
      return { error: "Gagal hapus: Ruangan ini masih digunakan dalam jadwal." };
    }
    return { error: "Gagal menghapus ruangan" };
  }
}

/**
 * ACTION: DELETE STUDENT SESSION
 */
export async function deleteStudentSession(id: string) {
  try {
    await prisma.studentSession.delete({
      where: { id },
    });
    revalidatePath("/admin/manager");
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2003') {
      return { error: "Gagal hapus: Sesi ini masih digunakan dalam jadwal." };
    }
    return { error: "Gagal menghapus sesi" };
  }
}

/**
 * ACTION: DELETE SUBJECT
 */
export async function deleteSubject(id: string) {
  try {
    await prisma.subject.delete({
      where: { id },
    });
    revalidatePath("/admin/manager");
    return { success: true };
  } catch (error) {
    return { error: "Gagal menghapus mata pelajaran" };
  }
}