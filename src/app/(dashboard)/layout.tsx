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
  const userId = session?.user?.id || "";

  // 1. Cek apakah sudah login
  if (!session) {
    redirect("/entrance-guru");
  }

  const role = session.user?.role;

  // 2. Logika Redirect Berdasarkan Role
  const isAllowed = role === "ADMIN" || role === "TEACHER";

  if (!isAllowed) {
    console.log(`Access Denied for role: ${role}`);
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-cyan-50/50 relative w-full overflow-x-hidden font-sans">
      {/* Konten Utama */}
      {/* pb-24 memastikan konten tidak tertutup oleh BottomNav yang melayang */}
      <main className="pb-24 max-w-md mx-auto min-h-screen relative pt-0 px-0">
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          <Toaster position="top-center" richColors />

          {children}

          {/* Kirim role ke BottomNav sebagai props (Client Component) */}
          <BottomNav role={role} />
        </div>
      </main>
    </div>
  );
}
