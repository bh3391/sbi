"use server";

import prisma  from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// 1. CREATE ADDON
export async function createAddon(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const price = parseFloat(formData.get("price") as string);
    const description = formData.get("description") as string;
    const sesiCredit = parseInt(formData.get("sesiCredit") as string) || 1;

    await prisma.addon.create({
      data: {
        name,
        price,
        description,
        sesiCredit,
        isActive: true,
      },
    });

    revalidatePath("/admin/settings"); // Sesuaikan dengan path halaman Anda
    return { success: true, message: "Add-on berhasil dibuat!" };
  } catch (error) {
    console.error("Error creating addon:", error);
    return { success: false, message: "Gagal membuat Add-on." };
  }
}

// 2. UPDATE ADDON
export async function updateAddon(id: string, formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const price = parseFloat(formData.get("price") as string);
    const description = formData.get("description") as string;

    await prisma.addon.update({
      where: { id },
      data: {
        name,
        price,
        description,
      },
    });

    revalidatePath("/admin/settings");
    return { success: true, message: "Add-on berhasil diperbarui!" };
  } catch (error) {
    console.error("Error updating addon:", error);
    return { success: false, message: "Gagal memperbarui Add-on." };
  }
}

// 3. DELETE ADDON
export async function deleteAddon(id: string) {
  try {
    // Cek apakah addon sudah pernah digunakan di AttendanceLog
    // Jika sudah digunakan, sebaiknya jangan dihapus (cukup set isActive: false)
    // Tapi jika Anda ingin benar-benar hapus:
    await prisma.addon.delete({
      where: { id },
    });

    revalidatePath("/admin/settings");
    return { success: true, message: "Add-on berhasil dihapus!" };
  } catch (error) {
    console.error("Error deleting addon:", error);
    return { success: false, message: "Gagal menghapus Add-on. Mungkin data sudah digunakan." };
  }
}