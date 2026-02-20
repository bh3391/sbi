"use client";

import React, { useState, useTransition } from "react";
import { Mail, Lock, ArrowRight, Info, Loader2, Eye, EyeOff } from "lucide-react";
import { authenticate } from "@/lib/action";

export default function LoginPage() {
  
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();
 const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fungsi simulasi handleSubmit (Hubungkan dengan Server Action Anda)
  async function handleSubmit(formData: FormData) {
  setErrorMsg(null); // Reset error setiap kali mencoba login

  startTransition(async () => {
    try {
      // Panggil server action authenticate
      const result = await authenticate(formData);

      // Karena authenticate hanya melempar return string saat error, 
      // kita cek jika ada pesan error yang dikirim balik.
      if (result) {
        setErrorMsg(result);
      }
    } catch (error) {
      // Jika terjadi redirect, Next.js akan melempar error khusus.
      // Jika error bukan dari redirect, baru kita set error umum.
      if (!(error as Error).message.includes("NEXT_REDIRECT")) {
        setErrorMsg("Terjadi kesalahan koneksi.");
      }
    }
  });
}

  return (
    <div className="h-screen w-full relative flex flex-col items-center justify-center px-2 mt-0 overflow-hidden bg-[#F0FAF9]">
      {/* Ornamen Dekoratif: Background Glow */}
      <div className="absolute top-[-10%] left-[-20%] w-80 h-80 bg-cyan-200/40 rounded-full blur-[80px]" />
      <div className="absolute bottom-[-5%] right-[-20%] w-96 h-96 bg-fuchsia-200/30 rounded-full blur-[100px]" />

      <div className="w-full max-w-sm z-10 mt-0">
        {/* Header & Logo */}
        <div className="mb-8 text-center animate-in fade-in slide-in-from-top duration-700">
          <div className="mx-auto h-16 w-16 bg-white rounded-2xl flex items-center justify-center mb-3 shadow-xl shadow-cyan-100 border border-white">
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-cyan-500 to-fuchsia-500 text-2xl font-black">
              B
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tighter uppercase">
            BimbEls <span className="text-cyan-600">App</span>
          </h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">
            Sistem Informasi Presensi Digital
          </p>
        </div>

        {/* Card Utama */}
        <div className="bg-white rounded-[2.5rem] p-7 shadow-2xl shadow-cyan-900/5 border border-fuchsia-100 animate-in fade-in zoom-in duration-500">
          <form action={handleSubmit} className="space-y-5">
            
            {/* Alert Error */}
            {errorMsg && (
              <div className="bg-rose-50 text-rose-600 p-3.5 rounded-2xl text-[10px] font-black uppercase tracking-wider flex items-center gap-2 animate-bounce">
                <Info size={14} strokeWidth={3} />
                {errorMsg}
              </div>
            )}

            {/* Input Email */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-800 uppercase tracking-widest ml-1">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-cyan-500 transition-colors" size={18} />
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="name@bimbel.com"
                  className="w-full pl-12 pr-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:ring-2 focus:ring-cyan-500/20 transition-all outline-none"
                />
              </div>
            </div>

            {/* Input Password */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-800 uppercase tracking-widest ml-1">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-fuchsia-500 transition-colors" size={18} />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:ring-2 focus:ring-fuchsia-500/20 transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end pr-1">
              <a href="#" className="text-[9px] font-black text-fuchsia-500 hover:text-cyan-600 transition-colors uppercase tracking-widest">
                Lupa Password?
              </a>
            </div>

            {/* Tombol Login: Cyan & Fuchsia Gradient */}
            <button
              type="submit"
              disabled={isPending}
              className={`w-full h-14 rounded-2xl font-black shadow-lg transition-all active:scale-[0.97] flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-[11px] relative overflow-hidden
                ${isPending 
                  ? "bg-slate-100 text-slate-400 shadow-none cursor-not-allowed" 
                  : "bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white shadow-fuchsia-200"
                }`}
            >
              <span className="relative z-10 flex items-center gap-2">
                {isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    Masuk Sekarang
                    <ArrowRight size={16} strokeWidth={3} />
                  </>
                )}
              </span>
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center animate-in fade-in duration-1000 delay-500">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em]">
            v1.0 • 2026 Management System
          </p>
        </div>
      </div>
    </div>
  );
}