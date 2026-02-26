import prisma from "@/lib/prisma";
import CalendarClient from "./CalendarClient";
import { notFound } from "next/navigation";

export default async function CalendarPage({ 
  params 
}: { 
  params: Promise<{ locationId: string }> 
}) {
  const { locationId } = await params;

  try {
    // Jalankan semua query secara paralel untuk performa maksimal
    const [location, teachers, sessions, subjects, students] = await Promise.all([
      // 1. Data Lokasi & Jadwal Eksisting
      prisma.location.findUnique({
        where: { id: locationId },
        include: {
          rooms: {
            include: {
              schedules: {
                include: {
                  students: true,
                  teacher: true,
                  session: true, 
                  subject: true,
                },
              },
            },
            orderBy: { name: 'asc' }
          },
        },
      }),
      // 2. Data Guru (User dengan role TEACHER)
      prisma.user.findMany({ 
        where: { role: "TEACHER" },
        orderBy: { name: 'asc' } 
      }),
      // 3. Data Sesi
      prisma.studentSession.findMany({ orderBy: { startTime: 'asc' } }),
      // 4. Data Mapel
      prisma.subject.findMany({ orderBy: { name: 'asc' } }),
      // 5. Data Murid (HANYA yang satu lokasi dengan locationId ini)
      prisma.student.findMany({ 
        where: { locationId: locationId },
        orderBy: { fullName: 'asc' } 
      })
    ]);

    if (!location) return notFound();

    return (
      <CalendarClient 
        locationData={location} 
        teachers={teachers}
        sessions={sessions}
        subjects={subjects}
        students={students}
      />
    );
  } catch (error) {
    console.error("Prisma Error:", error);
    return <div className="p-10 text-center font-black uppercase italic">Gagal memuat data database.</div>;
  }
}