"use server";

import  prisma  from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { getDistance } from "geolib";

export async function getTeacherDashboardData() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const teacherId = session.user.id;

  // Ambil Profil, Riwayat Absen Guru, dan Log Siswa Listed secara paralel
  const [profile, personalAttendance, pendingTasks] = await Promise.all([
    prisma.user.findUnique({ where: { id: teacherId } }),
    prisma.teacherAttendance.findMany({
      where: { teacherId },
      orderBy: { createdAt: 'desc' },
      take: 5
    }),
    prisma.attendanceLog.findMany({
      where: { 
        teacherId, 
        processStatus: { in: ['LISTED', 'SCHEDULED'] } 
      },
      include: { student: true },
      orderBy: { createdAt: 'desc' }
    })
  ]);

  return { profile, personalAttendance, pendingTasks };
}
export async function getTeacherAttendanceHistory(teacherId: string) {
  return await prisma.teacherAttendance.findMany({
    where: { teacherId },
    orderBy: { createdAt: 'desc' },
  });
}
export async function getAllTeacherAttendanceByDate(teacherId: string, date: Date) {
  try {
    const logs = await prisma.teacherAttendance.findMany({
      where: { teacherId, /* ... filter tanggal ... */ },
      orderBy: { createdAt: 'desc' },
    });

    // Bungkus dalam objek
    return { 
      success: true, 
      data: logs // logs adalah array yang tadi menyebabkan error
    };
  } catch (error) {
    return { success: false, data: [], message: "Gagal memuat data" };
  }
}

export async function getTeacherAttendanceByStatus(teacherId: string, status: "LATE" | "ON_TIME" | "LEAVE") {
  return await prisma.teacherAttendance.findMany({
    where: { teacherId, status },
    orderBy: { createdAt: 'desc' },
  });
}

export async function handleTeacherCheckIn(scannedQrId: string, userCoords: { lat: number, lng: number }) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  try {
    // 1. Ambil data User untuk verifikasi QR
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) return { success: false, message: "User tidak ditemukan" };

    // 2. VALIDASI QR: Cek apakah hasil scan sama dengan qrCodeId unik milik User
    if (user.qrCodeId !== scannedQrId) {
      return { success: false, message: "QR Code tidak cocok dengan akun Anda!" };
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const existingAttendance = await prisma.teacherAttendance.findFirst({
      where: {
        teacherId: user.id,
        date: { gte: startOfDay, lte: endOfDay }
      }
    });

    if (existingAttendance) {
      return { success: false, message: "Anda sudah melakukan absensi hari ini." };
    }

    // 3. CARI LOKASI TERDEKAT: Ambil semua lokasi dan cari yang masuk dalam radius
    const allLocations = await prisma.location.findMany();
    
    // Cari lokasi di mana jarak user ke lokasi tersebut <= radius lokasi
    const nearbyLocation = allLocations.find((loc) => {
      if (!loc.latitude || !loc.longitude) return false;
      
      const distance = getDistance(
        { latitude: userCoords.lat, longitude: userCoords.lng },
        { latitude: loc.latitude, longitude: loc.longitude }
      );
      
      return distance <= (loc.radius || 200); // Default 100 meter
    });

    if (!nearbyLocation) {
      return { 
        success: false, 
        message: "Anda tidak berada di radius lokasi kantor manapun yang terdaftar." 
      };
    }

    // 4. LOGIKA WAKTU (Late/On-Time)
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    let isLate = false;

    if (user.role === "TEACHER") {
      if (currentHour > 13 || (currentHour === 13 && currentMinute > 20)) isLate = true;
    } else if (user.role === "ADMIN") {
      if (currentHour >= 11) isLate = true;
    }

    // 5. SIMPAN KE TeacherAttendance
    await prisma.teacherAttendance.create({
      data: {
        teacherId: user.id,
        status: isLate ? "LATE" : "ON_TIME",
        location: nearbyLocation.name, // Nama lokasi diambil dari yang terdekat tadi
        type: "HADIR",
        date: now,
        checkIn: now,
      }
    });

    revalidatePath("/guru/absensi");
    return { 
      success: true, 
      message: `Berhasil Absen di ${nearbyLocation.name} (${isLate ? 'Terlambat' : 'Tepat Waktu'})` 
    };

  } catch (e) {
    console.error(e);
    return { success: false, message: "Terjadi kesalahan sistem" };
  }
}

// Tambahkan handleTeacherCheckOut yang menerima parameter jika perlu validasi QR saat pulang
export async function handleTeacherCheckOut() {
  const session = await auth();
  
  // 1. Validasi Sesi
  if (!session?.user?.id) {
    return { success: false, message: "Sesi habis, silakan login kembali." };
  }

  try {
    const today = new Date();
    // Reset jam ke 00:00 untuk mencari data hari ini saja
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const endOfToday = new Date(today.setHours(23, 59, 59, 999));

    // 2. Cari data absen 'PRESENT' hari ini yang BELUM checkOut
    const activeAttendance = await prisma.teacherAttendance.findFirst({
      where: {
        teacherId: session.user.id,
        type: "HADIR",
        date: {
          gte: startOfToday,
          lte: endOfToday,
        },
        checkOut: null, // Mencari yang masih menggantung
      },
      orderBy: {
        createdAt: 'desc', // Ambil yang paling terbaru jika ada duplikasi
      }
    });

    if (!activeAttendance) {
      return { 
        success: false, 
        message: "Data absen masuk tidak ditemukan atau Anda sudah check-out." 
      };
    }

    // 3. Update data dengan waktu Check-Out sekarang
    await prisma.teacherAttendance.update({
      where: { id: activeAttendance.id },
      data: {
        checkOut: new Date(),
      }
    });

    // 4. Refresh Cache UI Guru
    revalidatePath("/guru/absensi");

    return { 
      success: true, 
      message: "Berhasil Check-Out. Terima kasih untuk dedikasinya hari ini!" 
    };

  } catch (error) {
    console.error("Check-Out Error:", error);
    return { 
      success: false, 
      message: "Gagal memproses Check-Out. Silakan coba lagi." 
    };
  }
}

// 2. Fungsi Izin / Sakit / Cuti
export async function handleSubmitLeave(type: "IZIN" | "SAKIT" | "CUTI", notes: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false };

  try {
    await prisma.teacherAttendance.create({
      data: {
        teacherId: session.user.id,
        type: type,
        status: "LEAVE",
        notes: notes,
        location: "Remote",
        // Untuk izin, kita anggap checkIn & checkOut adalah waktu saat melapor
        checkIn: new Date(),
        checkOut: new Date()
      }
    });

    revalidatePath("/guru/absensi");
    return { success: true };
  } catch (e) {
    return { success: false };
  }
}