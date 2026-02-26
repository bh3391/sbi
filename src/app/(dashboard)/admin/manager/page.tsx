import prisma from "@/lib/prisma";
import ManagerClient from "./ManagerClient";

export default async function ManagerPage() {
  const [locations, sessions, subjects] = await Promise.all([
  prisma.location.findMany({ 
    include: { 
      // Mengambil daftar detail ruangan
      rooms: {
        orderBy: { name: 'asc' }
      },
      // Tetap mengambil hitungan untuk badge di UI utama
      _count: { 
        select: { rooms: true } 
      } 
    },
    orderBy: { name: 'asc' }
  }),
  prisma.studentSession.findMany({ orderBy: { startTime: 'asc' } }),
  prisma.subject.findMany({ orderBy: { name: 'asc' } }),
]);
  

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <ManagerClient 
        initialLocations={locations} 
        initialSessions={sessions} 
        initialSubjects={subjects} 
      />
    </div>
  );
}