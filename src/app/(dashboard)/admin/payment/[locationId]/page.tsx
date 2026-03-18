// src/app/admin/payment/[locationId]/page.tsx
import prisma from "@/lib/prisma";
import PaymentTable from "./PaymentTable";
import AddPaymentFAB from "@/components/dashboard/AddPaymentFAB";
import DashboardHeader from "@/components/dashboard/header";
import { auth } from "@/lib/auth";

interface PageProps {
  params: Promise<{ locationId: string }>;
}

export default async function LocationPaymentPage({ params }: PageProps) {
  
  // Unwrapped params untuk Next.js 15+
  const resolvedParams = await params;
  const locationId = resolvedParams.locationId;
  const isAll = locationId === "all"; // Cek apakah slug adalah 'all'

  const session = await auth(); 
  const currentUserId = session?.user?.id || ""; 

  // 1. Ambil Data Pembayaran
  const payments = await prisma.payment.findMany({
  where: isAll 
    ? {} 
    : { 
        students: { 
          some: { // Menggunakan 'some' karena students sekarang adalah array
            locationId: locationId 
          } 
        } 
      }, 
  include: {
    students: {
      include: {
        location: { select: { name: true } },
        package: { select: { name: true, sesiCredit: true } } // Tambahkan ini jika butuh info paket
      }
    },
    createdBy: {
      select: { nickname: true } 
    }
  },
  orderBy: { createdAt: 'desc' }
});

  // 2. Ambil Data Siswa (untuk FAB)
  const students = await prisma.student.findMany({
    where: isAll 
      ? { status: 'ACTIVE' } // Semua siswa aktif dari semua lokasi
      : { locationId: locationId, status: 'ACTIVE' },
    select: { 
        id: true, 
        fullName: true,
        package: {
          select: {
            id: true,
            name: true,
            price: true,
          }
        },
        location: {
          select: {
            name: true
          }
        }
    },
    orderBy: { fullName: 'asc' }
  });

  // 3. Tentukan Judul Header
  const headerTitle = isAll 
    ? "Semua Lokasi" 
    : (students[0]?.location?.name || "Lokasi");

  return (
    <div className="min-h-screen p-1">
      <DashboardHeader title={`Pembayaran - ${headerTitle}`} />
      
      <PaymentTable initialData={payments} />

      {/* Kirim locationId dan data students ke FAB */}
      <AddPaymentFAB 
        locationId={locationId} 
        students={students} 
        currentUserId={currentUserId} 
      />
    </div>
  );
}