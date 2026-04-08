import prisma from "@/lib/prisma";
import InvoiceClientPage from "./InvoiceClientPage";

export default async function InvoicePage() {
  const now = new Date();

  const invoices = await prisma.invoice.findMany({
    include: {
      student: {
        include: {
          location: true,
          parent: true, // WAJIB: Untuk mendapatkan UUID/ID asli dan depositBalance
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // 2. Logic Grouping yang Lebih Aman
  const grouped = invoices.reduce((acc: any, inv) => {
    // GUNAKAN ID PARENT sebagai key, bukan Nama (agar tidak bentrok jika nama sama)
    const parentId =
      inv.student.parent?.id || `legacy-${inv.student.parentName}`;

    const pName =
      inv.student.parent?.name || inv.student.parentName || "TANPA NAMA";
    const locName = inv.student.location?.name || "TANPA LOKASI";
    const depositBalance = inv.student.parent?.depositBalance || 0;

    if (!acc[parentId]) {
      acc[parentId] = {
        parentId: parentId, // Kita butuh ini untuk generate Link WhatsApp nantinya
        parentName: pName.toUpperCase(),
        locationName: locName,
        depositBalance: Number(depositBalance), // Paksa ke Number agar tidak 0
        items: [],
        totalGroupAmount: 0,
      };
    }

    // Serialisasi data agar aman dikirim ke Client Component
    const sanitizedInvoice = {
      ...inv,
      id: inv.id,
      // PAKSA konversi ke Number di sini (Solusi Masalah Rp 0)
      amount: Number(inv.amount),
      totalToPay: Number(inv.totalToPay),
      createdAt: inv.createdAt.toISOString(),
      updatedAt: inv.updatedAt.toISOString(),
      student: {
        ...inv.student,
        // Pastikan package ikut jika dibutuhkan di Client
        package: (inv.student as any).package,
      },
    };

    acc[parentId].items.push(sanitizedInvoice);

    // Hitung total menggunakan .amount (sesuai request Anda sebelumnya)
    acc[parentId].totalGroupAmount += Number(inv.amount || 0);

    return acc;
  }, {});

  const groupedData = Object.values(grouped);

  return <InvoiceClientPage initialData={groupedData} />;
}
