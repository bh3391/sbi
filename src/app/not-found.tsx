"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Home, MapPinOff, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-100 to-fuchsia-50 flex items-center justify-center p-6">
      <div className="text-center space-y-8 max-w-md">
        {/* Animated Icon */}
        <motion.div 
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          className="relative inline-block"
        >
          <div className="w-40 h-40 bg-white/50 backdrop-blur-xl rounded-[40px] shadow-2xl flex items-center justify-center border border-white">
            <MapPinOff size={80} className="text-fuchsia-500" />
          </div>
          {/* Badge 404 */}
          <div className="absolute -bottom-4 -right-4 bg-slate-900 text-white text-[10pt] font-black px-4 py-2 rounded-2xl shadow-xl">
            ERROR 404
          </div>
        </motion.div>

        <div className="space-y-3">
          <h1 className="text-4xl font-black text-slate-800 tracking-tight leading-none">
            Kamu Tersesat?
          </h1>
          <p className="text-[10pt] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
            Halaman yang kamu cari tidak ditemukan atau telah berpindah alamat.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          <Link 
            href="/"
            className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10pt] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-cyan-600 transition-all shadow-xl shadow-cyan-200/50 active:scale-95"
          >
            <Home size={18} /> Kembali ke Home
          </Link>
          <button 
            onClick={() => window.history.back()}
            className="w-full sm:w-auto px-8 py-4 bg-white/50 backdrop-blur-md text-slate-600 rounded-2xl font-black text-[10pt] uppercase tracking-widest flex items-center justify-center gap-2 border border-white hover:bg-white transition-all active:scale-95"
          >
            <ArrowLeft size={18} /> Balik Kanan
          </button>
        </div>
      </div>
    </div>
  );
}