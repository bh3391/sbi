import { PrismaClient } from '@prisma/client'


const prisma = new PrismaClient();

async function main() {
  console.log('Sedang membersihkan database...');
  // Hapus data lama agar tidak duplikat saat seed ulang
  await prisma.attendanceLog.deleteMany({});
  await prisma.student.deleteMany({});
  await prisma.subject.deleteMany({});
  await prisma.studentSession.deleteMany({});
  

  console.log('Memulai seeding...');

  
  const targetLocationId = "cmlsycb5o0000dhvmhips8ogn";

  // 2. Seed Subjects
  const subjects = ['Matematika', 'Calistung', 'Bahasa Inggris'];
  for (const name of subjects) {
    await prisma.subject.create({ data: { name } });
  }

  // 3. Seed Student Sessions (PG1-3 dan S1-3)
  const sessions = [
    { name: 'PG1', startTime: '08:00', endTime: '09:30' },
    { name: 'PG2', startTime: '09:30', endTime: '11:00' },
    { name: 'PG3', startTime: '11:00', endTime: '12:30' },
    { name: 'S1', startTime: '13:30', endTime: '15:00' },
    { name: 'S2', startTime: '15:00', endTime: '16:30' },
    { name: 'S3', startTime: '16:30', endTime: '18:00' },
  ];

  for (const s of sessions) {
    await prisma.studentSession.create({ data: s });
  }

  // 4. Seed Siswa Dummy
  const dummyStudents = [
    { fullName: 'Budi Santoso', nickname: 'Budi', remainingSesi: 12 },
    { fullName: 'Siti Aminah', nickname: 'Siti', remainingSesi: 8 },
    { fullName: 'Rizky Pratama', nickname: 'Rizky', remainingSesi: 15 },
    { fullName: 'Dewi Lestari', nickname: 'Dewi', remainingSesi: 10 },
  ];

  for (const student of dummyStudents) {
    await prisma.student.create({
      data: {
        fullName: student.fullName,
        nickname: student.nickname,
        remainingSesi: student.remainingSesi,
        locationId: targetLocationId // Menggunakan ID yang Anda berikan
      }
    });
  }

  console.log('Seeding selesai! Database kini memiliki data dummy.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });