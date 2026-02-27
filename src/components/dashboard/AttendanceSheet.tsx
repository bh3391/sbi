"use client";

import React, { useState } from "react";
import { X, Check, Loader2, BookOpen, Star, AlertCircle, User, CalendarDays } from "lucide-react";
import { saveAttendanceAction } from "@/app/actions/attendance";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface AttendanceItem {
  studentId: string;
  nickname: string;
  remainingSesi: number;
  subjectId: string;
  sessionId: string;
  status: string;
  processStatus: string;
  score: string;
  materi: string;
  rescheduleDate: string;
}

export default function AttendanceSheet({ schedule, teacherId, onClose }: any) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const scoreOptions = ["A", "A-", "B+", "B", "B-", "C"];
  const attendanceStatuses = ["HADIR", "IZIN", "SAKIT", "ALPA"];
  const processStatuses = ["LISTED", "SCHEDULED", "DONE"];

  // Inisialisasi state otomatis dari jadwal
  const [attendanceList, setAttendanceList] = useState<AttendanceItem[]>(
  schedule.students.map((s: any) => ({
    studentId: s.id,
    nickname: s.nickname,
    remainingSesi: s.remainingSesi,
    subjectId: schedule.subjectId,
    sessionId: schedule.sessionId,
    status: "HADIR",
    processStatus: "LISTED",
    score: "A",
    materi: "",
    rescheduleDate: "",
  }))
);

  const updateStudentData = (studentId: string, field: keyof AttendanceItem, value: any) => {
  setAttendanceList((prev: AttendanceItem[]) =>
    prev.map((item: AttendanceItem) => // Tambahkan tipe AttendanceItem di sini
      item.studentId === studentId ? { ...item, [field]: value } : item
    )
  );
};

  const handleSave = async () => {
    // Validasi: Materi wajib jika HADIR
    const incomplete = attendanceList.find(item => item.status === "HADIR" && !item.materi);
    if (incomplete) {
      toast.error(`Materi untuk ${incomplete.nickname} belum diisi!`);
      return;
    }

    setIsSubmitting(true);
    try {
      // Kirim data ke server action Anda
      const res = await saveAttendanceAction(attendanceList, teacherId);
      if (res.success) {
        toast.success(res.message);
        onClose();
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error("Terjadi kesalahan sistem.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-[100] bg-white flex flex-col h-screen"
    >
      {/* Header */}
      <header className="p-5 border-b bg-slate-900 text-white flex justify-between items-center shadow-lg sticky top-0 z-10">
        <div>
          <h2 className="text-xs font-black uppercase italic tracking-wider">Laporan Mengajar</h2>
          <p className="text-[10px] text-cyan-400 font-bold uppercase mt-0.5">
            {schedule.subject.name} • {schedule.session.name}
          </p>
        </div>
        <button onClick={onClose} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
          <X size={20} />
        </button>
      </header>

      {/* List Siswa */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4 pb-28 bg-[#F8FAFC]">
        {attendanceList.map((item: any) => {
          const isHadir = item.status === "HADIR";
          const isReschedulable = item.status === "IZIN" || item.status === "SAKIT";
          
          return (
            <div key={item.studentId} className={`rounded-[2.5rem] p-6 border transition-all ${
              isHadir ? "bg-white border-slate-100 shadow-sm" : "bg-slate-50 border-transparent"
            }`}>
              
              {/* Header Kartu Siswa */}
              <div className="flex flex-col gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-2xl flex items-center justify-center ${isHadir ? "bg-cyan-500 text-white" : "bg-slate-200 text-slate-500"}`}>
                    <User size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-800 uppercase leading-none">{item.nickname}</h3>
                    <p className={`text-[9px] font-bold mt-1 ${item.remainingSesi <= 1 ? "text-rose-500" : "text-slate-400"}`}>
                      SISA: {item.remainingSesi} SESI
                    </p>
                  </div>
                </div>
                
                {/* 1. Status Utama (HADIR, IZIN, SAKIT, ALPA) */}
                <div className="flex gap-1 bg-slate-100/50 p-1 rounded-xl">
                  {attendanceStatuses.map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStudentData(item.studentId, "status", s)}
                      className={`flex-1 py-2 text-[9px] font-black rounded-lg transition-all ${
                        item.status === s 
                        ? "bg-white text-slate-900 shadow-sm" 
                        : "text-slate-400"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Logika Kondisional: IZIN / SAKIT (Reschedule) */}
              <AnimatePresence>
                {isReschedulable && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                    className="p-4 bg-cyan-50/50 rounded-2xl border border-cyan-100 space-y-3 mb-4"
                  >
                    <div className="flex gap-1">
                      {processStatuses.map((ps) => (
                        <button
                          key={ps}
                          onClick={() => updateStudentData(item.studentId, "processStatus", ps)}
                          className={`flex-1 py-1.5 text-[8px] font-black rounded-md border transition-all ${
                            item.processStatus === ps 
                            ? "bg-cyan-600 text-white border-cyan-600" 
                            : "bg-white text-cyan-600 border-cyan-200"
                          }`}
                        >
                          {ps}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-cyan-100">
                      <CalendarDays size={14} className="text-cyan-500" />
                      <input 
                        type="date" 
                        value={item.rescheduleDate} 
                        onChange={(e) => updateStudentData(item.studentId, "rescheduleDate", e.target.value)} 
                        className="w-full bg-transparent text-[10px] font-bold text-cyan-700 outline-none" 
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 3. Logika Kondisional: HADIR (Input Score & Materi) */}
              <AnimatePresence>
                {isHadir && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 pt-4 border-t border-dashed border-slate-100"
                  >
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Nilai / Score</label>
                      <div className="relative">
                        <Star size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400" />
                        <select 
                          value={item.score}
                          onChange={(e) => updateStudentData(item.studentId, "score", e.target.value)}
                          className="w-full bg-slate-50 border-none rounded-xl py-2.5 pl-9 pr-4 text-xs font-black text-slate-700 outline-none focus:ring-2 focus:ring-cyan-100 shadow-inner"
                        >
                          {scoreOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Materi & Evaluasi</label>
                      <div className="relative">
                        <BookOpen size={14} className="absolute left-3 top-3 text-slate-300" />
                        <textarea 
                          placeholder="Materi yang dipelajari hari ini..."
                          value={item.materi}
                          onChange={(e) => updateStudentData(item.studentId, "materi", e.target.value)}
                          className="w-full bg-slate-50 border-none rounded-2xl p-3 pl-10 text-[11px] font-medium outline-none focus:ring-2 focus:ring-cyan-100 min-h-[90px] shadow-inner"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        <div className="p-5 bg-amber-50 rounded-[2.5rem] border border-amber-100 flex gap-4">
          <AlertCircle size={20} className="text-amber-500 shrink-0" />
          <p className="text-[10px] font-bold text-amber-800 leading-relaxed uppercase">
            Sesuai kebijakan sistem, status <span className="text-rose-600">HADIR</span> atau <span className="text-rose-600">ALPA</span> akan otomatis memotong kuota sesi siswa.
          </p>
        </div>
      </main>

      {/* Footer Button */}
      <footer className="p-4 border-t bg-white/80 backdrop-blur-md sticky bottom-0">
        <button 
          onClick={handleSave}
          disabled={isSubmitting}
          className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <><Check size={18} strokeWidth={3} /><span>Simpan Absensi</span></>}
        </button>
      </footer>
    </motion.div>
  );
}