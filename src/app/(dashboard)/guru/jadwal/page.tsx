"use client";

import React from "react";
import { Plus, User, Users, GraduationCap, MapPin } from "lucide-react";

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
    <div className="min-h-screen bg-[#F8FAFC] p-6 pb-24">
      <div className="mb-6">
        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Detail Sesi</h2>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Monitoring Kelas & Siswa</p>
      </div>

      <div className="grid gap-6">
        {sesiData.map((sesi) => (
          <div key={sesi.id} className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-100">
            {/* Header Kelas */}
            <div className="bg-slate-900 p-5 flex justify-between items-center">
              <div>
                <p className="text-[9px] font-black text-cyan-400 uppercase tracking-widest">{sesi.sesiNomor}</p>
                <h3 className="text-sm font-black text-white uppercase tracking-tight">{sesi.kelas}</h3>
              </div>
              <span className="text-[10px] font-bold text-slate-400 tabular-nums">{sesi.jam}</span>
            </div>

            <div className="p-6 space-y-6">
              {/* Bagian GURU (Paling Atas) */}
              <div className="flex items-center gap-3 p-4 bg-cyan-50 rounded-2xl border border-cyan-100">
                <div className="h-10 w-10 bg-cyan-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-cyan-100">
                  <User size={20} />
                </div>
                <div>
                  <p className="text-[8px] font-black text-cyan-600 uppercase tracking-widest">Guru Pengajar</p>
                  <p className="text-xs font-black text-slate-800 uppercase">{sesi.guru.name}</p>
                </div>
              </div>

              {/* Bagian SISWA */}
              <div className="space-y-3">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Users size={12} /> Daftar Siswa ({sesi.siswa.length}/5)
                </p>
                
                <div className="grid grid-cols-2 gap-2">
                  {sesi.siswa.map((s) => (
                    <div key={s.id} className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="h-6 w-6 rounded-full bg-white flex items-center justify-center text-[8px] font-black text-slate-400 border border-slate-200">
                        {s.nickname[0]}
                      </div>
                      <span className="text-[10px] font-black text-slate-700 uppercase tracking-tighter">{s.nickname}</span>
                    </div>
                  ))}

                  {/* TOMBOL TAMBAH (Muncul jika < 5) */}
                  {sesi.siswa.length < 5 && (
                    <button className="flex items-center justify-center gap-2 p-3 bg-white border-2 border-dashed border-slate-200 rounded-xl text-slate-400 hover:border-cyan-400 hover:text-cyan-500 transition-all active:scale-95">
                      <Plus size={14} />
                      <span className="text-[9px] font-black uppercase tracking-widest">Tambah</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}