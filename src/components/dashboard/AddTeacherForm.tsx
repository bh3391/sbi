"use client";
import { useState } from "react";
import { createUser } from "@/app/actions/users";
import {
  X,
  Sparkles,
  User,
  Briefcase,
  MapPin,
  Mail,
  Phone,
  Fingerprint,
  Globe,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function AddTeacherForm({ locations, onClose }: any) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    // Konversi checkbox isRemote ke boolean
    const payload = {
      ...data,
      isRemote: formData.get("isRemote") === "on",
    };

    toast.promise(createUser(payload), {
      loading: "Sedang membuat akun user...",
      success: (res) => {
        if (res.success) {
          onClose();
          return `Akun ${data.role || "User"} berhasil dibuat!`;
        } else {
          throw new Error(res.message || "Gagal membuat user");
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
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full max-w-md bg-white rounded-[32px] overflow-hidden shadow-2xl z-10"
      >
        <div className="h-2 bg-gradient-to-r from-cyan-400 to-fuchsia-500" />

        <form
          onSubmit={handleSubmit}
          className="p-8 space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar"
        >
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight leading-none">
                Register Staff
              </h2>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-1">
                Lembaga Management System
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-slate-50 rounded-full text-slate-400"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-3">
            {/* Custom ID (Manual ID) */}
            <div className="relative">
              <Fingerprint
                className="absolute left-4 top-4 text-slate-300"
                size={16}
              />
              <input
                name="id"
                placeholder="Custom ID (Kosongkan untuk Auto)"
                className="w-full pl-12 p-4 bg-slate-50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-cyan-500/20 outline-none placeholder:text-slate-300"
              />
            </div>

            {/* Nama Lengkap & Panggilan */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 relative">
                <User
                  className="absolute left-4 top-4 text-slate-300"
                  size={16}
                />
                <input
                  name="name"
                  required
                  placeholder="Nama Lengkap"
                  className="w-full pl-12 p-4 bg-slate-50 border-none rounded-2xl text-xs font-bold outline-none"
                />
              </div>
              <input
                name="nickname"
                placeholder="Panggilan"
                className="w-full p-4 bg-slate-50 border-none rounded-2xl text-xs font-bold outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <Mail
                  className="absolute left-4 top-4 text-slate-300"
                  size={16}
                />
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="Email"
                  className="w-full pl-12 p-4 bg-slate-50 border-none rounded-2xl text-xs font-bold outline-none"
                />
              </div>
              <div className="relative">
                <Phone
                  className="absolute left-4 top-4 text-slate-300"
                  size={16}
                />
                <input
                  name="contact"
                  placeholder="No. WA (62...)"
                  className="w-full pl-12 p-4 bg-slate-50 border-none rounded-2xl text-xs font-bold outline-none"
                />
              </div>
            </div>

            {/* Role & Specialization */}
            <div className="grid grid-cols-2 gap-3">
              <select
                name="role"
                className="w-full p-4 bg-slate-50 border-none rounded-2xl text-xs font-bold outline-none text-slate-700"
              >
                <option value="TEACHER">TEACHER</option>
                <option value="ADMIN">ADMIN</option>
                <option value="MANAGEMENT">MANAGEMENT</option>
              </select>
              <div className="relative">
                <Briefcase
                  className="absolute left-4 top-4 text-slate-300"
                  size={16}
                />
                <input
                  name="specialization"
                  placeholder="Spesialisasi"
                  className="w-full pl-12 p-4 bg-slate-50 border-none rounded-2xl text-xs font-bold outline-none"
                />
              </div>
            </div>

            {/* Homebase */}
            <div className="relative">
              <MapPin
                className="absolute left-4 top-4 text-slate-300"
                size={16}
              />
              <select
                name="homebaseId"
                required
                className="w-full pl-12 p-4 bg-slate-50 border-none rounded-2xl text-xs font-bold outline-none text-slate-700 appearance-none"
              >
                <option value="">Pilih Homebase / Cabang</option>
                {locations.map((loc: any) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Is Remote Toggle */}
            <label className="flex items-center gap-3 p-4 bg-cyan-50/50 rounded-2xl cursor-pointer hover:bg-cyan-50 transition-colors">
              <Globe className="text-cyan-600" size={18} />
              <div className="flex-1">
                <p className="text-[10px] font-black text-slate-800 uppercase tracking-tighter">
                  Remote Staff
                </p>
                <p className="text-[8px] text-slate-500 uppercase tracking-widest font-bold">
                  Bisa absen di mana saja
                </p>
              </div>
              <input
                name="isRemote"
                type="checkbox"
                className="w-5 h-5 rounded-md border-cyan-200 text-cyan-600 focus:ring-cyan-500"
              />
            </label>
          </div>

          <button
            disabled={loading}
            className="w-full py-4 bg-slate-900 text-white rounded-[20px] font-black text-[10px] uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            {loading ? (
              "Processing..."
            ) : (
              <>
                Daftarkan Staff <Sparkles size={14} className="text-cyan-400" />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
