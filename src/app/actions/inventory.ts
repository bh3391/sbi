"use server"
import  prisma  from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateStock(formData: FormData) {
  const inventoryId = formData.get("inventoryId") as string;
  const quantity = parseInt(formData.get("quantity") as string);
  const type = formData.get("type") as "IN" | "OUT";
  const notes = formData.get("notes") as string;
  const currentUserId = formData.get("currentUserId") as string;

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Update jumlah stok utama
      const change = type === "IN" ? quantity : -quantity;
      const updated = await tx.inventory.update({
        where: { id: inventoryId },
        data: { stock: { increment: change } }
      });

      if (updated.stock < 0) throw new Error("Stok tidak boleh minus!");

      // 2. Catat audit log
      await tx.inventoryLog.create({
        data: {
          inventoryId,
          quantity,
          type,
          notes,
          createdById: currentUserId
        }
      });
    });

    revalidatePath("/admin/inventory");
    return { success: true, message: "Stok berhasil diperbarui" };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}
export async function createInventoryItem(formData: FormData) {
  const name = formData.get("name") as string;
  const stock = parseInt(formData.get("stock") as string);
  const locationId = formData.get("locationId") as string;
  const currentUserId = formData.get("currentUserId") as string;

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Buat item inventory baru
      const item = await tx.inventory.create({
        data: {
          name,
          stock,
          locationId,
        },
      });

      // 2. Buat log pertama (Initial Stock)
      await tx.inventoryLog.create({
        data: {
          inventoryId: item.id,
          type: "IN",
          quantity: stock,
          notes: "Initial Stock Registration",
          createdById: currentUserId,
        },
      });
    });

    revalidatePath("/admin/inventory");
    return { success: true, message: `${name} berhasil didaftarkan!` };
  } catch (err: any) {
    return { success: false, message: "Gagal mendaftarkan barang." };
  }
}