import React from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import BottomNav from "@/components/dashboard/BottomNav";
import { Toaster } from "sonner";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const role = session?.user?.role;

  // 1. Cek apakah sudah login
  if (!session) {
    redirect("/entrance-guru");
  }

  // 2. Logika Redirect Berdasarkan Role (Pemisahan Rute)
  // Pastikan Admin tidak nyasar ke folder lain dan Teacher tidak masuk ke /admin
  const isAllowed = role === "ADMIN" || role === "TEACHER";

  if (!isAllowed) {
    console.log(`Access Denied for role: ${role}`);
    redirect("/"); 
  }

  // Catatan: Next.js v13+ Layout tidak memiliki akses langsung ke current pathname.
  // Proteksi spesifik rute (Admin tidak boleh ke /guru dst) 
  // sebaiknya tetap ada di masing-masing page.tsx atau middleware.
  // Namun, kita bisa memastikan data role dilempar ke komponen anak jika perlu.

  return (
    <div className="min-h-screen bg-cyan-50/50 relative w-full rounded-2xl overflow-x-hidden font-sans">
      
      

      {/* Konten Utama */}
      <main className="pb-24 max-w-md mx-auto min-h-screen relative px-1 pt-2">
        {/* Header Info (Opsional - Bagus untuk Debugging/Status) */}
        

        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          {children}
          <Toaster position="top-center" richColors />
          {/* Kirim role ke BottomNav agar menu menyesuaikan */}
          <BottomNav  />
        </div>
      </main>
    </div>
  );
}