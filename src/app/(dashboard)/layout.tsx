import React from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import BottomNav from "@/components/dashboard/BottomNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Proteksi Route - Server Side
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-cyan-50/50 relative overflow-x-hidden font-sans">
      
      {/* Background Decor - Refined for "Glass" look */}
      <div className="fixed top-[-10%] right-[-15%] w-80 h-80 bg-cyan-200/20 rounded-full blur-[100px] -z-10 animate-pulse" />
      <div className="fixed bottom-[5%] left-[-10%] w-64 h-64 bg-teal-100/30 rounded-full blur-[80px] -z-10" />

      {/* Konten Utama */}
      {/* pb-24 memberikan ruang yang cukup untuk Floating BottomNav agar tidak menutupi konten terakhir */}
      <main className="pb-24 max-w-md mx-auto min-h-screen relative px-1 pt-2">
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          {children}
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}