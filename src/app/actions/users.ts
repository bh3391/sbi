// src/app/actions/users.ts
"use server"
import prisma  from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function getAllTeachers() {
  return await prisma.user.findMany({
    include: { homebase: true },
    orderBy: { name: 'asc' }
  });
}

export async function createUser(formData: any) {
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
      }
    });
    revalidatePath("/admin/data-guru");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function updateUserPassword(userId: string, newPassword: string) {
  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
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