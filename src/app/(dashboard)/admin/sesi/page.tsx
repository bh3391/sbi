import { auth } from "@/lib/auth"; // Sesuaikan dengan library auth Anda
import prisma from "@/lib/prisma";
import TeacherAgendaClient from "./TeacherAgendaClient";
import { getCurrentDayName } from "@/app/actions/schedule";

export default async function TeacherAgendaPage() {
  const session = await auth();
  const userId = session?.user?.id;

  // 1. Ambil data guru yang sedang login
  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, nickname: true }
  });

  // 2. Ambil semua daftar guru (untuk dropdown Admin)
  const allTeachers = await prisma.user.findMany({
    where: { role: "TEACHER" },
    select: { id: true, nickname: true, name: true },
    orderBy: { nickname: 'asc' }
  });

  const today = await getCurrentDayName();
  // 3. Ambil jadwal hari ini (Indonesian Day)
  // const today = new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(new Date());

  const initialSchedules = await prisma.schedule.findMany({
    where: {
      // Gunakan ID pertama jika admin belum memilih guru
      teacherId: currentUser?.role === "TEACHER" ? currentUser.id : allTeachers[0]?.id,
      day: today,
    },
    include: {
      session: true,
      subject: true,
      room: true,
      // Jika relasi direct (Many-to-Many Implicit)
      students: {
        select: {
          id: true,
          nickname: true,
          fullName: true,
          imageProfile: true,
        }
      },
    },
    orderBy: { session: { startTime: 'asc' } }
  });

  const addons = await prisma.addon.findMany({
  where: {
    isActive: true // Hanya ambil program yang aktif
  },
  select: {
    id: true,
    name: true,
  }
  });
  

  // Tambahkan pengecekan sederhana untuk menghindari error jika user tidak ditemukan
  if (!currentUser) {
    return <div className="p-10 text-center">Silahkan login kembali.</div>;
  }

  return (
    <div className="min-h-screen bg-cyan-50 pb-20">
      <TeacherAgendaClient 
        initialSchedules={initialSchedules}
        allTeachers={allTeachers}
        currentUser={currentUser}
        dataAddons={addons}
        today={today}
      />
    </div>
  );
}