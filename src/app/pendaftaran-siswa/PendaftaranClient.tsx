"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Send, GraduationCap, Info, ShieldCheck,Sparkles, ChevronDown, Check } from "lucide-react";
import { registerStudentPublic } from "@/app/actions/students";
import { toast } from "sonner";

export default function PendaftaranClient({ locations, packages, subjects, addOns }: any) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [showModal, setShowModal] = useState(false);
  const [hasRead, setHasRead] = useState(false); // Untuk melacak apakah S&K sudah dibuka
  const [agreed, setAgreed] = useState(false);

  const [isSubjectOpen, setIsSubjectOpen] = useState(false);

  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  const REG_FEE=150000

  const toggleSubject = (id: string) => {
  setSelectedSubjects(prev => 
    prev.includes(id) 
      ? prev.filter(item => item !== id) 
      : [...prev, id]
   );
  };
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [selectedAddOn, setSelectedAddOn] = useState<any>(null);

  // Fungsi untuk menghitung total
  const totalBiaya = (selectedPackage?.price || 0) + (selectedAddOn?.price || 0) + REG_FEE;

  const selectedNames = subjects
    .filter((s: any) => selectedSubjects.includes(s.id))
    .map((s: any) => s.name)
    .join(", ");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  if (!agreed) {
    return toast.warning("Persetujuan Dibutuhkan", {
      description: "Silakan setujui syarat dan ketentuan untuk melanjutkan.",
    });
  }

  if (!selectedPackage && !selectedAddOn) {
    return toast.error("Pilihan Belum Lengkap", {
      description: "Silakan pilih Paket Utama atau Program Add-on terlebih dahulu.",
    });
  }

  // Validasi Mapel (Opsional: Jika wajib pilih minimal 1)
  if (selectedSubjects.length === 0) {
    return toast.error("Mata Pelajaran Belum Dipilih", {
      description: "Silakan pilih minimal satu mata pelajaran.",
    });
  }

  setLoading(true);
  const formData = new FormData(e.currentTarget);
  
  // SINKRONISASI DATA: Pastikan subjectIds masuk ke FormData
  // Karena input hidden sudah ada di bawah, kita tinggal kirim form-nya
  
  toast.promise(registerStudentPublic(formData), { // Langsung kirim formData agar lebih aman
    loading: 'Sedang mendaftarkan siswa...',
    success: (res: any) => {
      if (res.success) {
        setIsSubmitted(true);
        return `Pendaftaran berhasil!`;
      } else {
        throw new Error(res.message || "Gagal mendaftarkan siswa");
      }
    },
    error: (err) => {
      setLoading(false);
      return err.message || "Terjadi kesalahan sistem";
    },
  });
};

  if (isSubmitted) {
    return (
      <div className="flex min-h-[90vh] flex-col items-center justify-center p-6 text-center">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 shadow-sm">
            <CheckCircle2 size={48} />
          </div>
          <h1 className="mt-8 text-xl font-black tracking-tight text-slate-900">Pendaftaran Terkirim!</h1>
          <p className="mt-3 text-xs leading-relaxed text-slate-500 max-w-[250px] mx-auto">
            Data Anda telah masuk ke sistem. Mohon tunggu pesan konfirmasi dari admin kami via WhatsApp.
          </p>
          <button onClick={() => window.location.href = '/'} className="mt-8 text-[10px] font-black uppercase tracking-widest text-cyan-600 border-b-2 border-cyan-100 pb-1">
            Kembali Ke Beranda
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg bg-gradient-to-br from-cyan-50 to-fuchsia-200 px-5 py-8 sm:py-12">
      {/* Brand Header - Material Elevation 0 */}
      <header className="mb-12 flex flex-col items-center text-center">
        <div className="relative mb-6">
          <div className="absolute inset-0 scale-110 blur-2xl bg-gradient-to-tr from-cyan-400 to-fuchsia-400 opacity-20" />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-[22px] bg-gradient-to-tr from-cyan-500 to-fuchsia-600 text-white shadow-xl shadow-cyan-500/20">
            <GraduationCap size={32} />
          </div>
        </div>
        <h1 className="text-xl font-black text-slate-900 tracking-tight">Registrasi Siswa</h1>
        <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">Isi data diri untuk memulai perjalanan belajar bersama BIMBEls</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Section 1: Profil */}
        <div className="group rounded-[28px] bg-slate-50/50 p-1 transition-all focus-within:bg-white focus-within:ring-1 focus-within:ring-slate-200">
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 space-y-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse" />
              <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-500">Informasi Pribadi</h2>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <input name="fullName" required placeholder="Nama Lengkap Siswa" className="peer w-full border-b-2 border-slate-100 bg-transparent py-3 text-xs font-bold text-slate-800 outline-none transition-all focus:border-cyan-500" />
                <span className="absolute -top-3 left-0 text-[9px] font-black text-cyan-600 uppercase transition-all peer-placeholder-shown:opacity-0 peer-focus:opacity-100">Nama Lengkap</span>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="relative">
                  <input name="nickname" required placeholder="Panggilan" className="peer w-full border-b-2 border-slate-100 bg-transparent py-3 text-xs font-bold text-slate-800 outline-none transition-all focus:border-cyan-500" />
                  <span className="absolute -top-3 left-0 text-[9px] font-black text-cyan-600 uppercase transition-all peer-placeholder-shown:opacity-0 peer-focus:opacity-100">Panggilan</span>
                </div>
                <div className="relative">
                  <input name="parentName" required placeholder="Nama Wali" className="peer w-full border-b-2 border-slate-100 bg-transparent py-3 text-xs font-bold text-slate-800 outline-none transition-all focus:border-cyan-500" />
                  <span className="absolute -top-3 left-0 text-[9px] font-black text-cyan-600 uppercase transition-all peer-placeholder-shown:opacity-0 peer-focus:opacity-100">Orang Tua</span>
                </div>
              </div>

              <div className="relative">
                <input name="parentContact" type="tel" required placeholder="WhatsApp (08xx...)" className="peer w-full border-b-2 border-slate-100 bg-transparent py-3 text-xs font-bold text-slate-800 outline-none transition-all focus:border-cyan-500" />
                <span className="absolute -top-3 left-0 text-[9px] font-black text-cyan-600 uppercase transition-all peer-placeholder-shown:opacity-0 peer-focus:opacity-100">WhatsApp</span>
              </div>
            </div>
          </div>
        </div>
        {/* Section 2: Akademik */}
        <div className="group rounded-[28px] bg-slate-50/50 p-1 transition-all">
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 space-y-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-2 w-2 rounded-full bg-fuchsia-500 animate-pulse" />
              <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-500">Preferensi Belajar</h2>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Lokasi Cabang</label>
                <select name="locationId"  className="w-full rounded-xl bg-slate-50 p-3.5 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-fuchsia-500/20 appearance-none border border-transparent focus:border-fuchsia-100">
                  <option value="">Pilih Cabang</option>
                  {locations.map((loc: any) => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-1">
                  Mata Pelajaran
                </label>
                
                <div className="space-y-1">
  
  
                <div className="relative">
                  {/* Trigger Button */}
                  <button
                    type="button"
                    onClick={() => setIsSubjectOpen(!isSubjectOpen)}
                    className="w-full flex items-center justify-between rounded-xl bg-slate-50 p-3.5 text-xs font-bold text-slate-700 border border-transparent focus:border-fuchsia-100 focus:ring-2 focus:ring-fuchsia-500/20 transition-all"
                  >
                    <span className="truncate">
                      {selectedSubjects.length > 0 ? selectedNames : "Pilih Mapel"}
                    </span>
                    <ChevronDown size={14} className={`transition-transform ${isSubjectOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {isSubjectOpen && (
                    <>
                      {/* Backdrop untuk menutup menu saat klik di luar */}
                      <div className="fixed inset-0 z-[100]" onClick={() => setIsSubjectOpen(false)} />
                      
                      <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl z-[110] p-2 max-h-60 overflow-y-auto no-scrollbar animate-in fade-in zoom-in duration-150">
                        <div className="grid grid-cols-1 gap-1">
                          {subjects.map((sub: any) => {
                            const isSelected = selectedSubjects.includes(sub.id);
                            return (
                              <button
                                key={sub.id}
                                type="button"
                                onClick={() => toggleSubject(sub.id)}
                                className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                                  isSelected 
                                    ? "bg-fuchsia-50 text-fuchsia-600" 
                                    : "hover:bg-slate-50 text-slate-500"
                                }`}
                              >
                                <span className="text-[10px] font-black uppercase tracking-wider">{sub.name}</span>
                                <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${
                                  isSelected ? "bg-fuchsia-500 border-fuchsia-500" : "border-slate-200"
                                }`}>
                                  {isSelected && <Check size={12} className="text-white" strokeWidth={4} />}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Hidden Input untuk Server Action */}
                <input type="hidden" name="subjectIds" value={JSON.stringify(selectedSubjects)} />
              </div>
              </div>
            </div>
          </div>
        </div>


        {/* Section: Paket Belajar */}
        <div className="group rounded-[28px] bg-slate-50/50 p-1 transition-all">
          <div className="bg-white rounded-[24px] p-5 shadow-sm border border-slate-100 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse" />
              <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-500">Konfigurasi Paket</h2>
            </div>

            <div className="grid grid-cols-1  gap-4">
              {/* PAKET UTAMA - Dibuat lebih kecil */}
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Paket Utama</label>
                <div className="grid grid-cols-2 gap-2 max-h-[180px] overflow-y-auto pr-1 no-scrollbar">
                  {packages.map((pkg: any) => (
                    <label 
                      key={pkg.id} 
                      onClick={() => setSelectedPackage(pkg)}
                      className="relative flex items-center justify-between p-3 rounded-xl border border-slate-100 cursor-pointer hover:border-cyan-200 transition-all has-[:checked]:border-cyan-500 has-[:checked]:bg-cyan-50/30 group/pkg"
                    >
                      <input type="radio" onChange={() => setSelectedPackage(pkg)} name="packageId" value={pkg.id}  className="peer sr-only" />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-700 uppercase">{pkg.name}</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase">
                          {pkg.sesiCredit} Sesi • {new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0
                          }).format(pkg.price)}
                        </span>
                      </div>
                      <div className="h-4 w-4 rounded-full border-2 border-slate-200 peer-checked:border-cyan-500 peer-checked:bg-cyan-500 flex items-center justify-center transition-all">
                        <div className="h-1.5 w-1.5 rounded-full bg-white scale-0 peer-checked:scale-100 transition-transform" />
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* PAKET ADD-ON - Menggunakan Dropdown & Nullable */}
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Paket Tambahan (Opsional)</label>
                <div className="relative group/select">
                  <select 
                    name="addOnId" 
                    onChange={(e) => {
                      const addon = addOns.find((a: any) => a.id === e.target.value);
                      setSelectedAddOn(addon || null);
                    }}
 
                    className="w-full rounded-xl bg-slate-50 p-3 text-[11px] font-bold text-slate-700 outline-none border border-transparent focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/5 appearance-none transition-all cursor-pointer"
                  >
                    <option value="">— Tanpa Add-On —</option>
                    {addOns?.map((addon: any) => (
                      <option key={addon.id} value={addon.id}>
                        {`${addon.name} (${addon.sesiCredit ?? 0} Sesi) | Rp ${(addon.price || 0).toLocaleString('id-ID')}`}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within/select:text-cyan-500 transition-colors">
                    <ChevronDown size={14} />
                  </div>
                </div>
                
                <p className="text-[8px] text-slate-400 italic px-1">
                  *Pilih add-on jika siswa mengambil sesi tambahan di luar paket utama.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ESTIMASI TOTAL BIAYA */}
        <AnimatePresence>
          {(selectedPackage || selectedAddOn) && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mx-2 p-4 rounded-2xl bg-fuchsia-900 text-white shadow-xl overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Sparkles size={40} />
              </div>
              <div className="space-y-1.5 mb-3 border-b border-slate-800 pb-3">
  {/* Biaya Registrasi */}
  <div className="flex justify-between items-center opacity-80">
    <p className="text-[10px] text-slate-300 font-medium">Biaya Registrasi</p>
    <p className="text-[10px] text-slate-300 font-bold">
      Rp {REG_FEE.toLocaleString('id-ID')}
    </p>
  </div>

  {/* Paket Utama */}
  {selectedPackage && (
    <div className="flex justify-between items-center">
      <p className="text-[10px] text-slate-300 font-medium">
        Paket: <span className="text-cyan-400">{selectedPackage.name}</span>
      </p>
      <p className="text-[10px] text-slate-300 font-bold">
        Rp {selectedPackage.price.toLocaleString('id-ID')}
      </p>
    </div>
  )}

  {/* Add-On */}
  {selectedAddOn && (
    <div className="flex justify-between items-center">
      <p className="text-[10px] text-slate-300 font-medium">
        Add-On: <span className="text-fuchsia-400">{selectedAddOn.name}</span>
      </p>
      <p className="text-[10px] text-slate-300 font-bold">
        Rp {selectedAddOn.price.toLocaleString('id-ID')}
      </p>
    </div>
  )}
</div>

{/* Total Akhir */}
<div className="flex justify-between items-end relative z-10">
  <div>
    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Total Investasi Belajar</p>
    <p className="text-[8px] text-slate-400 italic">Terhitung per 1 periode</p>
  </div>
  <div className="text-right">
    <h3 className="text-xl font-black text-cyan-400 tracking-tight">
      Rp {(REG_FEE + (selectedPackage?.price || 0) + (selectedAddOn?.price || 0)).toLocaleString('id-ID')}
    </h3>
  </div>
</div>
            </motion.div>
          )}
        </AnimatePresence>

        
        {/* TOS Section */}
        <div className="px-2 py-4">
          <label className={`flex items-start gap-3 cursor-pointer group ${!hasRead ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <div className="relative mt-0.5">
              <input 
                type="checkbox" 
                checked={agreed} 
                // Hanya bisa dicentang jika sudah membaca
                disabled={!hasRead} 
                onChange={(e) => setAgreed(e.target.checked)} 
                className="peer sr-only" 
              />
              <div className={`h-5 w-5 rounded-md border-2 transition-all 
                ${agreed ? 'bg-cyan-500 border-cyan-500' : 'border-slate-200'} 
                ${hasRead ? 'group-hover:border-cyan-400' : ''}`} 
              />
              <ShieldCheck className={`absolute inset-0 text-white transition-transform ${agreed ? 'scale-75' : 'scale-0'}`} />
            </div>
            <p className="text-[10px] leading-relaxed text-slate-400 font-medium">
              Saya menyetujui {" "}
              <button 
                type="button"
                onClick={() => setShowModal(true)}
                className="text-cyan-600 font-black underline decoration-cyan-200 underline-offset-2 hover:text-cyan-700"
              >
                Syarat & Ketentuan
              </button> 
              {" "}yang berlaku serta memberikan izin penggunaan data untuk keperluan administrasi belajar.
            </p>
          </label>
        </div>

        {/* Submit Button */}
        <button 
          disabled={loading || !agreed}
          className={`group relative w-full overflow-hidden rounded-[20px] py-4 shadow-lg transition-all active:scale-[0.98] ${
            !agreed ? 'bg-slate-200 cursor-not-allowed' : 'bg-fuchsia-500'
          }`}
        >
          {!loading && agreed && (
    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-fuchsia-600 opacity-0 transition-opacity group-hover:opacity-100" />
  )}
          <span className="relative flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-white">
            {loading ? (
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                 <Sparkles size={16} />
              </motion.div>
            ) : (
              <>Konfirmasi Pendaftaran <Send size={14} /></>
            )}
          </span>
        </button>
      </form>

      <footer className="mt-12 text-center">
        <div className="flex justify-center gap-4 mb-3">
          <div className="h-px w-8 bg-slate-100" />
          <Info size={12} className="text-slate-200" />
          <div className="h-px w-8 bg-slate-100" />
        </div>
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-300">© 2026 Rumah Belajar Bimbels</p>
      </footer>
      {showModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
    <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-100">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="w-5 h-5 text-cyan-600" />
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Syarat & Ketentuan Belajar</h3>
        </div>
        
        <div className="text-[11px] text-slate-500 leading-relaxed space-y-4 max-h-[70vh] overflow-y-auto pr-4 custom-scrollbar">
          <section>
            <h4 className="font-bold text-slate-700 mb-1">1. Pembayaran & Status Keaktifan</h4>
            <p>• SPP wajib dibayarkan sebelum dimulainya pembelajaran atau di awal bulan.</p>
            <p>• Siswa yang menunda pembayaran SPP akan dinonaktifkan secara otomatis, dan kuota belajar akan dialihkan ke siswa baru.</p>
            <p>• Siswa yang tidak aktif/off dalam kurun waktu 3 bulan akan dikenakan biaya pendaftaran ulang saat bergabung kembali.</p>
          </section>

          <section>
            <h4 className="font-bold text-slate-700 mb-1">2. Kehadiran & Kuota Belajar</h4>
            <p>• Siswa wajib mengikuti jadwal yang telah disepakati. Ketidakhadiran tanpa konfirmasi dianggap tetap masuk (kuota 1x pertemuan hangus).</p>
            <p>• Pembelajaran efektif berlangsung selama 4 minggu. Minggu ke-5 adalah minggu tidak efektif/libur.</p>
          </section>

          <section>
            <h4 className="font-bold text-slate-700 mb-1">3. Kebijakan Jadwal Pengganti</h4>
            <p>• Orang tua wajib mengonfirmasi ketidakhadiran maksimal **H-1** untuk mendapatkan jadwal pengganti.</p>
            <p>• Jadwal pengganti bersifat terbatas dan tidak pasti karena diambil dari kekosongan kuota siswa lain. Orang tua disarankan aktif mengonfirmasi jadwal pengganti yang ditawarkan.</p>
            <p>• Jika dalam 1 bulan siswa berhalangan berturut-turut dan tidak mendapatkan/mengambil jadwal pengganti yang ditawarkan, maka kuota belajar dipastikan hangus.</p>
            <p>• Jadwal pengganti yang telah dikonfirmasi tidak dapat dijadwalkan ulang (hangus jika tidak hadir).</p>
          </section>

          <section className="bg-cyan-50 p-3 rounded-lg border border-cyan-100 italic">
            Aturan ini bertujuan menjaga kualitas belajar mengajar dengan rasio guru-siswa yang ideal (1:3 untuk Calistung/Preschool, dan 1:3-5 untuk Matematika/Inggris).
          </section>
        </div>
      </div>

      <div className="p-4 bg-slate-50 border-t flex justify-end">
        <button 
          onClick={() => {
            setShowModal(false);
            setHasRead(true);
            setAgreed(true); // <-- Otomatis centang checkbox
            toast.success("Syarat & Ketentuan disetujui");
          }}
          className="bg-cyan-600 text-white px-8 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-cyan-700 transition-all shadow-lg shadow-cyan-200"
        >
          Saya Mengerti & Setuju
        </button>
      </div>
    </div>
  </div>
)}
    </div>
    
  );
}