import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const students = await prisma.student.findMany();
    let migratedCount = 0;

    for (const student of students) {
      if (!student.parentContact) continue;

      // 1. Cari atau Buat Parent (Upsert)
      // Gunakan contact sebagai kunci unik
      const parent = await prisma.parent.upsert({
        where: { contact: student.parentContact },
        update: {}, // Jika sudah ada, jangan timpa saldo
        create: {
          contact: student.parentContact,
          name: student.parentName || "Orang Tua",
          depositBalance: student.deposit || 0,
        },
      });

      // 2. Hubungkan Student ke Parent tersebut
      await prisma.student.update({
        where: { id: student.id },
        data: { parentId: parent.id },
      });

      migratedCount++;
    }

    return NextResponse.json({
      success: true,
      message: `Migrasi selesai. ${migratedCount} siswa telah dihubungkan ke tabel Parent.`,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: "Gagal migrasi" },
      { status: 500 },
    );
  }
}
