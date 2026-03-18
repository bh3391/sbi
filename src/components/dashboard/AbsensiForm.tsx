"use client";

import React, { useState } from "react";
import { X, Plus, Check, MapPin, Trash2, CalendarDays, Loader2 } from "lucide-react";
import { saveAttendanceAction } from "@/app/actions/attendance";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";

// KONSTANTA: Ganti dengan ID asli dari database Prisma Studio Anda
const ID_SUBJECT_ADDON = "cmmw29dk60001dhobbiks1ocq"; 

interface AbsensiFormProps {
  onClose: () => void;
  teacherName: string;
  teacherId: string;
  dataSiswa: any[];
  dataSubject: any[];
  dataSession: any[];
  dataAddon: any[];
}

export default function AbsensiForm({
  onClose,
  teacherName,
  teacherId,
  dataSiswa,
  dataSubject,
  dataSession,
  dataAddon,
}: AbsensiFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openSearchId, setOpenSearchId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [rows, setRows] = useState([
    {
      id: crypto.randomUUID(),
      studentId: "",
      subjectId: "",
      sessionId: "",
      status: "HADIR",
      processStatus: "LISTED",
      score: "A",
      locationName: "",
      rescheduleDate: "",
      materi: "",
      isAddon: false,
      addOn: "", // Field ID kategori (Robotik/Coding/Sains)
    },
  ]);

  const updateRow = (id: string, field: string, value: any) => {
    setRows(rows.map((row) => {
      if (row.id === id) {
        let updatedRow = { ...row, [field]: value };
        
        // Logika Otomatis Tipe Pertemuan
        if (field === "isAddon") {
          if (value === true) {
            // Jika Add-on: Paksa subjectId ke ID Program Add-on
            updatedRow.subjectId = ID_SUBJECT_ADDON;
          } else {
            // Jika Reguler: Kosongkan kategori addon dan reset subject
            updatedRow.addOn = "";
            updatedRow.subjectId = "";
          }
        }
        
        // Update Lokasi saat Siswa dipilih
        if (field === "studentId") {
          const student = dataSiswa.find((s) => s.id === value);
          updatedRow.locationName = student?.location?.name || "";
        }
        
        return updatedRow;
      }
      return row;
    }));
  };

  const addRow = () => {
    setRows([...rows, {
      id: crypto.randomUUID(),
      studentId: "",
      subjectId: "",
      sessionId: "",
      status: "HADIR",
      processStatus: "LISTED",
      score: "A",
      locationName: "",
      rescheduleDate: "",
      materi: "",
      isAddon: false,
      addOn: "",
    }]);
  };

  const removeRow = (id: string) => {
    if (rows.length > 1) setRows(rows.filter((r) => r.id !== id));
  };

  const handleSave = async () => {
    // 1. Validasi Kelengkapan Dasar
    const isBasicValid = rows.every((r) => r.studentId && r.subjectId && r.sessionId);
    if (!isBasicValid) {
      toast.error("Mohon lengkapi Nama, Subject, dan Sesi untuk semua baris.");
      return;
    }

    // 2. Validasi Kategori Add-on jika dipilih
    const incompleteAddon = rows.find(r => r.isAddon && !r.addOn);
    if (incompleteAddon) {
      const student = dataSiswa.find(s => s.id === incompleteAddon.studentId);
      toast.error(`Kategori Add-on untuk ${student?.nickname || 'siswa'} belum dipilih!`);
      return;
    }

    // 3. Validasi Materi jika Hadir
    const noMateri = rows.find(r => r.status === "HADIR" && !r.materi);
    if (noMateri) {
      toast.error("Materi pengajaran wajib diisi untuk siswa yang hadir.");
      return;
    }

    setIsSubmitting(true);
    
    // Gunakan toast.promise agar user tahu proses sedang berjalan
    toast.promise(saveAttendanceAction(rows, teacherId), {
      loading: 'Menyimpan laporan ke database...',
      success: (res) => {
        if (res.success) {
          onClose();
          router.refresh();
          return res.message;
        } else {
          throw new Error(res.message);
        }
      },
      error: (err) => err.message || "Gagal menyimpan absensi.",
      finally: () => setIsSubmitting(false)
    });
  };

  return (
    <div className="fixed inset-0 z-[120] bg-white flex flex-col h-screen font-sans text-slate-900">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="relative bg-white flex flex-col h-full w-full max-w-lg mx-auto shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <header className="px-4 py-3 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-cyan-50 z-30">
          <div className="flex flex-col">
            <h2 className="text-[11px] font-bold uppercase tracking-tight text-slate-800">Input Absensi Manual</h2>
            <span className="text-[8px] font-bold text-cyan-600 uppercase tracking-widest mt-0.5">
              {teacherName} • {new Date().toLocaleDateString("id-ID", { day: 'numeric', month: 'short' })}
            </span>
          </div>
          <button onClick={onClose} className="p-1.5 bg-fuchsia-500 text-white rounded-full active:scale-90">
            <X size={16} />
          </button>
        </header>

        {/* Form Body */}
        <main className="flex-1 overflow-y-auto px-4 py-4 space-y-6 pb-32">
          {rows.map((row, index) => (
            <div key={row.id} className="relative p-3 rounded-xl border border-fuchsia-500 bg-fuchsia-50/30 space-y-3">
              <div className="flex justify-between items-center border-b border-fuchsia-100 pb-2">
                <span className="text-[9px] font-bold text-fuchsia-600 uppercase tracking-widest">Siswa Ke-{index + 1}</span>
                {rows.length > 1 && (
                  <button onClick={() => removeRow(row.id)} className="text-rose-500 p-1">
                    <Trash2 size={12} />
                  </button>
                )}
              </div>

              {/* Tipe Pertemuan Selector */}
              <div className="flex gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => updateRow(row.id, "isAddon", false)}
                  className={`flex-1 py-1.5 rounded-md text-[8px] font-black border transition-all ${
                    !row.isAddon ? "bg-fuchsia-500 text-white border-fuchsia-500" : "bg-white text-slate-400 border-slate-200"
                  }`}
                > REGULER </button>
                <button
                  type="button"
                  onClick={() => updateRow(row.id, "isAddon", true)}
                  className={`flex-1 py-1.5 rounded-md text-[8px] font-black border transition-all ${
                    row.isAddon ? "bg-cyan-600 text-white border-cyan-600" : "bg-white text-slate-400 border-slate-200"
                  }`}
                > ADD-ON </button>
              </div>

              {/* Student Search UI */}
              <div className="space-y-1 relative">
                <label className="text-[8px] font-bold text-slate-700 uppercase tracking-widest ml-1">Nama Siswa</label>
                <button
                  type="button"
                  onClick={() => setOpenSearchId(openSearchId === row.id ? null : row.id)}
                  className="w-full bg-white border border-slate-200 rounded-lg py-2.5 px-3 text-[11px] font-bold text-left flex justify-between items-center"
                >
                  <span className={row.studentId ? "text-slate-800" : "text-slate-400"}>
                    {row.studentId ? dataSiswa.find((s) => s.id === row.studentId)?.nickname : "Pilih Siswa..."}
                  </span>
                  <Plus size={14} className={openSearchId === row.id ? "rotate-45" : ""} />
                </button>

                {openSearchId === row.id && (
                  <div className="absolute z-[50] top-full left-0 right-0 mt-1 bg-white border border-slate-200 shadow-xl rounded-xl overflow-hidden">
                    <div className="p-2 bg-slate-50 border-b border-slate-100">
                      <input
                        autoFocus
                        type="text"
                        placeholder="Cari nama..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-md py-1.5 px-3 text-[10px] outline-none"
                      />
                    </div>
                    <div className="max-h-40 overflow-y-auto">
                      {dataSiswa.filter(s => s.nickname.toLowerCase().includes(searchQuery.toLowerCase())).map(s => (
                        <button
                          key={s.id}
                          onClick={() => { updateRow(row.id, "studentId", s.id); setOpenSearchId(null); }}
                          className="w-full px-4 py-2 text-left text-[10px] hover:bg-fuchsia-50 border-b border-slate-50 last:border-0"
                        >
                          <span className="font-bold">{s.nickname}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {row.locationName && (
                  <div className="flex items-center gap-1 text-cyan-600 text-[7px] font-black uppercase mt-1">
                    <MapPin size={8} /> {row.locationName}
                  </div>
                )}
              </div>

              {/* Dropdowns Row */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[8px] font-bold text-slate-700 uppercase">Subject</label>
                  <select 
                    disabled={row.isAddon} // Subject dikunci jika Add-on (Otomatis PROGRAM ADD-ON)
                    value={row.subjectId} 
                    onChange={(e) => updateRow(row.id, "subjectId", e.target.value)} 
                    className="w-full bg-white border border-slate-200 rounded-lg py-2 text-[10px] font-bold outline-none disabled:bg-slate-100"
                  >
                    <option value="">Pilih...</option>
                    {dataSubject.map((sub) => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-bold text-slate-700 uppercase">Sesi</label>
                  <select value={row.sessionId} onChange={(e) => updateRow(row.id, "sessionId", e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg py-2 text-[10px] font-bold outline-none">
                    <option value="">Pilih...</option>
                    {dataSession.map((ses) => <option key={ses.id} value={ses.id}>{ses.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Add-on Kategori (Muncul jika isAddon = true) */}
              {row.isAddon && (
                <div className="space-y-1 animate-in slide-in-from-top-1">
                  <label className="text-[8px] font-bold text-cyan-700 uppercase">Kategori Program Add-on</label>
                  <select 
                    value={row.addOn} 
                    onChange={(e) => updateRow(row.id, "addOn", e.target.value)}
                    className="w-full bg-cyan-50 border border-cyan-200 rounded-lg py-2 px-3 text-[10px] font-black text-cyan-700 outline-none"
                  >
                    <option value="">Pilih Program (Robotik/Coding/Sains)...</option>
                    {dataAddon?.map((addon: any) => (
                      <option key={addon.id} value={addon.id}>{addon.name.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Status & Materi */}
              <div className="space-y-2">
                <div className="flex gap-1">
                  {["HADIR", "ALPA"].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => updateRow(row.id, "status", s)}
                      className={`flex-1 py-2 text-[8px] font-black rounded-md border transition-all ${
                        row.status === s ? "bg-cyan-600 text-white border-cyan-600 shadow-sm" : "bg-white text-slate-400 border-slate-200"
                      }`}
                    > {s} </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <select value={row.score} onChange={(e) => updateRow(row.id, "score", e.target.value)} className="bg-white border border-slate-200 rounded-lg px-2 text-[10px] font-bold h-9">
                    {["A", "A-", "B+", "B", "C"].map((sc) => <option key={sc} value={sc}>{sc}</option>)}
                  </select>
                  <input 
                    placeholder="Tulis materi/evaluasi..." 
                    value={row.materi} 
                    onChange={(e) => updateRow(row.id, "materi", e.target.value)} 
                    className="flex-1 bg-white border border-slate-200 rounded-lg px-3 text-[10px] font-medium h-9 focus:border-cyan-500 outline-none"
                  />
                </div>
              </div>
            </div>
          ))}

          <button type="button" onClick={addRow} className="w-full py-4 border-2 border-dashed border-slate-200 text-slate-400 text-[9px] font-black uppercase rounded-xl active:bg-slate-50">
            + Tambah Siswa Lagi
          </button>
        </main>

        {/* Footer */}
        <footer className="p-4 border-t border-slate-100 bg-white flex gap-3 sticky bottom-0 z-30 pb-10">
          <button type="button" onClick={onClose} className="flex-1 py-3.5 text-slate-400 text-[9px] font-black uppercase">Cancel</button>
          <button 
            onClick={handleSave} 
            disabled={isSubmitting} 
            className={`flex-[2.5] py-3.5 rounded-lg font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
              isSubmitting ? "bg-slate-100 text-slate-400" : "bg-fuchsia-500 text-white shadow-lg active:scale-95"
            }`}
          >
            {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <><Check size={14} /> Simpan Absensi</>}
          </button>
        </footer>
      </motion.div>
    </div>
  );
}