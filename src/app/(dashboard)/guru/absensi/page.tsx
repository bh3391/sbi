import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import AbsensiGuruClient from "./AbsensiGuruClient";  

export default async function AbsensiGuruPage() {
  const session = await auth();

  // Range waktu Hari Ini (00:00:00 sampai 23:59:59)
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const [teachers,sessions] = await Promise.all([
    prisma.user.findMany({
      include: { 
        
        teacherAttendances: {
          where: {
            createdAt: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
          orderBy: { createdAt: "desc" },
        }
      },
      orderBy: { name: "asc" },
    }),
    prisma.subject.findMany({ orderBy: { name: "asc" } }),
    prisma.studentSession.findMany({ orderBy: { startTime: "asc" } }),
  ]);

  return (
    
    <AbsensiGuruClient
      teacherName={session?.user?.name || "Guru"}
      teacherId={session?.user?.id || ""}
      initialTeachers={teachers}
      initialSessions={sessions}
      startOfDay={startOfDay}
      endOfDay={endOfDay}
    />
  );
}