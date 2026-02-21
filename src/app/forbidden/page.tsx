"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShieldAlert, Lock, UserCheck } from "lucide-react";

export default function Forbidden() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-100 to-fuchsia-50 flex items-center justify-center p-6">
      <div className="text-center space-y-8 max-w-md">
        {/* Animated Icon */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="relative inline-block"
        >
          <div className="w-40 h-40 bg-white/50 backdrop-blur-xl rounded-[40px] shadow-2xl flex items-center justify-center border border-white overflow-hidden">
            {/* Pulsing Aura */}
            <motion.div 
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute inset-0 bg-rose-500/10"
            />
            <ShieldAlert size={80} className="text-rose-500 relative z-10" />
          </div>
          <div className="absolute -bottom-4 -right-4 bg-rose-600 text-white text-[10pt] font-black px-4 py-2 rounded-2xl shadow-xl border-2 border-white">
            403 RESTRICTED
          </div>
        </motion.div>

        <div className="space-y-3">
          <h1 className="text-4xl font-black text-slate-800 tracking-tight leading-none">
            Akses Ditolak!
          </h1>
          <p className="text-[10pt] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
            Ups! Kamu tidak memiliki izin <br/> untuk memasuki area ini.
          </p>
        </div>

        <div className="bg-white/40 border border-white p-4 rounded-3xl mb-4">
          <div className="flex items-center justify-center gap-3 text-slate-500">
            <Lock size={16} />
            <span className="text-[9pt] font-black uppercase tracking-tighter">Hanya untuk Admin / Level Staff Tertentu</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Link 
            href="/login"
            className="w-full px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10pt] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-rose-600 transition-all shadow-xl shadow-rose-200/50 active:scale-95"
          >
            <UserCheck size={18} /> Login Akun Lain
          </Link>
          <Link 
            href="/"
            className="w-full px-8 py-4 text-slate-400 font-black text-[10pt] uppercase tracking-widest hover:text-slate-600 transition-colors"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}