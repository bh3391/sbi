// src/app/admin/payment/[locationId]/page.tsx
import prisma from "@/lib/prisma";
import PaymentTable from "./PaymentTable";
import AddPaymentFAB from "@/components/dashboard/AddPaymentFAB";
import DashboardHeader from "@/components/dashboard/header";
import { auth } from "@/lib/auth";

interface PageProps {
  params: Promise<{ locationId: string }>;
}

// Perbaikan: Hanya gunakan satu argumen { params }
export default async function LocationPaymentPage({ params }: PageProps) {
  
  // WAJIB: Unwrapped params karena di Next.js 15+ ini adalah Promise
  const resolvedParams = await params;
  const locationId = resolvedParams.locationId;
  const session = await auth(); // Placeholder, bisa diisi dengan session user jika diperlukan
  const currentUserId = session?.user?.id || ""; // Placeholder, bisa diisi dengan session user jika diperlukan
  

  const payments = await prisma.payment.findMany({
    where: {
      student: {
        locationId: locationId // Gunakan variabel yang sudah di-await
      }
    },
    include: {
      student: true,
      createdBy: {
      select: { nickname: true } // Hanya ambil nama agar efisien
    }
    },
    orderBy: { createdAt: 'desc' }
  });

  const students = await prisma.student.findMany({
    where: { 
      locationId: locationId, 
      status: 'ACTIVE' 
    },
    select: { 
        id: true, 
        fullName: true,
        location: {
          select: {
            name: true
          }
        }
    },
    orderBy: { fullName: 'asc' }
  });
        // Tambahkan defaultPackageAmount jika ingin nominal terisi otomatis di FAB
        // defaultPackageAmount: true 
  

  return (
    <div className="min-h-screen p-1">
      <DashboardHeader title={`Pembayaran - ${students[0]?.location?.name || "Lokasi Tidak Ditemukan"}`} />
      <PaymentTable initialData={payments}  />

      {/* Kirim locationId dan data students ke FAB */}
      <AddPaymentFAB locationId={locationId} students={students} currentUserId={currentUserId} />
    </div>
  );
}