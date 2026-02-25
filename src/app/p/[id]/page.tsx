import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import StudentPublicClient from "./StudentProfileClient";

export default async function StudentPublicProfile({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;

  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      package: true,
      attendances: {
        orderBy: { date: 'desc' },
        take: 5,
      },
      payments: {
        where: { status: "SUCCESS" },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }
    }
  });

  if (!student) notFound();

  // Kirim data ke komponen Client
  return <StudentPublicClient student={student} />;
}