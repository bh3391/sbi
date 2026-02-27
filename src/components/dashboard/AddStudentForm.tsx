"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { X, User, Phone, MapPin, Package as PkgIcon, BookOpen, Loader2, CreditCard, Banknote, Info } from "lucide-react";
import { createStudent } from "@/app/actions/students";
import { toast } from "sonner";

export default function AddStudentForm({ onClose, locations, packages, subjects }: any) {
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState("TRANSFER");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    toast.promise(createStudent(data), {
    loading: 'Mendaftarkan siswa baru...',
    success: (res) => {
      if (res.success) {
        onClose();
        // Berikan feedback tambahan yang spesifik
        return `Siswa ${data.fullName} berhasil didaftarkan!`;
      } else {
        throw new Error(res.message);
      }
    },
    error: (err) => {
      return err.message || "Gagal mendaftarkan siswa";
    },
    finally: () => {
      setLoading(false);
    },
  });
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        className="relative bg-white bg-gradient-to-br from-cyan-50 via-white to-fuchsia-50 w-full max-w-lg h-[92vh] rounded-t-[30px] shadow-2xl overflow-hidden flex flex-col"
      >
        <header className="p-5 border-b border-slate-100 flex justify-between items-center bg-white/50 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-fuchsia-500 text-white rounded-lg"><User size={18} /></div>
            <div>
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-800">Registrasi Siswa</h2>
              <p className="text-[9px] text-slate-400 font-bold uppercase">Admin Internal Entry</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-fuchsia-500 rounded-full text-white hover:bg-rose-500 transition-colors"><X size={16}/></button>
        </header>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* IDENTITAS */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1 h-3 bg-cyan-500 rounded-full"></span>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Informasi Dasar</label>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <input name="fullName" required placeholder="Nama Lengkap Siswa" className="w-full p-3.5 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:border-cyan-500 outline-none shadow-sm" />
              <div className="grid grid-cols-2 gap-3">
                <input name="nickname" required placeholder="Panggilan" className="p-3.5 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:border-cyan-500 outline-none shadow-sm" />
                <input name="parentContact" required placeholder="WhatsApp Ortu (628...)" className="p-3.5 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:border-cyan-500 outline-none shadow-sm" />
              </div>
            </div>
          </div>
          
            <div className="grid grid-cols-1 gap-3">
            {/* Field Nama Orang Tua */}
            <input name="parentName" required placeholder="Nama Orang Tua / Wali" className="w-full p-3.5 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:border-cyan-500 outline-none" />
            
            <div className="grid grid-cols-2 gap-3">
                {/* Field Status - Hanya di Internal Admin */}
                <div className="relative">
                <select name="status" className="w-full p-3.5 bg-white border border-slate-200 rounded-xl text-[10px] font-bold appearance-none outline-none focus:border-cyan-500">
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                    <option value="SUSPEND">SUSPEND</option>
                    <option value="NEWSTUDENT">NEWSTUDENT</option>
                </select>
                </div>
                
                {/* Field Upload Foto */}
                <div className="relative">
                <input type="file" name="imageProfile" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" />
                <div className="p-3.5 bg-white border border-dashed border-slate-300 rounded-xl text-[10px] font-bold text-slate-400 text-center">
                    Upload Foto Siswa
                </div>
                </div>
            </div>
            </div>

          {/* AKADEMIK & LOKASI */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1 h-3 bg-fuchsia-500 rounded-full"></span>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Paket & Penempatan</label>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <div className="relative">
                <MapPin className="absolute left-3 top-3.5 text-slate-400" size={14} />
                <select name="locationId" required className="w-full p-3.5 pl-10 bg-white border border-slate-200 rounded-xl text-xs font-bold appearance-none outline-none focus:border-cyan-500 shadow-sm">
                  <option value="">Pilih Lokasi Cabang</option>
                  {locations.map((loc: any) => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <PkgIcon className="absolute left-3 top-3.5 text-slate-400" size={14} />
                  <select name="packageId" required className="w-full p-3.5 pl-10 bg-white border border-slate-200 rounded-xl text-[10px] font-bold appearance-none outline-none focus:border-fuchsia-500 shadow-sm">
                    <option value="">Pilih Paket</option>
                    {packages.map((pkg: any) => <option key={pkg.id} value={pkg.id}>{pkg.name}</option>)}
                  </select>
                </div>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-3.5 text-slate-400" size={14} />
                  <select name="subjectId" required className="w-full p-3.5 pl-10 bg-white border border-slate-200 rounded-xl text-[10px] font-bold appearance-none outline-none focus:border-fuchsia-500 shadow-sm">
                    <option value="">Subjek Utama</option>
                    {subjects.map((sub: any) => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>
         




          <div className="space-y-3 px-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">
              Metode Pembayaran
            </label>
            <input type="hidden" name="method" value={method} />
            
            <div className="grid grid-cols-2 gap-3">
              {/* OPSI TRANSFER */}
              <button
                type="button"
                onClick={() => setMethod("TRANSFER")}
                className={`p-4 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-2 ${
                  method === "TRANSFER"
                    ? "border-cyan-500 bg-cyan-50 shadow-lg shadow-cyan-100"
                    : "border-slate-100 bg-white text-slate-400 hover:border-slate-200"
                }`}
              >
                <div className={`h-10 w-10 rounded-2xl flex items-center justify-center ${
                  method === "TRANSFER" ? "bg-cyan-500 text-white" : "bg-slate-100"
                }`}>
                  <CreditCard size={20} />
                </div>
                <div className="text-center">
                  <p className={`text-[11px] font-black uppercase ${method === "TRANSFER" ? "text-cyan-700" : ""}`}>Transfer</p>
                  <p className="text-[8px] font-bold opacity-60 uppercase mt-0.5">Sesi Pending</p>
                </div>
              </button>

              {/* OPSI CASH */}
              <button
                type="button"
                onClick={() => setMethod("CASH")}
                className={`p-4 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-2 ${
                  method === "CASH"
                    ? "border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-100"
                    : "border-slate-100 bg-white text-slate-400 hover:border-slate-200"
                }`}
              >
                <div className={`h-10 w-10 rounded-2xl flex items-center justify-center ${
                  method === "CASH" ? "bg-emerald-500 text-white" : "bg-slate-100"
                }`}>
                  <Banknote size={20} />
                </div>
                <div className="text-center">
                  <p className={`text-[11px] font-black uppercase ${method === "CASH" ? "text-emerald-700" : ""}`}>Tunai / Cash</p>
                  <p className="text-[8px] font-bold opacity-60 uppercase mt-0.5">Sesi Aktif</p>
                </div>
              </button>
            </div>

            {/* INFORMASI DINAMIS */}
            <div className={`mt-4 p-4 rounded-2xl border-2 border-dashed flex items-start gap-3 transition-colors ${
              method === "CASH" ? "border-emerald-100 bg-emerald-50/50" : "border-amber-100 bg-amber-50/50"
            }`}>
              <div className={`mt-1 ${method === "CASH" ? "text-emerald-500" : "text-amber-500"}`}>
                <Info size={16} />
              </div>
              <p className="text-[10px] font-bold text-slate-600 leading-relaxed">
                {method === "CASH" 
                  ? "Pembayaran Tunai akan langsung mengaktifkan kuota sesi siswa. Gunakan ini jika uang sudah diterima di outlet."
                  : "Metode Transfer akan membuat status pembayaran PENDING. Admin pusat harus melakukan verifikasi sebelum sesi siswa aktif."}
              </p>
            </div>
          </div>
          
          
          <footer className="p-6 bg-white border-t border-slate-50">
          <button 
            type="submit" 
            disabled={loading}
            onClick={(e: any) => e.currentTarget.closest('form').requestSubmit()}
            className="w-full py-4 bg-fuchsia-500 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : "Konfirmasi & Daftarkan"}
          </button>
        </footer>
        </form>

        
      </motion.div>
    </div>
  );
}