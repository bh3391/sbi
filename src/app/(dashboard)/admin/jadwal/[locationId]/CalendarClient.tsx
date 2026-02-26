"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { 
  Calendar, MapPin, User, Plus, 
  ChevronLeft, ChevronRight, PlusCircle, Clock , Trash2, Edit3,
  UserPlus2
} from "lucide-react";
import { deleteSchedule } from "@/app/actions/schedule";
import ScheduleForm from "@/components/dashboard/ScheduleForm";
import DashboardHeader from "@/components/dashboard/header";
import {toast,Toaster} from "sonner";

const DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
interface CalendarClientProps {
  locationData: any; // Data lokasi tunggal beserta room & schedule
  teachers: any[];   // Daftar guru untuk dropdown
  sessions: any[];   // Daftar sesi untuk dropdown
  subjects: any[];   // Daftar mapel untuk dropdown
  students: any[];   // Daftar murid khusus lokasi ini
  initialData?: any; // Data jadwal untuk mode edit (opsional)
}

export default function CalendarClient({ locationData, 
  teachers, 
  sessions, 
  subjects, 
  students,
  
 }: CalendarClientProps) {
  const [selectedDay, setSelectedDay] = useState("Senin");
  const [roomIdx, setRoomIdx] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialData, setInitialData] = useState<any>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null);

  // Data diambil dari satu lokasi yang dipilih
  const rooms = locationData.rooms || [];
  const currentRoom = rooms[roomIdx];
  const getSubjectColor = (name: string) => {
  const lowerName = name?.toLowerCase() || "";
  if (lowerName.includes("calistung")) return "bg-fuchsia-100 text-fuchsia-600 border-fuchsia-200";
  if (lowerName.includes("inggris")) return "bg-orange-100 text-orange-600 border-orange-200";
  if (lowerName.includes("matematika")) return "bg-emerald-100 text-emerald-600 border-emerald-200";
  return "bg-slate-100 text-slate-600 border-slate-200"; // Default
};

  // Navigasi ruangan di dalam lokasi ini
  const handleNext = () => {
    if (roomIdx < rooms.length - 1) setRoomIdx(roomIdx + 1);
  };

  const handlePrev = () => {
    if (roomIdx > 0) setRoomIdx(roomIdx - 1);
  };
  const handleOpenAdd = () => {
  setSelectedSchedule(null);
  setIsModalOpen(true);
};
const handleOpenEdit = (schedule: any) => {
  setSelectedSchedule(schedule);
  setIsModalOpen(true);
};
  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* 1. STICKY HEADER & DAY FILTER */}
      <div className=" bg-white border-b border-slate-100 sticky top-0 z-30 shadow-sm">
        <DashboardHeader 
          title={`Jadwal / ${locationData.name}`} 
                   
          
        />
        
        <div className="flex gap-3 p-2 mt-1 overflow-x-auto no-scrollbar pb-1">
          {DAYS.map((day) => (
            <button 
              key={day} 
              onClick={() => setSelectedDay(day)}
              className={`px-1 py-1 rounded-2xl text-[10px] font-black uppercase transition-all min-w-[100px] border ${
                selectedDay === day 
                ? "bg-fuchsia-600 border-fuchsia-600 text-white shadow-lg shadow-fuchsia-100 scale-105" 
                : "bg-white border-slate-100 text-slate-400 hover:border-fuchsia-200"
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      <div className="p-3 bg-cyan-50">
        {/* 2. ROOM SELECTOR (NAVIGASI RUANGAN) */}
        <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-cyan-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-cyan-100">
              <MapPin size={22} />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-800 uppercase leading-none">
                {currentRoom?.name || "Tidak ada ruangan"}
              </h2>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 italic">
                Ruang {roomIdx + 1} dari {rooms.length}
              </p>
            </div>
          </div>
          
          <div className="flex gap-1.5">
            <button 
              onClick={handlePrev} 
              disabled={roomIdx === 0}
              className={`p-2.5 rounded-xl transition-all ${roomIdx === 0 ? "text-slate-200" : "bg-slate-50 text-slate-400 active:scale-90"}`}
            >
              <ChevronLeft size={18}/>
            </button>
            <button 
              onClick={handleNext} 
              disabled={roomIdx === rooms.length - 1}
              className={`p-2.5 rounded-xl transition-all ${roomIdx === rooms.length - 1 ? "text-slate-200" : "bg-slate-50 text-slate-400 active:scale-90"}`}
            >
              <ChevronRight size={18}/>
            </button>
          </div>
        </div>

        {/* 3. SCHEDULE LISTS */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentRoom?.id}-${selectedDay}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {currentRoom?.schedules
              ?.filter((sch: any) => sch.day === selectedDay)
              .sort((a: any, b: any) => a.session.startTime.localeCompare(b.session.startTime))
              .map((sch: any) => (
                <div key={sch.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                  
                  {/* Sesi & Kuota Info */}
                  <div className="flex items-center justify-between bg-cyan-50/50 px-4 py-3 border-b border-slate-100">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Clock size={14} className="text-cyan-500" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">
                        {sch.session.name}: {sch.session.startTime} - {sch.session.endTime}
                      </span>
                    </div>
                    <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase ${
                      sch.students.length >= 5 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
                    }`}>
                      {sch.students.length >= 5 ? 'FULL' : `${sch.students.length}/5 SISWA`}
                    </span>
                  </div>
                  

                  <div className="p-4">
                    {/* Teacher Info */}
                    <div className="flex items-center gap-3 mb-5">
                      <div className="h-9 w-9 bg-cyan-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <img src={sch.teacher.image || "/default-avatar.png"} alt={sch.teacher.nickname || sch.teacher.name} className="h-8 w-8 object-cover rounded-xl" />
                      </div>
                      <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Pengajar</p>
                        <p className="text-xs font-black text-slate-800 uppercase italic">
                          {sch.teacher.nickname || sch.teacher.name}
                        </p>
                      </div>
                      <div className="justify-end text-right ml-auto">
                        
                        <span className={`text-[10px]  rounded-full p-1  ${getSubjectColor(sch.subject?.name || '')}`}>
                          {sch.subject.name || sch.teacher.name}
                        </span>
                      </div>
                    </div>

                    {/* Students List */}
                    <div className="flex flex-wrap gap-2">
                      {sch.students.map((std: any) => (
                        <div key={std.id} className="px-4 py-2 bg-slate-50 rounded-xl text-[10px] font-bold text-slate-600 border border-slate-100 uppercase flex items-center gap-2 shadow-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                          {std.nickname || std.fullname}
                        </div>
                      ))}

                      {sch.students.length < 5 && (
                        <button onClick={() => handleOpenEdit(sch)} className="px-4 py-2 bg-white border border-dashed border-cyan-300 rounded-xl text-[10px] font-black text-cyan-600 uppercase flex items-center gap-2 hover:bg-cyan-50 transition-all active:scale-95">
                          <Plus size={14} /> Tambah Siswa
                        </button>
                      )}
                    </div>
                  </div>
                  {/* 4. ACTION BAR (DI BAGIAN BAWAH CARD) */}
                  <div className=" border-t border-slate-50 flex items-center justify-end pr-3">
                                       

                    <div className="flex items-end gap-1">
                      {/* Tombol Hapus (Kiri) */}
                    
                      {/* Tombol Edit (Tengah) */}
                      <button 
                        onClick={() => handleOpenEdit(sch)}
                        className="h-10 w-10 flex items-center justify-center  text-amber-600 text-[10px] font-black uppercase italic flex items-center gap-2 hover:bg-slate-800 transition-all active:scale-95 "
                      >
                        <Edit3 size={12} /> 
                      </button>

                      {/* Tombol Tambah Siswa (Kanan) - Hanya muncul jika < 5 */}
                      {sch.students.length < 5 && (
                        <button 
                          onClick={() => handleOpenEdit(sch)}
                          className="h-10 w-10 flex items-center justify-center text-cyan-500  text-[10px] font-black uppercase italic flex items-center gap-2 hover:bg-cyan-600 transition-all active:scale-95 "
                        >
                          <UserPlus2 size={12} /> 
                        </button>
                      )}
                      <button 
                      onClick={async () => {
                        if(confirm("Hapus jadwal ini?")) {
                          const res = await deleteSchedule(sch.id);
                          if(res.success) toast.success("Jadwal dihapus");
                        }
                      }}
                      className="h-10 w-10 flex items-center justify-center  text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all active:scale-90"
                      title="Hapus Jadwal"
                    >
                      <Trash2 size={12} />
                    </button>
                    </div>
                  </div>
                  
                </div>
              ))}

            {/* Empty Class Button */}
            <button onClick={() => setIsModalOpen(true)} className="w-full bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200 p-10 flex flex-col items-center justify-center group hover:border-fuchsia-400 transition-all active:scale-95 shadow-sm">
              <div className="h-14 w-14 bg-fuchsia-50 rounded-full flex items-center justify-center text-fuchsia-400 mb-3 group-hover:bg-fuchsia-100 group-hover:scale-110 transition-all">
                <PlusCircle size={28} />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] group-hover:text-fuchsia-600">
                Plot Jadwal Baru di {currentRoom?.name}
              </p>
            </button>
          </motion.div>
        </AnimatePresence>
      </div>
      {isModalOpen && (
  <ScheduleForm 
    currentRoom={currentRoom}
    selectedDay={selectedDay}
    teachers={teachers}
    sessions={sessions}
    subjects={subjects}
    students={students}
    initialData={selectedSchedule}
    onClose={() => {
      setIsModalOpen(false);
      setSelectedSchedule(null);
    }}
  />
)}
    </main>
  );
}