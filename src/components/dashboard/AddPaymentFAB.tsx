"use client"
import { Plus, X, Wallet, Calendar, User, FileText } from "lucide-react";
import { useState } from "react";
import { createManualPayment } from "@/app/actions/payments"; 
import { motion, AnimatePresence } from "framer-motion"; // Tambahkan ini
import { toast } from "sonner";
import { auth } from "@/lib/auth";

interface Student {
  id: string;
  fullName: string;
  defaultPackageAmount?: number;
}

interface AddPaymentProps {
  locationId: string;
  students: Student[];
  currentUserId: string;
}

export default function AddPaymentFAB({ locationId, students, currentUserId }: AddPaymentProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || "");
  const [amount, setAmount] = useState<number | string>("");
  
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const handleStudentChange = (id: string) => {
    setSelectedStudentId(id);
    const student = students.find(s => s.id === id);
    if (student?.defaultPackageAmount) {
      setAmount(student.defaultPackageAmount);
    }
  };

  return (
    <>
      {/* FAB Button - Smaller */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 bg-fuchsia-600 text-white p-1.5 rounded-full shadow-[0_4px_16px_rgb(192,38,211,0.3)] hover:scale-105 transition-all active:scale-95 z-40 border border-white/10 w-9 h-9 flex items-center justify-center"
      >
        <Plus size={18} strokeWidth={2.5} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed min-h-screen inset-0 z-50 flex items-end sm:items-center justify-center">
            
            {/* Backdrop / Overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />

            {/* Modal Bottom Sheet */}
            <motion.div 
              initial={{ y: "100%" }} // Mulai dari bawah layar
              animate={{ y: 0 }}       // Slide ke atas
              exit={{ y: "100%" }}    // Slide balik ke bawah saat tutup
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative bg-white w-full mb-20 max-w-xs rounded-2xl sm:rounded-2xl overflow-hidden shadow-xl"
            >
              
              {/* Header Cyan */}
              <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 p-6 text-white relative">
                <button 
                  onClick={() => setIsOpen(false)}
                  className="absolute right-3 top-3 bg-white/20 p-0.5 rounded-full hover:bg-white/30 transition-colors"
                >
                  <X size={14} />
                </button>
                <h2 className="text-base font-black uppercase tracking-wider leading-tight">Input Pembayaran</h2>
                <p className="text-cyan-50 text-[10px] opacity-80">Update saldo & transaksi siswa</p>
              </div>

              <form 
                  action={async (formData) => {
                    // 1. Tambahkan data tambahan ke formData
                    formData.append("locationId", locationId);
                    formData.append("currentUserId", currentUserId);

                    // 2. Gunakan toast.promise untuk feedback visual
                    toast.promise(createManualPayment(formData), {
                      loading: 'Sedang mencatat pembayaran...',
                      success: (res) => {
                        // Cek apakah response dari server action sukses
                        if (res.success) {
                          setIsOpen(false); // Tutup modal hanya jika berhasil
                          return res.message || "Pembayaran berhasil disimpan!";
                        } else {
                          // Jika gagal (misal validasi backend), lempar error agar ditangkap blok 'error'
                          throw new Error(res.message || "Gagal menyimpan data");
                        }
                      },
                      error: (err) => {
                        // Muncul jika terjadi throw Error di atas atau error jaringan/sistem
                        return err.message || "Terjadi kesalahan sistem";
                      },
                    });
                  }} 
                  className="p-3 space-y-3 bg-slate-50"
                >
                
                
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold uppercase text-slate-400 ml-1 flex items-center gap-1">
                    <User size={10} /> Pilih Siswa
                  </label>
                  <select 
                    name="studentId" 
                    value={selectedStudentId}
                    onChange={(e) => handleStudentChange(e.target.value)}
                    className="w-full p-2 rounded-xl border-none bg-white shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-fuchsia-500 transition-all outline-none appearance-none text-xs"
                  >
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.fullName}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-slate-400 ml-1 flex items-center gap-1">
                      <Wallet size={10} /> Nominal
                    </label>
                    <input 
                      name="amount" 
                      type="number" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0" 
                      className="w-full p-2 bg-white border-none rounded-xl shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-fuchsia-500 outline-none font-bold text-fuchsia-600 text-xs" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-slate-400 ml-1">Metode</label>
                    <select name="method" className="w-full p-2 bg-white border-none rounded-xl shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-fuchsia-500 outline-none appearance-none text-xs">
                      <option value="CASH">CASH</option>
                      <option value="TRANSFER">TRANSFER</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-slate-400 ml-1 flex items-center gap-1">
                      <Calendar size={10} /> Bulan
                    </label>
                    <select 
                      name="month" 
                      defaultValue={new Date().getMonth() + 1}
                      className="w-full p-2 bg-white border-none rounded-xl shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-fuchsia-500 outline-none appearance-none text-xs"
                    >
                      {months.map((m, i) => (
                        <option key={m} value={i + 1}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-slate-400 ml-1">Tahun</label>
                    <input name="year" type="number" defaultValue={2026} className="w-full p-2 bg-white border-none rounded-xl shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-fuchsia-500 outline-none text-xs" />
                  </div>
                </div>
                <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase text-slate-400 ml-1 flex items-center gap-1">
                      <FileText size={10} /> Kategori
                    </label>
                    <select 
                      name="category" 
                      className="w-full p-2 bg-white border-none rounded-xl shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-fuchsia-500 outline-none appearance-none font-medium text-slate-700 text-xs"
                      defaultValue="REGISTRATION"
                    >
                      <option value="REGISTRATION">REGISTRATION</option>
                      <option value="RENEWAL">RENEWAL</option>
                      <option value="REACTIVATION"> REACTIVATION</option>
                      <option value="DEPOSIT"> DEPOSIT</option>
                      <option value="OTHER">OTHER PAYMENT</option>
                    </select>
                    <p className="text-[8px] text-slate-400 ml-2 italic">
                        *Gunakan Reactivation untuk murid lama yang baru aktif kembali.
                    </p>
                    </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold uppercase text-slate-400 ml-1 flex items-center gap-1">
                    <FileText size={10} /> Keterangan
                  </label>
                  <textarea 
                    name="notes" 
                    rows={2}
                    placeholder="Contoh: Pembayaran SPP" 
                    className="w-full p-2 bg-white border-none rounded-xl shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-fuchsia-500 outline-none text-xs" 
                  />
                </div>
                

                <div className="pt-2 space-y-3">
                  <button type="submit" className="w-full bg-gradient-to-r from-fuchsia-600 to-fuchsia-700 text-white py-2 rounded-xl font-black uppercase tracking-widest shadow-md shadow-fuchsia-200 active:scale-95 transition-all text-xs">
                    Simpan Sekarang
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setIsOpen(false)} 
                    className="w-full text-slate-400 font-bold text-xs uppercase py-1"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}