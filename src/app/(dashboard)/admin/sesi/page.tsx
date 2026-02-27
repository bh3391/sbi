import { auth } from "@/lib/auth"; // Sesuaikan dengan library auth Anda
import prisma from "@/lib/prisma";
import TeacherAgendaClient from "./TeacherAgendaClient";

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

  // 3. Ambil jadwal hari ini (Indonesian Day)
  const today = new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(new Date());

  const initialSchedules = await prisma.schedule.findMany({
    where: {
      teacherId: currentUser?.role === "TEACHER" ? currentUser.id : allTeachers[0]?.id,
      day: today,
    },
    include: {
      session: true,
      subject: true,
      room: true,
      students: true,
    },
    orderBy: { session: { startTime: 'asc' } }
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      <TeacherAgendaClient 
        initialSchedules={initialSchedules}
        allTeachers={allTeachers}
        currentUser={currentUser}
        today={today}
      />
    </div>
  );
}