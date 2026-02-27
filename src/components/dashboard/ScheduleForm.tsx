"use client";

import React, { useState } from "react";
import { X, User, BookOpen, Clock, Users, Check } from "lucide-react";
import { toast } from "sonner";
import { createSchedule, updateSchedule } from "@/app/actions/schedule";
import { motion } from "framer-motion";

interface ScheduleFormProps {
  currentRoom: any;
  selectedDay: string;
  teachers: any[];
  sessions: any[];
  subjects: any[];
  students: any[];
  initialData?: any;
  onClose: () => void;
}

export default function ScheduleForm({
  currentRoom,
  selectedDay,
  teachers,
  sessions,
  subjects,
  students,
    initialData,
  onClose
}: ScheduleFormProps) {
  const [selectedStudents, setSelectedStudents] = useState<string[]>(
    initialData ? initialData.students.map((s: any) => s.id) : []
  );
  const isEditMode = !!initialData;
  const [isPending, setIsPending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  
  const displayStudents = students
  .filter((std) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      std.fullName?.toLowerCase().includes(searchLower) ||
      std.nickname?.toLowerCase().includes(searchLower)
    );
  })
  .sort((a, b) => {
    // Murid yang dipilih (isSelected) naik ke atas
    const aSelected = selectedStudents.includes(a.id) ? 1 : 0;
    const bSelected = selectedStudents.includes(b.id) ? 1 : 0;
    return bSelected - aSelected;
  });

  const handleStudentToggle = (id: string) => {
    setSelectedStudents(prev =>
      prev.includes(id) 
        ? prev.filter(s => s !== id) 
        : prev.length < 5 ? [...prev, id] : prev
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validasi dasar
    if (selectedStudents.length === 0) {
      return toast.error("Pilih minimal 1 murid!");
    }

    setIsPending(true); // <--- NYALAKAN LOADING
    
    try {
      const formData = new FormData(e.currentTarget);
      
      // Kirim ID murid yang dipilih
      selectedStudents.forEach(id => formData.append("studentIds", id));
      
      // Jika mode tambah, pastikan roomId dan day terkirim
      if (!isEditMode) {
        formData.append("roomId", currentRoom.id);
        formData.append("day", selectedDay);
      }

      // Logika Server Action
      const res = isEditMode 
        ? await updateSchedule(initialData.id, formData)
        : await createSchedule(formData);

      if (res.success) {
        toast.success(isEditMode ? "Jadwal diperbarui!" : "Jadwal berhasil dibuat!");
        onClose();
      } else {
        toast.error(res.error || "Terjadi kesalahan");
      }
    } catch (error) {
      toast.error("Gagal menghubungkan ke server");
    } finally {
      setIsPending(false); // <--- MATIKAN LOADING
    }
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center px-1 pt-24 pb-0 bottom-0 bg-slate-900/60 backdrop-blur-sm">
      <div className=" w-full max-w-lg bg-cyan-50  p-4 rounded-2xl max-h-[90vh] overflow-y-auto relative border border-slate-100">
        
        {/* Header */}
        <div className="flex justify-between  items-center mb-8 border-b border-slate-100">
          <div>
            <h2 className="text-lg  uppercase  mb-4">
                {isEditMode ? "Edit Jadwal" : "Plot Jadwal Baru"}
            </h2>
            <p className="text-[10px] font-bold text-fuchsia-500 uppercase tracking-widest mt-2">Ruang {currentRoom.name} • {selectedDay}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-fuchsia-500 hover:bg-slate-50 rounded-full transition-colors">
            <X size={24} className="text-slate-50" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Select Sesi */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-cyan-500 uppercase ml-4">Waktu Belajar</label>
            <div className="relative">
              <select name="sessionId" defaultValue={initialData?.sessionId} required className="w-full bg-white border border-slate-100 p-4 rounded-2xl text-xs font-bold appearance-none focus:ring-2 focus:ring-fuchsia-100 outline-none">
                <option value="">Pilih Sesi</option>
                {sessions.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.startTime} - {s.endTime})</option>
                ))}
              </select>
              <Clock className="absolute right-4 top-4 text-slate-300" size={18} />
            </div>
          </div>

          {/* Teacher & Subject */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-cyan-500 uppercase ml-4">Pengajar</label>
              <select name="teacherId" defaultValue={initialData?.teacherId} required className="w-full bg-white border border-slate-100 p-4 rounded-2xl text-xs font-bold appearance-none outline-none">
                <option value="">Pilih Guru</option>
                {teachers.map((t) => <option key={t.id} value={t.id}>{t.nickname || t.fullName}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-cyan-500 uppercase ml-4">Mata Pelajaran</label>
              <select name="subjectId" defaultValue={initialData?.subjectId} required className="w-full bg-white border border-slate-100 p-4 rounded-2xl text-xs font-bold appearance-none outline-none">
                <option value="">Pilih Mapel</option>
                {subjects.map((sj) => <option key={sj.id} value={sj.id}>{sj.name}</option>)}
              </select>
            </div>
          </div>

          {/* Student Multi-Select */}
          <div className="space-y-4">
  {/* LABEL & COUNTER */}
  <div className="flex justify-between items-end px-4">
    <div>
      <label className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest">
        Daftar Murid
      </label>
      <p className="text-[18px] font-bold text-slate-800 leading-none">
        {selectedStudents.length} <span className="text-slate-300 text-xs">/ 5 TERPILIH</span>
      </p>
    </div>
    {selectedStudents.length > 0 && (
      <button 
        type="button"
        onClick={() => setSelectedStudents([])}
        className="text-[9px] font-bold text-rose-500 uppercase border-b border-rose-200 pb-0.5 hover:text-rose-600"
      >
        Reset Pilihan
      </button>
    )}
  </div>

  {/* SEARCH INPUT */}
  <div className="relative group mx-2">
    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
      <Users size={16} className="text-slate-400 group-focus-within:text-cyan-500 transition-colors" />
    </div>
    <input 
      type="text"
      placeholder="Cari nama atau panggilan..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="w-full bg-white border-2 border-transparent p-4 pl-12 rounded-[1.5rem] text-xs font-bold focus:bg-white focus:border-cyan-100 focus:ring-4 focus:ring-cyan-50 transition-all outline-none"
    />
  </div>

  {/* SELECTED BADGES (Quick view) */}
  {selectedStudents.length > 0 && (
    <div className="flex flex-wrap gap-2 px-2 max-h-24 overflow-y-auto no-scrollbar">
      {selectedStudents.map(id => {
        const std = students.find(s => s.id === id);
        return (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            key={id} 
            className="bg-cyan-500 text-white pl-3 pr-1 py-1 rounded-full text-[9px] font-black flex items-center gap-1 shadow-md shadow-cyan-100"
          >
            {std?.nickname || std?.fullName?.split(' ')[0]}
            <button 
              onClick={() => handleStudentToggle(id)}
              className="bg-white hover:bg-white/40 rounded-full p-0.5"
            >
              <X size={10} />
            </button>
          </motion.div>
        );
      })}
    </div>
  )}

  {/* SCROLLABLE LIST */}
  <div className="grid grid-cols-1 gap-2 max-h-56 overflow-y-auto p-2 bg-slate-50 rounded-[2.5rem] border border-slate-100 no-scrollbar">
    {displayStudents.length > 0 ? (
      displayStudents.map((std) => {
        const isSelected = selectedStudents.includes(std.id);
        return (
          <button
            key={std.id}
            type="button"
            onClick={() => handleStudentToggle(std.id)}
            className={`p-3 rounded-2xl text-[11px] font-bold uppercase transition-all flex items-center justify-between border-2 ${
              isSelected 
              ? "bg-white border-cyan-500 text-cyan-600 shadow-sm" 
              : "bg-white border-transparent text-slate-500 hover:border-slate-200"
            }`}
          >
            <div className="flex items-center gap-3">
               <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black ${isSelected ? 'bg-cyan-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                  {std.fullName?.charAt(0)}
               </div>
               <div className="text-left">
                  <p className="leading-none">{std.nickname || std.fullName}</p>
                  <p className="text-[8px] opacity-50 font-medium mt-1 uppercase tracking-tighter">{std.fullName}</p>
               </div>
            </div>
            {isSelected && <Check size={16} className="text-cyan-500" />}
          </button>
        );
      })
    ) : (
      <div className="py-10 text-center">
         <p className="text-[10px] font-black text-slate-300 uppercase italic">Data tidak ditemukan</p>
      </div>
    )}
  </div>
</div>

          {/* Submit Button */}
          <button 
            disabled={isPending}
            className={`w-full py-5 rounded-[1.5rem] font-black uppercase italic tracking-widest shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3 ${
              isPending 
              ? "bg-slate-200 text-slate-400 cursor-not-allowed" 
              : "bg-fuchsia-600 text-white shadow-fuchsia-100"
            }`}
          >
            {isPending ? "Sedang Menyimpan..." : "Simpan Jadwal"}
          </button>
        </form>
      </div>
    </div>
  );
}