// src/app/actions/users.ts
"use server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { sendFonneNotification } from "@/lib/fonnte";

export async function getAllTeachers() {
  return await prisma.user.findMany({
    include: { homebase: true },
    orderBy: { name: "asc" },
  });
}

function generateRandomPassword(length = 8) {
  const charset = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789"; // Tanpa karakter membingungkan (i, l, 1, 0, O)
  let res = "";
  for (let i = 0; i < length; i++) {
    res += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return res;
}

export async function createUser(formData: any) {
  try {
    // 1. Generate Password Random
    const rawPassword = generateRandomPassword(8);
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    // 2. Simpan ke Database (Sesuai Schema Anda)
    const user = await prisma.user.create({
      data: {
        id: formData.id || undefined, // Gunakan ID manual jika diisi, jika kosong Prisma pakai CUID
        name: formData.name,
        nickname: formData.nickname,
        email: formData.email,
        role: formData.role,
        password: hashedPassword,
        specialization: formData.specialization,
        homebaseId: formData.homebaseId || formData.locationId,
        contact: formData.contact, // Simpan nomor WA
        isRemote: formData.isRemote === true,
        image: formData.image || null,
      },
      include: {
        homebase: true, // Untuk mendapatkan nama cabang di notif WA
      },
    });

    // 3. Kirim Notifikasi via WhatsApp (Fonne)
    if (user.contact) {
      // Pastikan mengakses user.homebase (objek), bukan user.homebaseId (string)
      const namaCabang = user.homebase?.name || "Cabang Belum Ditentukan";

      const message =
        `*REGISTRASI STAFF BARU* 👩‍🏫\n\n` +
        `Halo *${user.nickname || user.name}*,\n` +
        `Akun Anda telah aktif di sistem.\n\n` +
        `*Detail Login:*\n` +
        `📧 Email: ${user.email}\n` +
        `🔑 Password: *${rawPassword}*\n` +
        `📍 Cabang: *${namaCabang}*\n\n` +
        `_PENTING: Mohon segera login dan ganti password Anda di menu Profil demi keamanan data._\n\n` +
        `Link Login: ${process.env.NEXTAUTH_URL}/entrance-guru`;

      await sendFonneNotification(user.contact, message);
    }

    revalidatePath("/admin/data-guru");
    return {
      success: true,
      message: "User berhasil dibuat dan notifikasi WA terkirim!",
    };
  } catch (error: any) {
    console.error("Create User Error:", error);
    // Cek jika error karena ID atau Email duplikat
    if (error.code === "P2002") {
      return { success: false, message: "Email atau ID sudah digunakan!" };
    }
    return { success: false, message: "Gagal membuat user baru." };
  }
}

export async function createUsers(formData: any) {
  try {
    const hashedPassword = await bcrypt.hash("rumahbimbels123", 10);
    await prisma.user.create({
      data: {
        name: formData.name,
        nickname: formData.nickname,
        email: formData.email,
        role: formData.role,
        password: hashedPassword,
        specialization: formData.specialization,
        homebaseId: formData.homebaseId,
        image: formData.image || null,
      },
    });
    revalidatePath("/admin/data-guru");
    return { success: true };
  } catch (error) {
    return { success: false, message: "Gagal membuat user baru" };
  }
}

export async function updateUserPassword(userId: string, newPassword: string) {
  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    revalidatePath("/admin/data-guru");
    return { success: true };
  } catch (error) {
    return { success: false, message: "Gagal memperbarui password" };
  }
}

export async function updateTeacher(id: string, data: any) {
  try {
    await prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        nickname: data.nickname,
        email: data.email,
        specialization: data.specialization,
        homebaseId: data.homebaseId,
        image: data.image || null,
      },
    });

    revalidatePath("/admin/staff");
    return { success: true, message: "Profil berhasil diperbarui" };
  } catch (error) {
    console.error("Update Teacher Error:", error);
    return { success: false, message: "Gagal memperbarui profil" };
  }
}
