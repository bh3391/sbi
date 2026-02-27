"use client";

import React, { useState } from "react";
import { X, Plus, Check, MapPin, Trash2, CalendarDays, Loader2 } from "lucide-react";
import { saveAttendanceAction } from "@/app/actions/attendance";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface AbsensiFormProps {
  onClose: () => void;
  teacherName: string;
  teacherId: string;
  dataSiswa: any[];
  dataSubject: any[];
  dataSession: any[];
}

export default function AbsensiForm({
  onClose,
  teacherName,
  teacherId,
  dataSiswa,
  dataSubject,
  dataSession,
}: AbsensiFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rows, setRows] = useState([
    {
      id: Date.now().toString(),
      studentId: "",
      subjectId: "",
      sessionId: "",
      status: "HADIR",
      processStatus: "LISTED",
      score: "A",
      locationName: "",
      rescheduleDate: "",
      materi: "",
    },
  ]);

  const updateRow = (id: string, field: string, value: any) => {
    setRows(rows.map((row) => {
      if (row.id === id) {
        const updatedRow = { ...row, [field]: value };
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
    const newId = crypto.randomUUID();
    setRows([...rows, {
      id: newId,
      studentId: "",
      subjectId: "",
      sessionId: "",
      status: "HADIR",
      processStatus: "LISTED",
      score: "A",
      locationName: "",
      rescheduleDate: "",
      materi: "",
    }]);
    setTimeout(() => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  }, 100);
    
  };

  const removeRow = (id: string) => {
    if (rows.length > 1) setRows(rows.filter((r) => r.id !== id));
  };

  const handleSave = async () => {
    const isValid = rows.every((r) => r.studentId && r.subjectId && r.sessionId);
    if (!isValid) {
      alert("Lengkapi Nama, Subject, dan Sesi.");
      return;
    }

    setIsSubmitting(true);

      toast.promise(saveAttendanceAction(rows, teacherId), {
      loading: 'Sedang menyimpan absensi...',
      success: (response) => {
        if (response.success) {
          onClose();
          router.refresh();
          return `Absensi berhasil disimpan!`;
        } else {
          // Jika server mengembalikan success: false
          throw new Error(response.message);
        }
      },
      error: (err) => {
        return err.message || "Gagal menghubungi server.";
      },
      finally: () => {
        setIsSubmitting(false);
      }
      });
  };

  return (
    <div className="fixed inset-0 z-[120] bg-white flex flex-col h-screen font-sans text-slate-900 animate-in slide-in-from-bottom duration-300">
      {/* Header - Compact & High Contrast */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose} // Klik luar untuk tutup
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      />

      {/* 2. KONTEN MODAL: Animasi Slide Up */}
      <motion.div 
        initial={{ y: "100%" }} // Mulai dari bawah layar
        animate={{ y: 0 }}      // Naik ke posisi normal
        exit={{ y: "100%" }}    // Turun lagi saat ditutup
        transition={{ type: "spring", damping: 25, stiffness: 200 }} // Efek pegas yang smooth
        className="relative bg-white flex flex-col h-[100vh] w-full max-w-lg sm:h-auto sm:rounded-2xl font-sans text-slate-900 shadow-2xl overflow-hidden"
      >
      <header className="px-4 py-3 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-cyan-50 backdrop-blur-sm z-30">
        <div className="flex flex-col">
          <h2 className="text-[11px] font-bold uppercase tracking-tight text-slate-800">Input Absensi Siswa</h2>
          <span className="text-[8px] font-bold text-cyan-600 uppercase tracking-widest leading-none mt-0.5">
            {teacherName} • {new Date().toLocaleDateString("id-ID", { day: 'numeric', month: 'short' })}
          </span>
        </div>
        <button onClick={onClose} className="p-1.5 bg-fuchsia-500 text-white rounded-full active:scale-90">
          <X size={16} />
        </button>
      </header>

      {/* Content - Ultra Compact Rows */}
      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-6 pb-32">
        {rows.map((row, index) => (
          <div key={row.id} className="relative p-3 rounded-xl border border-fuchsia-500 bg-fuchsia-50/30 space-y-3">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-2">
              <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Entry #{index + 1}</span>
              {rows.length > 1 && (
                <button onClick={() => removeRow(row.id)} className="text-rose-500 hover:bg-rose-50 p-1 rounded transition-colors">
                  <Trash2 size={12} />
                </button>
              )}
            </div>

            {/* Selection Grid */}
            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-1">
                <label className="text-[8px] font-bold text-slate-700 uppercase tracking-widest ml-1">Nama Siswa</label>
                <select
                  value={row.studentId}
                  onChange={(e) => updateRow(row.id, "studentId", e.target.value)}
                  className="w-full bg-white border border-fuchsia-200 rounded-lg py-2 px-3 text-[11px] font-bold outline-none focus:border-cyan-500"
                >
                  <option value="">Pilih Siswa...</option>
                  {dataSiswa.map((s) => <option key={s.id} value={s.id}>{s.nickname}</option>)}
                </select>
                {row.locationName && (
                  <div className="flex items-center gap-1 text-cyan-600 text-[7px] font-black uppercase mt-1 ml-1">
                    <MapPin size={8} /> {row.locationName}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[8px] font-bold text-slate-700 uppercase tracking-widest ml-1">Subject</label>
                  <select value={row.subjectId} onChange={(e) => updateRow(row.id, "subjectId", e.target.value)} className="w-full bg-white border border-fuchsia-200 rounded-lg py-2 px-2 text-[10px] font-bold outline-none">
                    <option value="">Mata Pelajaran</option>
                    {dataSubject.map((sub) => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-bold text-slate-700 uppercase tracking-widest ml-1">Sesi</label>
                  <select value={row.sessionId} onChange={(e) => updateRow(row.id, "sessionId", e.target.value)} className="w-full bg-white border border-fuchsia-200 rounded-lg py-2 px-2 text-[10px] font-bold outline-none">
                    <option value="">Sesi...</option>
                    {dataSession.map((ses) => <option key={ses.id} value={ses.id}>{ses.name}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Attendance Status - Cyan Themed */}
            <div className="space-y-1.5">
              <label className="text-[8px] font-bold text-slate-700 uppercase tracking-widest ml-1">Status Kehadiran</label>
              <div className="flex gap-1">
                {["HADIR", "IZIN", "SAKIT", "ALPA"].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => updateRow(row.id, "status", s)}
                    className={`flex-1 py-2 text-[8px] font-black rounded-md border transition-all ${
                      row.status === s 
                      ? "bg-cyan-600 text-white border-cyan-600 shadow-sm" 
                      : "bg-white text-slate-400 border-fuchsia-200"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Conditional Sub-status */}
            {(row.status === "IZIN" || row.status === "SAKIT") && (
              <div className="p-2.5 bg-cyan-50/50 rounded-lg border border-cyan-100 space-y-2 animate-in fade-in zoom-in-95">
                <div className="flex gap-1">
                  {["LISTED", "SCHEDULED", "DONE"].map((ps) => (
                    <button
                      key={ps}
                      type="button"
                      onClick={() => updateRow(row.id, "processStatus", ps)}
                      className={`flex-1 py-1.5 text-[7px] font-black rounded border transition-all ${
                        row.processStatus === ps 
                        ? "bg-cyan-700 text-white border-cyan-700" 
                        : "bg-white text-cyan-600 border-cyan-200"
                      }`}
                    >
                      {ps}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 bg-white p-1.5 rounded border border-cyan-100">
                  <CalendarDays size={10} className="text-cyan-500" />
                  <input type="date" value={row.rescheduleDate} onChange={(e) => updateRow(row.id, "rescheduleDate", e.target.value)} className="w-full bg-transparent text-[9px] font-bold text-cyan-700 outline-none" />
                </div>
              </div>
            )}

            {/* Score & Evaluation */}
            <div className="flex gap-2">
              <select value={row.score} onChange={(e) => updateRow(row.id, "score", e.target.value)} className="bg-white border border-slate-200 rounded-lg px-2 text-[10px] font-bold outline-none h-9">
                {["A", "A-", "B+", "B", "C"].map((sc) => <option key={sc} value={sc}>{sc}</option>)}
              </select>
              <input 
                placeholder="Materi / Evaluasi singkat..." 
                value={row.materi} 
                onChange={(e) => updateRow(row.id, "materi", e.target.value)} 
                className="flex-1 bg-white border border-slate-200 rounded-lg px-3 text-[10px] font-medium outline-none h-9 focus:border-cyan-500"
              />
            </div>
          </div>
        ))}

        <button type="button" onClick={addRow} className="w-full py-4 border-2 border-dashed border-slate-100 text-slate-400 text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 rounded-xl active:bg-slate-50">
          <Plus size={14} /> Add Student
        </button>
      </main>

      {/* Footer - Fixed Bottom */}
      <footer className="p-4 border-t border-slate-100 bg-white flex gap-3 sticky bottom-0 z-30 pb-8">
        <button type="button" onClick={onClose} className="flex-1 py-3.5 text-slate-400 text-[9px] font-black uppercase tracking-widest">
          Cancel
        </button>
        <button 
          onClick={handleSave} 
          disabled={isSubmitting} 
          className={`flex-[2.5] py-3.5 rounded-lg font-black text-[9px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all ${
            isSubmitting ? "bg-slate-100 text-slate-400" : "bg-fuchsia-500 text-white shadow-lg shadow-cyan-100 active:scale-95"
          }`}
        >
          {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <><Check size={14} /> Simpan</>}
        </button>
      </footer>
      </motion.div>
    </div>
  );
}