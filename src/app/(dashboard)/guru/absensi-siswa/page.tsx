import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import AbsensiSiswaClient from "@/components/dashboard/AbsensiSiswaClient";

export default async function AbsensiSiswaPage() {
  const session = await auth();

  // Range waktu Hari Ini (00:00:00 sampai 23:59:59)
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);
  

  const [students, subjects, sessions] = await Promise.all([
    prisma.student.findMany({
      include: { 
        location: true,
        attendances: {
          where: {
            createdAt: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
          orderBy: { createdAt: "desc" },
        }
      },
      orderBy: { fullName: "asc" },
    }),
    prisma.subject.findMany({ orderBy: { name: "asc" } }),
    prisma.studentSession.findMany({ orderBy: { startTime: "asc" } }),
  ]);

  return (
    <AbsensiSiswaClient
      teacherName={session?.user?.name || "Guru"}
      teacherId={session?.user?.id || ""}
      initialStudents={students}
      initialSubjects={subjects}
      initialSessions={sessions}
    />
  );
}