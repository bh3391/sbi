"use client";

import { useState, useEffect } from "react";
import { Home, LogOut, QrCode, Fingerprint } from "lucide-react";
import Link from "next/link";
import { handleSignOut } from "@/lib/action";

// Hapus 'async' di sini
export default function BottomNav({ role }: { role: string }) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Gunakan role dari props untuk menentukan link
  const homeLink = role === "ADMIN" ? "/admin" : "/guru";

  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < 10) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", controlNavbar);
    return () => window.removeEventListener("scroll", controlNavbar);
  }, [lastScrollY]);

  return (
    <nav 
      className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out transform 
        ${isVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"}`}
    >
      <div className="max-w-md mx-auto mb-4 px-4">
        <div className="h-16 bg-white/80 backdrop-blur-xl border border-slate-100 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] rounded-[2rem] flex items-center justify-between px-6">
          
          <Link href={homeLink} className="flex flex-col items-center gap-1 group">
            <div className="p-2 rounded-2xl bg-cyan-50 text-cyan-600 active:scale-90 transition-all">
              <Home size={20} strokeWidth={2.5} />
            </div>
            <span className="text-[8px] font-black uppercase tracking-widest text-cyan-700">Home</span>
          </Link>

          <Link href={`${homeLink}/profile`} className="flex flex-col items-center gap-1 group">
            <div className="p-2 rounded-2xl text-slate-400 active:scale-90 transition-all">
              <QrCode size={20} strokeWidth={2.5} />
            </div>
            <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">QR</span>
          </Link>

          <Link href={`${homeLink}/scan`} className="flex flex-col items-center gap-1 group">
            <div className="p-2 rounded-2xl text-slate-400 active:scale-90 transition-all">
              <Fingerprint size={20} strokeWidth={2.5} />
            </div>
            <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Absen</span>
          </Link>

          <div className="h-8 w-[1.5px] bg-slate-100/50 mx-1" />

          <form action={handleSignOut}>
            <button type="submit" className="flex flex-col items-center gap-1 group outline-none">
              <div className="p-2 rounded-2xl text-rose-400 hover:bg-rose-50 active:scale-90 transition-all">
                <LogOut size={20} strokeWidth={2.5} />
              </div>
              <span className="text-[8px] font-black uppercase tracking-widest text-rose-400">Exit</span>
            </button>
          </form>
        </div>
      </div>
    </nav>
  );
}