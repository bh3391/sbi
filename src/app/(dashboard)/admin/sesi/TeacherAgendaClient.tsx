"use client";

import React, { useState, useEffect } from "react";
import { Clock, Users, ChevronRight } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import AttendanceSheet from "@/components/dashboard/AttendanceSheet";
// Import action jika Anda ingin fetch data saat dropdown berubah (Opsional jika data sudah di-pass lengkap)
// import { getTeacherAgenda } from "@/app/actions/schedules"; 

interface TeacherAgendaProps {
  initialSchedules: any[];
  allTeachers: any[];
  currentUser: any;
  today: string;
}

export default function TeacherAgendaClient({ 
  initialSchedules, 
  allTeachers, 
  currentUser,
  today
}: TeacherAgendaProps) {
  const [selectedTeacherId, setSelectedTeacherId] = useState(currentUser.id);
  // Simpan initialSchedules ke state agar bisa diupdate jika admin memilih guru lain
  const [schedules, setSchedules] = useState(initialSchedules);
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null);

  const isAdmin = currentUser.role === "ADMIN";

  // Sinkronisasi data jika initialSchedules dari server berubah
  useEffect(() => {
    setSchedules(initialSchedules);
  }, [initialSchedules]);

  // Handler jika Admin memilih guru lain
  // Catatan: Di sini idealnya Anda memanggil server action untuk fetch jadwal guru tersebut
  const handleTeacherChange = async (teacherId: string) => {
    setSelectedTeacherId(teacherId);
    // Jika data initialSchedules hanya berisi jadwal guru yang login, 
    // Anda perlu melakukan fetch ulang di sini atau redirect ke URL dengan query param baru.
  };

  const todayFormatted = new Intl.DateTimeFormat('id-ID', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  }).format(new Date());

  return (
    <div className="p-4 space-y-6 min-h-screen pb-24">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black uppercase italic text-slate-900 leading-none tracking-tighter">
            Agenda Mengajar
          </h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">
            {todayFormatted}
          </p>
        </div>
        
        {/* DROPDOWN PILIH GURU (Hanya untuk Admin) */}
        {isAdmin && (
          <div className="flex flex-col items-end gap-2">
             <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Lihat Guru Lain</label>
             <select 
               value={selectedTeacherId}
               onChange={(e) => handleTeacherChange(e.target.value)}
               className="bg-white border border-slate-200 text-xs font-bold p-2 px-3 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500 shadow-sm"
             >
               {allTeachers.map(t => (
                 <option key={t.id} value={t.id}>{t.nickname || t.fullName}</option>
               ))}
             </select>
          </div>
        )}
      </div>

      {/* LIST JADWAL */}
      <div className="space-y-4">
        {schedules.length > 0 ? (
          schedules.map((item) => (
            <div 
              key={item.id}
              onClick={() => setSelectedSchedule(item)} // KONEKSI: Buka AttendanceSheet
              className="bg-white border border-slate-100 p-5 rounded-[2.5rem] shadow-sm relative overflow-hidden group hover:border-cyan-200 active:scale-[0.98] transition-all cursor-pointer"
            >
              <div className="flex justify-between items-start relative z-10">
                <div className="flex gap-4">
                  {/* Waktu Sesi */}
                  <div className="flex flex-col items-center justify-center bg-slate-900 text-white p-3 rounded-2xl min-w-[75px] shadow-lg shadow-slate-200">
                    <span className="text-[9px] font-black uppercase opacity-60">Mulai</span>
                    <span className="text-sm font-black italic">{item.session.startTime}</span>
                  </div>

                  <div className="flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black text-cyan-600 uppercase italic tracking-wider">
                        {item.room.name}
                      </span>
                      <span className="text-slate-200">•</span>
                      <span className="text-[10px] font-black text-fuchsia-600 uppercase italic tracking-wider">
                        {item.subject.name}
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-slate-800 uppercase leading-tight">
                      Sesi {item.session.name}
                    </h3>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg">
                        <Users size={12} className="text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-500">
                          {item.students?.length || 0}/5 Murid
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="h-10 w-10 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-white transition-all shadow-inner">
                  <ChevronRight size={20} />
                </div>
              </div>

              {/* Progress bar kapasitas kelas */}
              <div className="mt-5 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-cyan-500 h-full transition-all duration-500" 
                  style={{ width: `${((item.students?.length || 0) / 5) * 100}%` }}
                />
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-24 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
            <div className="bg-white w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-sm">
               <Clock size={32} className="text-slate-300" />
            </div>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
              Tidak ada jadwal mengajar
            </p>
          </div>
        )}
      </div>

      {/* DRAWER / SHEET ABSENSI */}
      <AnimatePresence>
        {selectedSchedule && (
          <AttendanceSheet 
            schedule={selectedSchedule} 
            teacherId={selectedTeacherId} 
            onClose={() => setSelectedSchedule(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}