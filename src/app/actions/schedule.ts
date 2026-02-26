"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createSchedule(formData: FormData) {
  const roomId = formData.get("roomId") as string;
  const day = formData.get("day") as string;
  const sessionId = formData.get("sessionId") as string;
  const teacherId = formData.get("teacherId") as string;
  const subjectId = formData.get("subjectId") as string;
  const studentIds = formData.getAll("studentIds") as string[];

  if (!roomId || !day || !sessionId || !teacherId || !subjectId) {
    return { error: "Semua field wajib diisi!" };
  }

  if (studentIds.length === 0) return { error: "Pilih minimal 1 murid!" };
  if (studentIds.length > 5) return { error: "Maksimal 5 murid per jadwal!" };

  try {
    await prisma.schedule.create({
      data: {
        day,
        roomId,
        sessionId,
        teacherId,
        subjectId,
        students: {
          connect: studentIds.map((id) => ({ id })),
        },
      },
    });

    revalidatePath("/admin/jadwal/[locationId]", "page");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Gagal membuat jadwal. Cek apakah ada bentrok guru/ruangan." };
  }
}


// UPDATE JADWAL
export async function updateSchedule(scheduleId: string, formData: FormData) {
  const sessionId = formData.get("sessionId") as string;
  const teacherId = formData.get("teacherId") as string;
  const subjectId = formData.get("subjectId") as string;
  const studentIds = formData.getAll("studentIds") as string[];

  try {
    await prisma.schedule.update({
      where: { id: scheduleId },
      data: {
        sessionId,
        teacherId,
        subjectId,
        students: {
          set: studentIds.map((id) => ({ id })), // Mengganti list murid lama
        },
      },
    });

    revalidatePath("/admin/jadwal/[locationId]", "page");
    return { success: true };
  } catch (error) {
    return { error: "Gagal memperbarui jadwal." };
  }
}

// DELETE JADWAL
export async function deleteSchedule(id: string) {
  try {
    await prisma.schedule.delete({ where: { id } });
    revalidatePath("/admin/jadwal/[locationId]", "page");
    return { success: true };
  } catch (error) {
    return { error: "Gagal menghapus jadwal." };
  }
}