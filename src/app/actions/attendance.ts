"use server";

import prisma from "@/lib/prisma";
import { AttendanceStatus, ProcessStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

export async function saveAttendanceAction(data: any[], teacherId: string) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const logs = [];

      for (const item of data) {
        // 1. Tentukan status proses akhir
        let finalProcessStatus = item.processStatus;
        if (item.status === "HADIR" || item.status === "ALPA") {
          finalProcessStatus = "DONE";
        }

        // 2. PROTEKSI: Ambil data murid terbaru untuk cek sisa sesi
        const currentStudent = await tx.student.findUnique({
          where: { id: item.studentId },
          select: { remainingSesi: true, addOnSesi: true, nickname: true },
        });

        if (!currentStudent) {
          throw new Error(`Siswa dengan ID ${item.studentId} tidak ditemukan.`);
        }

        // 3. Logika Potong Sesi & Validasi Minus
        if (item.status === "HADIR" || item.status === "ALPA") {
          if (item.isAddon) {
            // Validasi Kuota Add-on
            if ((currentStudent.addOnSesi || 0) <= 0) {
              throw new Error(
                `Kuota Add-on untuk ${currentStudent.nickname} sudah habis (0).`,
              );
            }

            await tx.student.update({
              where: { id: item.studentId },
              data: { addOnSesi: { decrement: 1 } },
            });
          } else {
            // Validasi Kuota Reguler
            if ((currentStudent.remainingSesi || 0) <= 0) {
              throw new Error(
                `Kuota Reguler untuk ${currentStudent.nickname} sudah habis (0).`,
              );
            }

            await tx.student.update({
              where: { id: item.studentId },
              data: { remainingSesi: { decrement: 1 } },
            });
          }
        }

        if (item.isAddon && !item.addOn) {
          console.error(
            `Peringatan: Murid ${item.studentId} ditandai Add-on tapi ID program (addOn) KOSONG.`,
          );
        }

        // 4. Simpan Log Absensi (Hanya jika lolos validasi kuota di atas)
        const log = await tx.attendanceLog.create({
          data: {
            studentId: item.studentId,
            teacherId: teacherId,
            subjectId: item.subjectId,
            sessionId: item.sessionId,
            status: item.status,
            processStatus: finalProcessStatus || "LISTED",
            score: item.score,
            materi: item.materi,
            evaluation: item.evaluation || "",
            isAddon: item.isAddon === true,
            addonId: item.isAddon ? item.addOn : null,
            rescheduleDate: item.rescheduleDate
              ? new Date(item.rescheduleDate)
              : null,
          },
        });

        logs.push(log);
      }
      return logs;
    });

    revalidatePath("/guru/agenda");
    return {
      success: true,
      message: `Berhasil! ${result.length} laporan disimpan.`,
    };
  } catch (error: any) {
    console.error("Database Error:", error);
    // Mengembalikan pesan error yang spesifik (misal: "Kuota habis") ke UI
    return {
      success: false,
      message: error.message || "Gagal menyimpan ke database.",
    };
  }
}

export async function getStudentLogs(
  studentId: string,
  startDate?: string,
  endDate?: string,
) {
  try {
    let whereClause: any = { studentId };

    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        whereClause.createdAt.lte = end;
      }
    }

    const logs = await prisma.attendanceLog.findMany({
      where: whereClause,
      include: {
        subject: true,
        session: true,
      },
      // Kita tetap urutkan berdasarkan waktu terbaru sebagai cadangan
      orderBy: { createdAt: "desc" },
    });

    // --- LOGIKA SORTING STATUS ---
    // Definisikan bobot urutan: LISTED (1), SCHEDULED (2), DONE (3)
    const statusPriority: Record<string, number> = {
      LISTED: 1,
      SCHEDULED: 2,
      DONE: 3,
    };

    const sortedLogs = [...logs].sort((a, b) => {
      // Ambil prioritas, jika status tidak terdaftar beri angka besar (99)
      const priorityA = statusPriority[a.status] || 99;
      const priorityB = statusPriority[b.status] || 99;

      // Jika statusnya berbeda, urutkan berdasarkan LISTED -> SCHEDULED -> DONE
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      // Jika statusnya SAMA, urutkan berdasarkan waktu terbaru (createdAt desc)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return {
      success: true,
      data: sortedLogs,
    };
  } catch (error) {
    console.error("Error fetching logs:", error);
    return {
      success: false,
      data: [],
      message: "Terjadi kesalahan pada server",
    };
  }
}

export async function updateProcessStatusAction(
  logId: string,
  newStatus: string,
  newDate?: string, // Tambahkan parameter opsional untuk tanggal baru
) {
  try {
    // Siapkan objek data untuk diupdate
    const updatePayload: any = {
      processStatus: newStatus as any,
    };

    // Jika ada newDate (dari fitur Reschedule), update juga field tanggalnya
    if (newDate) {
      // Tambahkan jam 12:00 agar tidak terkena pergeseran timezone UTC
      updatePayload.rescheduleDate = new Date(`${newDate}T12:00:00`);
    }

    const updated = await prisma.attendanceLog.update({
      where: { id: logId },
      data: updatePayload,
    });

    // Revalidasi agar UI terupdate tanpa refresh manual
    revalidatePath("/absensi");

    return {
      success: true,
      message: `Status berhasil diubah ke ${newStatus}${newDate ? " dengan tanggal baru" : ""}`,
      data: updated,
    };
  } catch (error) {
    console.error("Update Status Error:", error);
    return {
      success: false,
      message: "Gagal memperbarui status ke database.",
    };
  }
}

export async function checkInTeacherAction(locationData?: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  try {
    const now = new Date();
    // Logika menentukan LATE (Misal jam masuk adalah 08:00)
    const status =
      now.getHours() >= 8 && now.getMinutes() > 0 ? "LATE" : "ON_TIME";

    await prisma.teacherAttendance.create({
      data: {
        teacherId: session.user.id,
        status: status,
        location: locationData || "Office",
      },
    });

    revalidatePath("/guru/absensi");
    return { success: true, message: "Berhasil Absen!" };
  } catch (error) {
    return { success: false, message: "Gagal memproses absen." };
  }
}

export async function updateStudentStatusToDone(taskId: string) {
  try {
    await prisma.attendanceLog.update({
      where: { id: taskId },
      data: { processStatus: "DONE" }, // Pastikan value "DONE" sesuai dengan Enum/String di Prisma Anda
    });

    revalidatePath("/guru/absensi"); // Refresh data agar UI terupdate
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Gagal memperbarui status" };
  }
}
