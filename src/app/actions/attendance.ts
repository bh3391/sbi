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
        // Logika Otomatis: Jika HADIR, processStatus otomatis DONE
        let finalProcessStatus = item.processStatus;
        if (item.status === "HADIR") finalProcessStatus = "DONE";
        if (item.status === "ALPA") finalProcessStatus = "DONE";

        // 1. Simpan Log Absensi
        const log = await tx.attendanceLog.create({
          data: {
            studentId: item.studentId,
            teacherId: teacherId,
            subjectId: item.subjectId,
            sessionId: item.sessionId,
            status: item.status as AttendanceStatus,
            processStatus: (finalProcessStatus || "LISTED") as ProcessStatus,
            score: item.score,
            materi: item.materi,
            rescheduleDate: item.rescheduleDate ? new Date(item.rescheduleDate) : null,
          },
        });

        // 2. Logika Potong Sesi (Hanya jika HADIR atau DONE)
        if (item.status === "HADIR" || finalProcessStatus === "DONE") {
          await tx.student.update({
            where: { id: item.studentId },
            data: {
              remainingSesi: {
                decrement: 1,
              },
            },
          });
        }
        logs.push(log);
      }
      return logs;
    });

    revalidatePath("/guru/absensi-siswa");
    return { success: true, message: `${result.length} Laporan berhasil disimpan.` };
  } catch (error: any) {
    console.error("Database Error:", error);
    return { success: false, message: "Gagal menyimpan ke database." };
  }
}

export async function getStudentLogs(studentId: string, startDate?: string, endDate?: string) {
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
      orderBy: { createdAt: "desc" },
    });

    // SELALU kembalikan objek dengan success: true dan data: [] jika kosong
    return { 
      success: true, 
      data: logs || [] 
    };
  } catch (error) {
    console.error(error);
    return { 
      success: false, 
      data: [], 
      message: "Terjadi kesalahan pada server" 
    };
  }
}

export async function updateProcessStatusAction(
  logId: string, 
  newStatus: string, 
  newDate?: string // Tambahkan parameter opsional untuk tanggal baru
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
      message: `Status berhasil diubah ke ${newStatus}${newDate ? ' dengan tanggal baru' : ''}`, 
      data: updated 
    };
  } catch (error) {
    console.error("Update Status Error:", error);
    return { 
      success: false, 
      message: "Gagal memperbarui status ke database." 
    };
  }
}

export async function checkInTeacherAction(locationData?: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  try {
    const now = new Date();
    // Logika menentukan LATE (Misal jam masuk adalah 08:00)
    const status = now.getHours() >= 8 && now.getMinutes() > 0 ? "LATE" : "ON_TIME";

    await prisma.teacherAttendance.create({
      data: {
        teacherId: session.user.id,
        status: status,
        location: locationData || "Office",
      }
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