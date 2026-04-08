import prisma from "@/lib/prisma";

export async function migrateParents() {
  const students = await prisma.student.findMany();

  for (const student of students) {
    if (!student.parentContact) continue;

    // Cari atau Buat Parent berdasarkan Nomor WA
    const parent = await prisma.parent.upsert({
      where: { contact: student.parentContact },
      update: {
        // Jika anak pertama sudah mengisi saldo, anak kedua tidak menambah lagi (atau akumulasi)
        // Tergantung kebijakan Anda, di sini kita asumsikan sinkronisasi saldo awal
      },
      create: {
        contact: student.parentContact,
        name: student.parentName || "Orang Tua",
        depositBalance: student.deposit || 0,
      },
    });

    // Hubungkan Student ke Parent ID tersebut
    await prisma.student.update({
      where: { id: student.id },
      data: { parentId: parent.id },
    });
  }
}
