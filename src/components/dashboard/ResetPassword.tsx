"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldAlert, Eye, EyeOff, Lock, X, Loader2 } from "lucide-react";
import { updateUserPassword } from "@/app/actions/users";
import { Toaster, toast } from "sonner";

export default function ResetPasswordModal({ userId, userName, onSuccess }: any) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleReset = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(""); // Tetap gunakan setError untuk validasi input inline jika perlu

  // 1. Validasi Input
  if (password.length < 6) {
    toast.error("Password Terlalu Pendek", { description: "Minimal harus 6 karakter." });
    return setError("Minimal 6 karakter");
  }
  if (password !== confirmPassword) {
    toast.error("Password Tidak Cocok", { description: "Pastikan konfirmasi password sama." });
    return setError("Password tidak cocok");
  }

  // 2. Gunakan toast.promise untuk eksekusi
  // Kita hilangkan window.confirm karena tombol 'Reset' di UI sudah merupakan aksi sadar
  setIsLoading(true);

  toast.promise(updateUserPassword(userId, password), {
    loading: `Sedang mereset password ${userName}...`,
    success: (res: any) => {
      if (res.success) {
        onSuccess();
        return `Password ${userName} berhasil diperbarui!`;
      } else {
        throw new Error(res.message || "Gagal memperbarui database");
      }
    },
    error: (err) => {
      setError(err.message);
      return err.message || "Terjadi kesalahan sistem";
    },
    finally: () => {
      setIsLoading(false);
    },
  });
};

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop - Klik di sini untuk menutup */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onSuccess}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm cursor-pointer"
      />

      {/* Modal Content */}
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        // e.stopPropagation mencegah klik di dalam modal "tembus" ke backdrop
        onClick={(e) => e.stopPropagation()} 
        className="relative w-full max-w-sm bg-white rounded-[32px] overflow-hidden shadow-2xl z-10 pointer-events-auto"
      >
        {/* Decorative Top Bar */}
        <div className="h-2 bg-gradient-to-r from-amber-400 via-rose-500 to-fuchsia-600" />
        
        <div className="p-8 space-y-6">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-amber-50 text-amber-500 rounded-2xl shadow-sm">
              <ShieldAlert size={24} />
            </div>
            {/* Tombol Close X */}
            <button 
              type="button" // Pastikan type button agar tidak trigger submit form
              onClick={(e) => {
                e.preventDefault();
                onSuccess();
              }}
              className="p-2 hover:bg-slate-100 active:bg-slate-200 rounded-full text-slate-400 transition-all"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Reset Password</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
              Mengubah akses masuk untuk <br/>
              <span className="text-fuchsia-600 font-black">{userName}</span>
            </p>
          </div>

          <form onSubmit={handleReset} className="space-y-4">
            {/* Password Baru */}
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Password Baru</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Konfirmasi Password */}
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Konfirmasi Password</label>
              <input
                type={showPass ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-4 bg-slate-50 border-none rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
                placeholder="••••••••"
                autoComplete="new-password"
                required
              />
            </div>

            {/* Error Message */}
            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-rose-50 p-3 rounded-xl border border-rose-100"
              >
                <p className="text-[10px] font-bold text-rose-500 text-center italic leading-tight">
                  {error}
                </p>
              </motion.div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-slate-900 text-white rounded-[20px] font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-amber-500 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>Update Password <Lock size={14} /></>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}