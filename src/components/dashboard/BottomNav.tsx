import React from "react";
import { auth, signOut } from "@/lib/auth";
import { Home, User, LogOut, QrCode, Fingerprint } from "lucide-react";
import Link from "next/link";

export default async function BottomNav() {
  const session = await auth();
  const role = session?.user?.role;
  
  // Menentukan link Home berdasarkan role
  const homeLink = role === "ADMIN" ? "/admin" : "/guru";

  return (
    <nav className="fixed max-w-md mx-auto bottom-4 left-4 right-4 h-14 bg-white/80 backdrop-blur-md border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl flex items-center justify-between px-6 z-50">
      
      {/* Tombol Home - Floating Style with Cyan Accent */}
      <Link href={homeLink} className="flex flex-col items-center gap-0.5 group">
        <div className="p-2 rounded-xl bg-cyan-50 text-cyan-600 group-active:scale-90 transition-all">
          <Home size={18} strokeWidth={2.5} />
        </div>
        <span className="text-[7px] font-black uppercase tracking-[0.15em] text-cyan-700">Home</span>
      </Link>

      {/* Tombol Scan */}
      <Link href={`${homeLink}/profile`} className="flex flex-col items-center gap-0.5 group">
        <div className="p-2 rounded-xl text-slate-400 group-hover:bg-slate-50 group-active:scale-90 transition-all">
          <QrCode size={18} strokeWidth={2.5} />
        </div>
        <span className="text-[7px] font-black uppercase tracking-[0.15em] text-slate-500">QR Profile</span>
      </Link>

      {/* Tombol Profil */}
      <Link href={`${homeLink}/scan`} className="flex flex-col items-center gap-0.5 group">
        <div className="p-2 rounded-xl text-slate-400 group-hover:bg-slate-50 group-active:scale-90 transition-all">
          <Fingerprint size={18} strokeWidth={2.5} />
        </div>
        <span className="text-[7px] font-black uppercase tracking-[0.15em] text-slate-500">Absen</span>
      </Link>

      {/* Divider Vertical Kecil */}
      <div className="h-6 w-[1px] bg-slate-100 mx-1" />

      {/* Tombol Logout - Compact & Clean */}
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}
      >
        <button type="submit" className="flex flex-col items-center gap-0.5 group">
          <div className="p-2 rounded-xl text-rose-400 hover:bg-rose-50 group-active:scale-90 transition-all">
            <LogOut size={18} strokeWidth={2.5} />
          </div>
          <span className="text-[7px] font-black uppercase tracking-[0.15em] text-rose-400">Exit</span>
        </button>
      </form>
    </nav>
  );
}