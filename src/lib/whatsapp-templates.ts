// src/lib/whatsapp-templates.ts
export const formatInvoiceMessage = (parentData: any) => {
  const { parentName, items } = parentData;

  // Ambil semua nama anak dalam satu card
  const studentNames = items.map((inv: any) => inv.student.fullName).join(", ");

  // Hitung total tagihan gabungan
  const totalAmount = items.reduce(
    (sum: any, inv: any) => sum + inv.totalToPay,
    0,
  );

  // Link invoice personal
  const invoiceLink = `${process.env.NEXT_PUBLIC_BASE_URL}/parent/invoice/${encodeURIComponent(parentName)}`;

  return (
    `*📝 TAGIHAN KURSUS BIMBEL PRO*\n\n` +
    `Halo Ayah/Bunda *${parentName}*,\n` +
    `Semoga Bapak/Ibu dalam keadaan sehat. Berikut rincian tagihan kursus untuk Ananda:\n\n` +
    `• *Siswa:* ${studentNames}\n` +
    `• *Periode:* April 2026\n` +
    `• *Total Tagihan:* Rp ${totalAmount.toLocaleString("id-ID")}\n\n` +
    `Silakan cek rincian lengkap & instruksi pembayaran melalui link resmi berikut:\n` +
    `🔗 ${invoiceLink}\n\n` +
    `_Pembayaran dapat dilakukan melalui Transfer BCA: 1234567890 (A/N Bhakti Pratama)._\n\n` +
    `Terima kasih atas kepercayaannya. 🙏✨`
  );
};
