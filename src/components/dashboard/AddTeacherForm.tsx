"use client";
import { useState } from "react";
import { createUser } from "@/app/actions/users";
import { X, Sparkles, User, Briefcase, MapPin, Mail } from "lucide-react";
import { motion } from "framer-motion";

export default function AddTeacherForm({ locations, onClose }: any) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    const res = await createUser(data);
    if (res.success) {
      onClose();
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* 1. Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />

      {/* 2. Modal Container */}
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 40 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full max-w-md bg-white rounded-[32px] overflow-hidden shadow-2xl z-10"
      >
        {/* Accent Bar */}
        <div className="h-2 bg-gradient-to-r from-cyan-400 to-fuchsia-500" />
        
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight leading-none">Register Staff</h2>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-1">Lembaga Management System</p>
            </div>
            <button 
              type="button" 
              onClick={onClose} 
              className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4">
            {/* Nama Lengkap */}
            <div className="relative">
              <User className="absolute left-4 top-4 text-slate-300" size={16} />
              <input 
                name="name" 
                required 
                placeholder="Nama Lengkap" 
                className="w-full pl-12 p-4 bg-slate-50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-cyan-500/20 outline-none placeholder:text-slate-300" 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <input 
                name="nickname" 
                placeholder="Panggilan" 
                className="w-full p-4 bg-slate-50 border-none rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-cyan-500/20" 
              />
              <select 
                name="role" 
                className="w-full p-4 bg-slate-50 border-none rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-cyan-500/20 appearance-none text-slate-700"
              >
                <option value="TEACHER">👩‍🏫 TEACHER</option>
                <option value="ADMIN">🛡️ ADMIN</option>
              </select>
            </div>

            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-4 top-4 text-slate-300" size={16} />
              <input 
                name="email" 
                type="email" 
                required 
                placeholder="Email Address" 
                className="w-full pl-12 p-4 bg-slate-50 border-none rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-cyan-500/20" 
              />
            </div>
            
            {/* Specialization */}
            <div className="relative">
              <Briefcase className="absolute left-4 top-4 text-slate-300" size={16} />
              <input 
                name="specialization" 
                placeholder="Spesialisasi (Math, English, dll)" 
                className="w-full pl-12 p-4 bg-slate-50 border-none rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-fuchsia-500/20" 
              />
            </div>

            {/* Homebase */}
            <div className="relative">
              <MapPin className="absolute left-4 top-4 text-slate-300" size={16} />
              <select 
                name="homebaseId" 
                required 
                className="w-full pl-12 p-4 bg-slate-50 border-none rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-cyan-500/20 appearance-none text-slate-700"
              >
                <option value="">Pilih Homebase</option>
                {locations.map((loc: any) => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
            </div>
          </div>

          <button 
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-[20px] font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:shadow-cyan-100 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? "Processing..." : <>Daftarkan Staff <Sparkles size={14} className="text-cyan-400" /></>}
          </button>
        </form>
      </motion.div>
    </div>
  );
}