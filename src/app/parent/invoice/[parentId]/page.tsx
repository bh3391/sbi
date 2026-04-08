import prisma from "@/lib/prisma";
import ParentInvoiceView from "./ParentInvoiceView";
import { notFound } from "next/navigation";
import { Metadata } from "next";

// Mencegah Search Engine melakukan indexing pada halaman ini
export const metadata: Metadata = {
  title: "Invoice & Rincian Belajar",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default async function ParentInvoicePage(props: {
  params: Promise<{ parentId: string }>;
}) {
  const params = await props.params;
  const parentId = params.parentId;

  // 1. Ambil data Parent terlebih dahulu menggunakan ID (UUID)
  const parent = await prisma.parent.findUnique({
    where: { id: parentId },
    include: {
      students: {
        include: {
          location: true,
          invoices: {
            orderBy: { createdAt: "desc" },
          },
        },
      },
    },
  });

  if (!parent) return notFound();

  // 2. Flatten semua invoice dari semua anak ke dalam satu array
  const allInvoicesRaw = parent.students
    .flatMap((student) =>
      student.invoices.map((inv) => ({
        ...inv,
        student: {
          fullName: student.fullName,
          location: student.location,
        },
      })),
    )
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  if (allInvoicesRaw.length === 0) return notFound();

  // 3. Mapping data untuk dikirim ke Client Component
  const parentData = {
    name: parent.name,
    depositBalance: Number(parent.depositBalance || 0),
    location: parent.students[0]?.location?.name || "Pusat",

    unpaidTotal: allInvoicesRaw
      .filter((inv) => inv.status === "UNPAID")
      .reduce((acc, curr) => acc + Number(curr.totalToPay), 0),

    allInvoices: allInvoicesRaw.map((inv) => ({
      ...inv,
      id: inv.id,
      createdAt: inv.createdAt.toISOString(),
      updatedAt: inv.updatedAt.toISOString(),
      amount: Number(inv.amount),
      totalToPay: Number(inv.totalToPay),
      method: inv.paymentMethod || "CASH",
    })),
  };

  return <ParentInvoiceView data={parentData} />;
}
