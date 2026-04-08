"use server";

import { sendFonneNotification } from "@/lib/fonnte";
import { formatInvoiceMessage } from "@/lib/whatsapp-templates";

export async function bulkSendInvoices(dataList: any[]) {
  let successCount = 0;
  let failCount = 0;

  for (const parent of dataList) {
    try {
      // 1. Ambil nomor telepon (pastikan fieldnya sesuai di database Anda)
      const contact = parent.items[0]?.student?.parentContact;

      if (!contact) continue;

      // 2. Format Pesan
      const message = formatInvoiceMessage(parent);

      // 3. Kirim via Fonne
      await sendFonneNotification(contact, message);

      successCount++;

      // 4. Jeda 3 detik setiap pengiriman agar aman dari blokir
      await new Promise((resolve) => setTimeout(resolve, 3000));
    } catch (error) {
      console.error(`Gagal kirim ke ${parent.parentName}:`, error);
      failCount++;
    }
  }

  return {
    success: true,
    message: `Berhasil kirim ${successCount} invoice. Gagal: ${failCount}`,
  };
}
