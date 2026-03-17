"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, User, Phone, MapPin, Package, 
  BookOpen, Save, Loader2, Trash2, AlertCircle 
} from "lucide-react";
import { toast } from "sonner";
import { updateStudent } from "@/app/actions/students";

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: any; // Data siswa yang akan diedit
  references: {
    locations: any[];
    packages: any[];
    subjects: any[];
  };
}

export default function StudentFormModal({ isOpen, onClose, initialData, references }: StudentFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    nickname: "",
    parentName: "",
    parentContact: "",
    locationId: "",
    packageId: "",
    subjectId: "",
    status: "ACTIVE"
  });

  // Isi data awal saat modal dibuka
  useEffect(() => {
    if (initialData) {
      setFormData({
        fullName: initialData.fullName || "",
        nickname: initialData.nickname || "",
        parentName: initialData.parentName || "",
        parentContact: initialData.parentContact || "",
        locationId: initialData.locationId || "",
        packageId: initialData.packageId || "",
        subjectId: initialData.subjectId || "",
        status: initialData.status || "ACTIVE"
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await updateStudent(initialData.id, formData);
      if (res.success) {
        toast.success("Data siswa berhasil diperbarui");
        onClose();
      } else {
        toast.error(res.message || "Gagal memperbarui data");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  };

  

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      />

      <motion.div 
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="relative w-full max-w-lg bg-white rounded-t-[32px] sm:rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-gradient-to-r from-white to-slate-50">
          <div>
            <h2 className="text-lg font-black text-slate-800 tracking-tight">Edit Profil Siswa</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Perbarui informasi detail siswa</p>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-100 text-slate-400 rounded-full hover:bg-rose-50 hover:text-rose-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
          
          {/* Section: Identitas */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-cyan-600 uppercase tracking-widest ml-1">Data Pribadi</label>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  required placeholder="Nama Lengkap Siswa"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-cyan-500 transition-all placeholder:text-slate-300"
                  value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})}
                />
              </div>
              <input 
                placeholder="Panggilan"
                className="w-full px-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-cyan-500 transition-all"
                value={formData.nickname} onChange={e => setFormData({...formData, nickname: e.target.value})}
              />
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  required placeholder="WA Orang Tua"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-cyan-500 transition-all"
                  value={formData.parentContact} onChange={e => setFormData({...formData, parentContact: e.target.value})}
                />
              </div>
              <div className="col-span-2">
                 <input 
                  placeholder="Nama Orang Tua"
                  className="w-full px-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-cyan-500 transition-all"
                  value={formData.parentName} onChange={e => setFormData({...formData, parentName: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Section: Akademik */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-fuchsia-600 uppercase tracking-widest ml-1">Pengaturan Belajar</label>
            <div className="space-y-3">
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <select 
                  required className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold appearance-none outline-none focus:ring-2 focus:ring-fuchsia-500"
                  value={formData.locationId} onChange={e => setFormData({...formData, locationId: e.target.value})}
                >
                  <option value="">Pilih Lokasi</option>
                  {references.locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <select 
                    required className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold appearance-none outline-none focus:ring-2 focus:ring-fuchsia-500"
                    value={formData.packageId} onChange={e => setFormData({...formData, packageId: e.target.value})}
                  >
                    <option value="">Paket</option>
                    {references.packages.map(pkg => <option key={pkg.id} value={pkg.id}>{pkg.name}</option>)}
                  </select>
                </div>
                <div className="relative">
                  <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <select 
                    required className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold appearance-none outline-none focus:ring-2 focus:ring-fuchsia-500"
                    value={formData.subjectId} onChange={e => setFormData({...formData, subjectId: e.target.value})}
                  >
                    <option value="">Mapel</option>
                    {references.subjects.map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Status */}
          <div className="p-4 bg-slate-50 rounded-[24px] border border-slate-100">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Status Aktif Siswa</label>
            <div className="grid grid-cols-2 gap-2">
              {['ACTIVE', 'SUSPEND', 'INACTIVE', 'NEWSTUDENT'].map((status) => (
                <button
                  key={status} type="button"
                  onClick={() => setFormData({...formData, status})}
                  className={`py-2.5 rounded-xl text-[10px] font-black transition-all border ${
                    formData.status === status 
                      ? "bg-white border-cyan-200 text-cyan-600 shadow-sm" 
                      : "bg-transparent border-transparent text-slate-400 opacity-60"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

         
        </form>

        {/* Footer Action */}
        <div className="p-6 bg-white border-t border-slate-50 flex gap-3">
          <button 
            type="button" onClick={onClose}
            className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-200 transition-all"
          >
            Batal
          </button>
          <button 
            disabled={loading}
            onClick={handleSubmit}
            className="flex-[2] bg-slate-900 text-white py-4 rounded-2xl flex items-center justify-center gap-2 font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            Simpan Perubahan
          </button>
        </div>
      </motion.div>
    </div>
  );
}