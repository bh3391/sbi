"use client";

import React from "react";
import { Plus, User, Users, GraduationCap, MapPin, Calendar, PlusCircle } from "lucide-react";


export default function JadwalSiswaPage() {
  // Dummy data dengan kondisi siswa kurang dari 5
  const sesiData = [
    {
      id: "s1",
      kelas: "12 IPA - Reguler",
      sesiNomor: "Sesi 1",
      jam: "08:00 - 10:00",
      guru: { name: "Deni Ramdani", nickname: "Deni" },
      siswa: [
        { id: "1", nickname: "Andi" },
        { id: "2", nickname: "Budi" },
        { id: "3", nickname: "Cici" },
      ], // Kurang dari 5, maka tombol tambah muncul
    }
  ];

  return (
    <main>
      <div className="px-6 py-4 bg-white border-b border-slate-100 sticky top-0 z-20">
  <div className="flex justify-between items-center mb-4">
    <h1 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Monitoring Ruang</h1>
    <div className="h-10 w-10 bg-slate-900 rounded-full flex items-center justify-center text-white">
      <Calendar size={20} />
    </div>
  </div>
  
  {/* Filter Hari - Scrollable */}
  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
    {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map((day) => (
      <button key={day} className="px-5 py-2 rounded-xl bg-slate-100 text-[10px] font-black uppercase text-slate-400 min-w-[90px]">
        {day}
      </button>
    ))}
  </div>
</div>
<div className="p-4 space-y-8">
  {/* RUANGAN SECTION */}
  <section>
    <div className="flex items-center gap-3 mb-4 px-2">
      <div className="h-8 w-8 bg-cyan-500 rounded-lg flex items-center justify-center text-white shadow-lg shadow-cyan-100">
        <MapPin size={16} />
      </div>
      <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Ruang A1 <span className="text-slate-300 ml-2">/ Sudirman</span></h2>
    </div>

    {/* SESSIONS LIST */}
    <div className="space-y-3">
      
      {/* SESI 1: TERISI */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between bg-slate-50 px-6 py-3 border-b border-slate-100">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Sesi 1 (08:00 - 10:00)</span>
          <span className="text-[9px] font-black text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full uppercase">Full 5/5</span>
        </div>
        <div className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-6 w-6 bg-cyan-100 rounded-md flex items-center justify-center text-cyan-600">
              <User size={14} />
            </div>
            <p className="text-xs font-black text-slate-700 uppercase">Guru: Deni Ramdani</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {['Andi', 'Budi', 'Cici', 'Dedi', 'Euis'].map((name) => (
              <span key={name} className="px-3 py-1.5 bg-slate-50 rounded-lg text-[10px] font-bold text-slate-500 border border-slate-100 uppercase">
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* SESI 2: KOSONG / TERSEDIA */}
      <div className="bg-white rounded-[2rem] border-2 border-dashed border-slate-200 p-6 flex flex-col items-center justify-center group hover:border-cyan-400 transition-all cursor-pointer">
        <div className="text-center">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-2 group-hover:text-cyan-500">Sesi 2 (10:00 - 12:00)</p>
          <div className="flex items-center justify-center gap-2 text-slate-400 group-hover:text-cyan-600">
            <PlusCircle size={24} />
            <span className="text-sm font-black uppercase">Plot Kelas Baru</span>
          </div>
        </div>
      </div>

    </div>
  </section>

  {/* RUANGAN B1... dst */}
</div>
    </main>
  );
}