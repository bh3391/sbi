"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { GraduationCap, ArrowRight, Users, Sparkles, LogIn } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans selection:bg-cyan-100">
      
      {/* --- NAVIGATION --- */}
      <nav className="fixed top-0 w-full z-50 bg-cyan-100/70 backdrop-blur-lg border-b border-slate-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-fuchsia-600 flex items-center justify-center text-white shadow-lg">
              <GraduationCap size={18} />
            </div>
            <span className="font-black text-slate-800 tracking-tighter text-lg">BIMB<span className="text-cyan-500">ELS.</span></span>
          </div>
          
          <Link 
            href="/entrance-guru" 
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-fuchsia-600 transition-colors"
          >
            <LogIn size={14} /> Portal Guru
          </Link>
        </div>
      </nav>

      {/* --- SECTION 1: HERO --- */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Abstract Background Blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-cyan-400/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-10 right-10 w-72 h-72 bg-fuchsia-400/10 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-4xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-100 mb-6"
          >
            <Sparkles size={12} className="text-fuchsia-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Pendaftaran 2026 Kini Dibuka</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black text-slate-900 leading-[1.1] tracking-tight"
          >
            Bimbingan Belajar <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 to-fuchsia-600">Masa Depan.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="mt-6 text-slate-500 text-sm md:text-base max-w-xl mx-auto font-medium leading-relaxed"
          >
            Personalisasi belajar dengan kurikulum modern dan sistem tracking real-time. Kami membantu siswa mencapai potensi maksimal mereka.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link 
              href="/pendaftaran-siswa"
              className="group relative w-full sm:w-auto px-8 py-4 bg-slate-900 rounded-2xl overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-xl shadow-slate-200"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-fuchsia-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative flex items-center justify-center gap-2 text-white font-black text-xs uppercase tracking-widest">
                Daftar Sekarang <ArrowRight size={16} />
              </span>
            </Link>
            
            <button className="w-full sm:w-auto px-8 py-4 bg-white border border-slate-200 rounded-2xl text-slate-600 font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">
              Lihat Program
            </button>
          </motion.div>
        </div>
      </section>

      {/* --- SECTION 2: STATS/TRUST --- */}
      <section className="py-20 bg-slate-50/50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <Users className="text-cyan-500" />, label: "Siswa Aktif", val: "500+" },
              { icon: <Sparkles className="text-fuchsia-500" />, label: "Tingkat Kelulusan", val: "98%" },
              { icon: <GraduationCap className="text-amber-500" />, label: "Cabang", val: "12 Unit" },
            ].map((stat, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -5 }}
                className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex flex-col items-center text-center"
              >
                <div className="mb-4 p-3 bg-slate-50 rounded-2xl">
                  {stat.icon}
                </div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">{stat.val}</h3>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          <footer className="mt-20 text-center">
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.5em]">© 2026 Modern Learning Center System</p>
          </footer>
        </div>
      </section>
    </div>
  );
}