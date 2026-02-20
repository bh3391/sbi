"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

export default function DashboardHeader({ title }: { title: string }) {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between bg-cyan-50 border-b border-cyan-100 p-2">
      <div className="flex items-center gap-1">
        {/* Tombol Back: Mengikuti style tombol close (X) di drawer */}
        <button
          onClick={() => router.back()}
          className="h-10 w-10 bg-cyan-50 rounded-full flex items-center justify-center text-slate-900 active:scale-90 transition-all"
        >
          <ChevronLeft size={20} strokeWidth={2.5} />
        </button>
        
        <div>
          <h1 className="text-sm font-black text-cyan-600 uppercase tracking-tighter leading-none">
            {title}
          </h1>
          {/* Subtitle opsional agar senada dengan drawer */}
          {/* <p className="text-[8px] font-bold text-cyan-600 uppercase tracking-[0.2em] mt-1">
            Sistem Presensi
          </p> */}
        </div>
      </div>

      {/* Avatar: Konsisten dengan font drawer */}
      <div className="h-9 w-9 rounded-full bg-fuchsia-500 flex items-center justify-center text-[10px] font-black text-white shadow-sm ring-4 ring-slate-50">
        BP
      </div>
    </div>
  );
}