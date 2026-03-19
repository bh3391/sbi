"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import PushNotificationHeader from "@/components/ui/PushNotificationHeader"; // Sesuaikan path

export default function DashboardHeader({
  title,
  userId,
}: {
  title: string;
  userId: string;
}) {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between bg-cyan-50 border-b border-cyan-300 p-2">
      <div className="flex items-center gap-1 flex-1">
        <button
          onClick={() => router.back()}
          className="h-10 w-10 bg-cyan-50 rounded-full flex items-center justify-center text-slate-900 active:scale-90 transition-all"
        >
          <ChevronLeft size={20} strokeWidth={2.5} />
        </button>

        <div>
          <h1 className="text-sm font-bold text-slate-800 uppercase tracking-tighter leading-none">
            {title}
          </h1>
        </div>
      </div>

      {/* Area Notifikasi & Logo */}
      <div className="flex items-center gap-3">
        {/* Lonceng Notifikasi */}
        <PushNotificationHeader userId={userId} />

        {/* Logo/Avatar */}
        <Link href="/" className="transition-transform active:scale-95">
          <img
            src="/logo-header.png"
            alt="Logo"
            className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
          />
        </Link>
      </div>
    </div>
  );
}
