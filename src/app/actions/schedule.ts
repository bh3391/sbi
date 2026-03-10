"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createSchedule(formData: FormData) {
  // 1. Ekstraksi Data dari FormData
  const roomId = formData.get("roomId") as string;
  const day = formData.get("day") as string;
  const sessionId = formData.get("sessionId") as string;
  const teacherId = formData.get("teacherId") as string;
  const subjectId = formData.get("subjectId") as string;
  const studentIds = formData.getAll("studentIds") as string[];

  // 2. Validasi Input Dasar
  if (!roomId || !day || !sessionId || !teacherId || !subjectId) {
    return { error: "Semua field wajib diisi!" };
  }

  if (studentIds.length === 0) return { error: "Pilih minimal 1 murid!" };
  if (studentIds.length > 5) return { error: "Maksimal 5 murid per jadwal!" };

  try {
    // 3. PENGECEKAN BENTROK (Ruangan ATAU Guru)
    // Kita cek apakah pada Hari & Sesi yang sama, Ruangan atau Guru sudah terpakai
    const conflict = await prisma.schedule.findFirst({
      where: {
        day: day,
        sessionId: sessionId,
        OR: [
          { roomId: roomId },      // Cek apakah ruangan sudah dipakai
          { teacherId: teacherId } // Cek apakah guru sedang mengajar di kelas lain
        ]
      },
      include: {
        room: true,
        teacher: true
      }
    });

    if (conflict) {
      if (conflict.roomId === roomId) {
        return { error: `Ruangan ${conflict.room.name} sudah terisi pada hari ${day} sesi ini!` };
      }
      if (conflict.teacherId === teacherId) {
        return { error: `Guru ${conflict.teacher.name} sudah memiliki jadwal mengajar di jam ini!` };
      }
    }

    // 4. PROSES SIMPAN JADWAL
    const newSchedule = await prisma.schedule.create({
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
      include: {
        subject: true,
        session: true
      }
    });

    
    revalidatePath("/admin/jadwal/[locationId]", "page");
    
    return { success: true, message: "Jadwal berhasil dibuat!" };

  } catch (error) {
    console.error("DATABASE_ERROR:", error);
    return { error: "Terjadi kesalahan sistem saat menyimpan jadwal." };
  }
}


// UPDATE JADWAL
export async function updateSchedule(scheduleId: string, formData: FormData) {
  const roomId = formData.get("roomId") as string; // Tambahkan roomId jika bisa diubah
  const day = formData.get("day") as string;       // Tambahkan day jika bisa diubah
  const sessionId = formData.get("sessionId") as string;
  const teacherId = formData.get("teacherId") as string;
  const subjectId = formData.get("subjectId") as string;
  const studentIds = formData.getAll("studentIds") as string[];

  // 1. Validasi Input Dasar
  if (!sessionId || !teacherId || !subjectId || studentIds.length === 0) {
    return { error: "Lengkapi semua data dan pilih minimal 1 murid!" };
  }

  try {
    // 2. AMBIL DATA LAMA (Untuk mendapatkan roomId dan day jika tidak ada di formData)
    const currentSchedule = await prisma.schedule.findUnique({
      where: { id: scheduleId }
    });

    if (!currentSchedule) return { error: "Jadwal tidak ditemukan!" };

    const targetRoomId = roomId || currentSchedule.roomId;
    const targetDay = day || currentSchedule.day;

    // 3. CEK BENTROK (Kecuali jadwal ini sendiri)
    const conflict = await prisma.schedule.findFirst({
      where: {
        id: { not: scheduleId }, // KUNCI: Jangan cek diri sendiri
        day: targetDay,
        sessionId: sessionId,
        OR: [
          { roomId: targetRoomId },
          { teacherId: teacherId }
        ]
      },
      include: {
        room: true,
        teacher: true
      }
    });

    if (conflict) {
      const msg = conflict.roomId === targetRoomId 
        ? `Ruangan ${conflict.room.name} sudah terisi!` 
        : `Guru ${conflict.teacher.name} sudah mengajar di kelas lain!`;
      return { error: msg };
    }

    // 4. EKSEKUSI UPDATE
    await prisma.schedule.update({
      where: { id: scheduleId },
      data: {
        day: targetDay,
        roomId: targetRoomId,
        sessionId,
        teacherId,
        subjectId,
        students: {
          // 'set' akan menghapus relasi lama dan menggantinya dengan yang baru
          set: studentIds.map((id) => ({ id })), 
        },
      },
    });

    revalidatePath("/admin/jadwal/[locationId]", "page");
    return { success: true, message: "Jadwal berhasil diperbarui!" };

  } catch (error) {
    console.error("UPDATE_ERROR:", error);
    return { error: "Gagal memperbarui jadwal karena kesalahan server." };
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