"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Action untuk membuat paket baru (Menyesuaikan gambar DB)
 */
export async function createPackage(formData: FormData) {
  const name = formData.get("name") as string;
  const price = formData.get("price") as string;
  const sesiCredit = formData.get("sesiCredit") as string; // Menyesuaikan gambar
  const description = formData.get("description") as string;

  if (!name || !sesiCredit || !price) {
    return { error: "Nama, Harga, dan Sesi Credit wajib diisi!" };
  }

  try {
    await prisma.package.create({
      data: {
        name: name,
        price: parseInt(price),
        sesiCredit: parseInt(sesiCredit), // Gunakan nama field sesuai gambar
        description: description || "{}", // Default sesuai gambar
      },
    });

    revalidatePath("/admin/settings"); // Sesuaikan path dashboard Anda
    return { success: true, message: "Paket berhasil ditambahkan!" };
  } catch (error) {
    console.error("CREATE_PACKAGE_ERROR:", error);
    return { error: "Gagal menyimpan paket ke database." };
  }
}

/**
 * Action untuk menghapus paket
 */
export async function deletePackage(id: string) {
  try {
    // Cek apakah paket sedang digunakan oleh siswa
    const usageCount = await prisma.student.count({
      where: { packageId: id },
    });

    if (usageCount > 0) {
      return {
        success: false,
        message: `Gagal hapus! Paket ini sedang digunakan oleh ${usageCount} siswa.`,
      };
    }

    await prisma.package.delete({
      where: { id },
    });

    revalidatePath("/admin/settings");
    return { success: true, message: "Paket berhasil dihapus." };
  } catch (error) {
    return {
      success: false,
      message: "Terjadi kesalahan server saat menghapus.",
    };
  }
}

export async function updatePackage(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const price = formData.get("price") as string;
  const sesiCredit = formData.get("sesiCredit") as string;
  const description = formData.get("description") as string;

  try {
    await prisma.package.update({
      where: { id },
      data: {
        name,
        price: parseInt(price),
        sesiCredit: parseInt(sesiCredit),
        description: description || "",
      },
    });
    revalidatePath("/admin/manager");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Gagal memperbarui paket" };
  }
}
