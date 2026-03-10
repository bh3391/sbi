"use client";
import Link from "next/link";
import { GraduationCap, LogIn, LayoutDashboard } from "lucide-react";

interface NavbarClientProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  } | null;
}

export default function NavbarClient({ user }: NavbarClientProps) {
  // Logic penentuan link dashboard berdasarkan role
  const isAdmin = user?.role === "ADMIN";
  
  
  // Jika role bukan ADMIN, maka kita asumsikan dia TEACHER/GURU
  // Ini mencegah user terlempar ke link yang salah jika ada role baru nanti
  const dashboardLink = isAdmin ? "/admin" : "/guru";
  
  return (
    <nav className="fixed top-0 w-full z-50 bg-cyan-100/70 backdrop-blur-lg border-b border-slate-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-fuchsia-600 flex items-center justify-center text-white shadow-lg">
            <GraduationCap size={18} />
          </div>
          <span className="font-black text-slate-800 tracking-tighter text-lg">
            BIMB<span className="text-cyan-500">ELS.</span>
          </span>
        </div>
        
        {user ? (
          <Link 
            href={dashboardLink} 
            className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-cyan-600 transition-all shadow-md active:scale-95"
          >
            <LayoutDashboard size={14} /> 
            {isAdmin ? "Admin Panel" : "Dashboard Guru"}
          </Link>
        ) : (
          <Link 
            href="/entrance-guru" 
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-fuchsia-600 transition-colors"
          >
            <LogIn size={14} /> Portal Guru
          </Link>
        )}
      </div>
    </nav>
  );
}