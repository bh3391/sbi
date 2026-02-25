"use client";
import { useState } from "react";
import { updateTeacher } from "@/app/actions/users"; // Pastikan buat action update
import { X, Save, User, Briefcase, MapPin, Mail, FileText, Camera } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function EditTeacherForm({ locations, teacherData, onClose }: any) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    // Kirim ID guru agar backend tahu mana yang diupdate
    const res = await updateTeacher(teacherData.id, data);
    toast.promise(updateTeacher(teacherData.id, data), {
    loading: 'Memperbarui profil guru...',
    success: (res: any) => { // Gunakan :any jika interface backend belum fix
      if (res.success) {
        onClose();
        return `Data ${data.fullName || 'Guru'} berhasil diperbarui!`;
      } else {
        // Melempar error ke handler 'error' di bawah
        throw new Error(res.message || "Gagal memperbarui data");
      }
    },
    error: (err) => {
      return err.message || "Terjadi kesalahan sistem";
    },
    finally: () => {
      setLoading(false);
    },
  });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />

      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 40 }}
        className="relative w-full max-w-md bg-white rounded-[32px] overflow-hidden shadow-2xl z-10"
      >
        <div className="h-2 bg-gradient-to-r from-fuchsia-500 to-cyan-400" />
        
        <form onSubmit={handleSubmit} className="p-8 space-y-5 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight leading-none">Edit Profile Guru</h2>
              <p className="text-[10px] text-fuchsia-500 uppercase font-bold tracking-widest mt-1 text-left">Update Data Tenaga Pengajar</p>
            </div>
            <button type="button" onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full text-slate-400"><X size={20} /></button>
          </div>

          {/* Avatar Section */}
          <div className="flex justify-center py-2">
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center border-2 border-slate-50 overflow-hidden">
                {teacherData.image ? (
                    <img src={teacherData.image} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                    <User size={32} className="text-slate-300" />
                )}
              </div>
              <button type="button" className="absolute -bottom-2 -right-2 bg-white shadow-md p-1.5 rounded-xl text-cyan-600 border border-slate-100">
                <Camera size={14} />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {/* Menggunakan defaultValue agar input bisa diedit */}
            <div className="relative">
              <User className="absolute left-4 top-4 text-slate-300" size={16} />
              <input 
                name="name" 
                defaultValue={teacherData.name}
                required 
                placeholder="Nama Lengkap" 
                className="w-full pl-12 p-4 bg-slate-50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-fuchsia-500/20 outline-none" 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <input 
                name="nickname" 
                defaultValue={teacherData.nickname}
                placeholder="Panggilan" 
                className="w-full p-4 bg-slate-50 border-none rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-fuchsia-500/20" 
              />
              <div className="relative">
                <select 
                  name="homebaseId" 
                  defaultValue={teacherData.homebaseId}
                  required 
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-cyan-500/20 appearance-none"
                >
                  {locations.map((loc: any) => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="relative">
              <Mail className="absolute left-4 top-4 text-slate-300" size={16} />
              <input 
                name="email" 
                type="email" 
                defaultValue={teacherData.email}
                required 
                placeholder="Email Address" 
                className="w-full pl-12 p-4 bg-slate-50 border-none rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-cyan-500/20" 
              />
            </div>
            
            <div className="relative">
              <Briefcase className="absolute left-4 top-4 text-slate-300" size={16} />
              <input 
                name="specialization" 
                defaultValue={teacherData.specialization}
                placeholder="Spesialisasi (Math, English, dll)" 
                className="w-full pl-12 p-4 bg-slate-50 border-none rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-fuchsia-500/20" 
              />
            </div>

            <div className="relative">
              <FileText className="absolute left-4 top-4 text-slate-300" size={16} />
              <textarea 
                name="bio" 
                defaultValue={teacherData.bio}
                placeholder="Bio singkat atau pengalaman mengajar..." 
                rows={2}
                className="w-full pl-12 p-4 bg-slate-50 border-none rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-fuchsia-500/20 resize-none" 
              />
            </div>
          </div>

          <button 
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-fuchsia-600 to-cyan-500 text-white rounded-[20px] font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {loading ? "Updating..." : <>Simpan Perubahan <Save size={14} /></>}
          </button>
        </form>
      </motion.div>
    </div>
  );
}