"use client";
import { useState } from "react";
import { createUser } from "@/app/actions/users";
import { X, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function AddTeacherForm({ locations, onClose }: any) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    const res = await createUser(data);
    if (res.success){} onClose();
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose} // Klik di luar untuk tutup
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />

      {/* 2. Modal Container */}
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-md bg-white rounded-[32px] overflow-hidden shadow-2xl z-10"
      >
    <div className="relative w-full max-w-md bg-white rounded-[32px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
      <div className="h-2 bg-gradient-to-r from-cyan-400 to-fuchsia-500" />
      
      <form onSubmit={handleSubmit} className="p-8 space-y-5">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-black text-slate-800 tracking-tight">Register Staff</h2>
          <button type="button" onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full text-slate-400"><X size={20} /></button>
        </div>

        <div className="space-y-4">
          <input name="name" required placeholder="Nama Lengkap" className="w-full p-4 bg-slate-50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-cyan-500/20 outline-none" />
          
          <div className="grid grid-cols-2 gap-3">
            <input name="nickname" placeholder="Panggilan" className="w-full p-4 bg-slate-50 border-none rounded-2xl text-xs font-bold outline-none" />
            <select name="role" className="w-full p-4 bg-slate-50 border-none rounded-2xl text-xs font-bold outline-none">
              <option value="TEACHER">TEACHER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>

          <input name="email" type="email" required placeholder="Email Address" className="w-full p-4 bg-slate-50 border-none rounded-2xl text-xs font-bold outline-none" />
          
          <input name="specialization" placeholder="Spesialisasi (Contoh: Math, English)" className="w-full p-4 bg-slate-50 border-none rounded-2xl text-xs font-bold outline-none" />

          <select name="homebaseId" required className="w-full p-4 bg-slate-50 border-none rounded-2xl text-xs font-bold outline-none">
            <option value="">Pilih Homebase</option>
            {locations.map((loc: any) => (
              <option key={loc.id} value={loc.id}>{loc.name}</option>
            ))}
          </select>
        </div>

        <button 
          disabled={loading}
          className="w-full py-4 bg-slate-900 text-white rounded-[20px] font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-cyan-600 transition-all flex items-center justify-center gap-2"
        >
          {loading ? "Processing..." : <>Daftarkan Staff <Sparkles size={14} /></>}
        </button>
      </form>
    </div>
    </motion.div>
    </div>
  );
}