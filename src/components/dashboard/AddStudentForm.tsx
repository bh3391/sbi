"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Check, ChevronDown, MapPin, Package as PkgIcon, BookOpen, Loader2, CreditCard, Banknote, Info, ShieldCheck } from "lucide-react";
import { createStudent } from "@/app/actions/students";
import { toast } from "sonner";

export default function AddStudentForm({ onClose, locations, packages, subjects, addOns = [] }: any) {
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState("TRANSFER");
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [isSubjectOpen, setIsSubjectOpen] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  const toggleAddon = (id: string) => {
    setSelectedAddons(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const toggleSubject = (id: string) => {
    setSelectedSubjects(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const selectedNames = subjects
    .filter((s: any) => selectedSubjects.includes(s.id))
    .map((s: any) => s.name)
    .join(", ");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validasi Dasar
    if (selectedSubjects.length === 0) {
        return toast.error("Pilih minimal satu subjek utama");
    }

    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    // CATATAN: Jangan ubah formData menjadi Object! 
    // Kirim langsung objek formData ke server action.

    toast.promise(createStudent(formData), {
      loading: 'Mendaftarkan siswa baru...',
      success: (res: any) => {
        if (res.success) {
          onClose();
          return `Siswa berhasil didaftarkan!`;
        } else {
          throw new Error(res.message);
        }
      },
      error: (err) => {
        setLoading(false);
        return err.message || "Gagal mendaftarkan siswa";
      },
      finally: () => {
        setLoading(false);
      },
    });
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="relative bg-white bg-gradient-to-br from-slate-50 to-white w-full max-w-lg h-[92vh] sm:h-auto sm:max-h-[90vh] rounded-t-[30px] sm:rounded-[32px] shadow-2xl overflow-hidden flex flex-col"
      >
        {/* HEADER */}
        <header className="p-5 border-b border-slate-100 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-fuchsia-500 text-white rounded-xl shadow-lg shadow-fuchsia-200">
              <User size={18} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-800">Registrasi Siswa</h2>
              <p className="text-[9px] text-fuchsia-500 font-bold uppercase tracking-wider">Admin Internal Entry</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-full text-slate-400 hover:bg-rose-500 hover:text-white transition-all">
            <X size={16} strokeWidth={3} />
          </button>
        </header>

        <form onSubmit={handleSubmit} id="studentForm" className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          
          {/* SECTION: IDENTITAS */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-4 bg-cyan-500 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.5)]"></div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Informasi Personal</label>
            </div>
            
            <div className="grid grid-cols-1 gap-3.5">
              <div className="relative group">
                <input name="fullName" required placeholder="Nama Lengkap Siswa" className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl text-[11px] font-bold focus:border-cyan-500 focus:bg-cyan-50/10 outline-none transition-all" />
              </div>
              
              <div className="grid grid-cols-2 gap-3.5">
                <input name="nickname" required placeholder="Panggilan" className="p-4 bg-white border-2 border-slate-100 rounded-2xl text-[11px] font-bold focus:border-cyan-500 outline-none transition-all" />
                <input name="parentContact" required placeholder="WA (628...)" className="p-4 bg-white border-2 border-slate-100 rounded-2xl text-[11px] font-bold focus:border-cyan-500 outline-none transition-all" />
              </div>

              <input name="parentName" required placeholder="Nama Orang Tua / Wali" className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl text-[11px] font-bold focus:border-cyan-500 outline-none transition-all" />
              
              <div className="grid grid-cols-2 gap-3.5">
                <div className="relative">
                  <select name="status" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-[10px] font-black text-slate-600 appearance-none outline-none focus:border-cyan-500 cursor-pointer">
                    <option value="NEWSTUDENT">NEWSTUDENT</option>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                    <option value="SUSPEND">SUSPEND</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-4 top-4.5 text-slate-400 pointer-events-none" />
                </div>
                
                <div className="relative">
                  <input type="file" name="imageProfile" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                  <div className="p-4 bg-white border-2 border-dashed border-slate-200 rounded-2xl text-[9px] font-black text-slate-400 text-center hover:border-cyan-400 transition-colors">
                    FOTO SISWA
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION: AKADEMIK */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-4 bg-fuchsia-500 rounded-full shadow-[0_0_8px_rgba(217,70,239,0.5)]"></div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Penempatan & Kursus</label>
            </div>

            <div className="grid grid-cols-1 gap-3.5">
              <div className="relative">
                <MapPin className="absolute left-4 top-4 text-fuchsia-400" size={16} />
                <select name="locationId" required className="w-full p-4 pl-12 bg-white border-2 border-slate-100 rounded-2xl text-[11px] font-bold appearance-none outline-none focus:border-fuchsia-500 transition-all">
                  <option value="">Pilih Cabang</option>
                  {locations.map((loc: any) => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-4 top-4.5 text-slate-400 pointer-events-none" />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="relative">
                  <PkgIcon className="absolute left-4 top-4 text-fuchsia-400" size={16} />
                  <select name="packageId" required className="w-full p-4 pl-12 bg-white border-2 border-slate-100 rounded-2xl text-[11px] font-bold appearance-none outline-none focus:border-fuchsia-500 transition-all">
                    <option value="">Pilih Paket</option>
                    {packages.map((pkg: any) => <option key={pkg.id} value={pkg.id}>{pkg.name}</option>)}
                  </select>
                </div>

                {/* MULTI SELECT SUBJECTS */}
                <div className="relative">
                  <button type="button" onClick={() => setIsSubjectOpen(!isSubjectOpen)} className="w-full p-4 pl-12 pr-10 bg-white border-2 border-slate-100 rounded-2xl text-[11px] font-bold text-left truncate focus:border-fuchsia-500 transition-all">
                    <BookOpen className="absolute left-4 top-4 text-fuchsia-400" size={16} />
                    {selectedSubjects.length > 0 ? selectedNames : "Subjek"}
                  </button>
                  <input type="hidden" name="subjectIds" value={JSON.stringify(selectedSubjects)} />
                  
                  <AnimatePresence>
                    {isSubjectOpen && (
                      <>
                        <div className="fixed inset-0 z-[60]" onClick={() => setIsSubjectOpen(false)} />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="absolute bottom-full mb-2 left-0 right-0 bg-white border border-slate-100 rounded-2xl shadow-2xl z-[70] p-2 overflow-hidden">
                           <div className="max-h-48 overflow-y-auto p-1 space-y-1">
                            {subjects.map((sub: any) => (
                              <button key={sub.id} type="button" onClick={() => toggleSubject(sub.id)} className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${selectedSubjects.includes(sub.id) ? "bg-fuchsia-50 text-fuchsia-600" : "hover:bg-slate-50 text-slate-500"}`}>
                                <span className="text-[10px] font-bold uppercase">{sub.name}</span>
                                {selectedSubjects.includes(sub.id) && <Check size={14} strokeWidth={3} />}
                              </button>
                            ))}
                           </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION: ADDONS */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-4 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.5)]"></div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Add-on Services</label>
            </div>
            <input type="hidden" name="addonIds" value={JSON.stringify(selectedAddons)} />
            <div className="grid grid-cols-1 gap-2.5">
              {addOns?.map((addOn: any) => (
                <button key={addOn.id} type="button" onClick={() => toggleAddon(addOn.id)} className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${selectedAddons.includes(addOn.id) ? "border-cyan-500 bg-cyan-50/50" : "border-slate-100 bg-white hover:border-slate-200"}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center ${selectedAddons.includes(addOn.id) ? "bg-cyan-500 border-cyan-500 text-white" : "border-slate-200"}`}>
                      {selectedAddons.includes(addOn.id) && <Check size={12} strokeWidth={4} />}
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] font-black uppercase text-slate-700">{addOn.name}</p>
                      <p className="text-[8px] font-bold text-cyan-600">+{addOn.sesiCredit} Sesi</p>
                    </div>
                  </div>
                  <p className="text-[10px] font-black text-slate-400">Rp {addOn.price.toLocaleString()}</p>
                </button>
              ))}
            </div>
          </section>

          {/* SECTION: PEMBAYARAN */}
          <section className="space-y-4 pb-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Metode Pembayaran</label>
            <input type="hidden" name="method" value={method} />
            <div className="grid grid-cols-2 gap-3.5">
              <button type="button" onClick={() => setMethod("TRANSFER")} className={`p-5 rounded-[2.5rem] border-2 transition-all flex flex-col items-center gap-3 ${method === "TRANSFER" ? "border-cyan-500 bg-cyan-50 shadow-xl shadow-cyan-100" : "border-slate-100 opacity-60 grayscale hover:grayscale-0"}`}>
                <div className={`h-11 w-11 rounded-2xl flex items-center justify-center ${method === "TRANSFER" ? "bg-cyan-500 text-white" : "bg-slate-100 text-slate-400"}`}><CreditCard size={20} /></div>
                <div className="text-center"><p className="text-[11px] font-black uppercase tracking-wider">Transfer</p><p className="text-[8px] font-bold opacity-60">ADMIN VERIFY</p></div>
              </button>

              <button type="button" onClick={() => setMethod("CASH")} className={`p-5 rounded-[2.5rem] border-2 transition-all flex flex-col items-center gap-3 ${method === "CASH" ? "border-emerald-500 bg-emerald-50 shadow-xl shadow-emerald-100" : "border-slate-100 opacity-60 grayscale hover:grayscale-0"}`}>
                <div className={`h-11 w-11 rounded-2xl flex items-center justify-center ${method === "CASH" ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"}`}><Banknote size={20} /></div>
                <div className="text-center"><p className="text-[11px] font-black uppercase tracking-wider">Tunai</p><p className="text-[8px] font-bold opacity-60">AUTO ACTIVE</p></div>
              </button>
            </div>

            <div className={`p-4 rounded-2xl flex items-start gap-3 border-2 border-dashed ${method === "CASH" ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-amber-50 border-amber-100 text-amber-700"}`}>
              <Info size={16} className="shrink-0 mt-0.5" />
              <p className="text-[9px] font-bold leading-relaxed uppercase tracking-wide">
                {method === "CASH" 
                  ? "CASH = Pembayaran diterima di tempat. Kuota sesi siswa langsung aktif." 
                  : "TRANSFER = Status PENDING. Memerlukan konfirmasi manual oleh Admin Pusat."}
              </p>
            </div>
          </section>
        </form>

        <footer className="p-6 bg-white border-t border-slate-100 sticky bottom-0 z-10 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
          <button 
            type="submit" 
            form="studentForm"
            disabled={loading}
            className="w-full py-5 bg-fuchsia-500 text-white rounded-[2rem] font-black text-[12px] uppercase tracking-[0.25em] flex items-center justify-center gap-3 shadow-2xl shadow-slate-200 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : (
              <>
                <ShieldCheck size={18} />
                Finalisasi Pendaftaran
              </>
            )}
          </button>
        </footer>
      </motion.div>
    </div>
  );
}