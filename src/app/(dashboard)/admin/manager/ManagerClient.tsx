"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, MapPin, Clock, BookOpen, Trash2, Building2, 
  ChevronRight, DoorOpen, X, Loader2 
} from "lucide-react";
import { createRoom, createLocation, createStudentSession, createSubject, deleteLocation, deleteStudentSession,deleteSubject, deleteRoom } from "@/app/actions/manager";
import DashboardHeader from "@/components/dashboard/header";

export default function ManagerClient({ initialLocations, initialSessions, initialSubjects }: any) {
  const [activeTab, setActiveTab] = useState("lokasi");
  const [isPending, setIsPending] = useState(false);
  
  // Modal States
  const [modal, setModal] = useState<{ type: string | null }>({ type: null });

  const closeModal = () => {
    setModal({ type: null });
    setIsPending(false);
  };
  const [expandedLocation, setExpandedLocation] = useState<string | null>(null);

    const toggleLocation = (id: string) => {
    setExpandedLocation(expandedLocation === id ? null : id);
    };

  async function handleAction(e: React.FormEvent<HTMLFormElement>, actionFn: any) {
    e.preventDefault();
    setIsPending(true);
    const formData = new FormData(e.currentTarget);
    const res = await actionFn(formData);
    if (res.success) {
      closeModal();
      (e.target as HTMLFormElement).reset();
    } else {
      alert(res.error);
      setIsPending(false);
    }
  }
  const handleDelete = async (id: string, name: string, deleteFn: Function) => {
  if (confirm(`Apakah Anda yakin ingin menghapus "${name}"?`)) {
    const res = await deleteFn(id);
    if (!res.success) alert(res.error);
  }
};

  return (
    <div className="pb-24 min-h-screen bg-cyan-50">
      {/* HEADER & TAB SWITCHER (Sama seperti sebelumnya) */}
      <div className=" p-2 border-b border-slate-100 shadow-sm sticky top-0 z-30">
        <DashboardHeader title="Manajemen Master"  />
        <div className="flex gap-2 mt-2 p-1 bg-slate-50 rounded-2xl">
          {['lokasi', 'sesi', 'mapel'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === tab ? "bg-cyan-500 text-white shadow-sm" : "text-slate-400"}`}>{tab}</button>
          ))}
        </div>
      </div>

      <div className="p-6">
        <AnimatePresence mode="wait">
          {/* TAB LOKASI */}
          {activeTab === "lokasi" && (
            <motion.div key="lokasi" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setModal({ type: 'location' })} className="bg-white border border-slate-200 text-slate-600 py-2 rounded-3xl font-black text-[9px] uppercase tracking-widest flex flex-col items-center gap-2"><Building2 size={20}/> Cabang</button>
                <button onClick={() => setModal({ type: 'room' })} className="bg-cyan-500 text-white py-2 rounded-3xl font-black text-[9px] uppercase tracking-widest flex flex-col items-center gap-2 shadow-lg shadow-cyan-100"><DoorOpen size={20}/> Ruangan</button>
              </div>
              {initialLocations.map((loc: any) => (
                <div key={loc.id} className="flex flex-col gap-1">
                    {/* BARIS LOKASI UTAMA */}
                    <div 
                    onClick={() => toggleLocation(loc.id)}
                    className={`cursor-pointer transition-all duration-300 bg-white p-2 rounded-2xl border flex items-center justify-between group shadow-sm ${
                        expandedLocation === loc.id ? "border-fuchsia-500 ring-2 ring-fuchsia-50" : "border-fuchsia-300"
                    }`}
                    >
                    <div className="flex items-center gap-4">
                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-colors ${
                        expandedLocation === loc.id ? "bg-fuchsia-500 text-white" : "bg-slate-50 text-indigo-500 group-hover:bg-cyan-50 group-hover:text-cyan-500"
                        }`}>
                        <MapPin size={24} />
                        </div>
                        <div>
                        <h3 className="font-bold text-slate-800 uppercase leading-none">{loc.name}</h3>
                        <p className="text-[9px] font-bold text-slate-400 uppercase mt-1 italic">{loc.address || 'No Address'}</p>
                        </div>
                        
                        <div className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100 group-hover:bg-cyan-50/50 group-hover:border-cyan-100 transition-colors">
                        <DoorOpen size={10} className="text-slate-400 group-hover:text-cyan-500" />
                        <span className="text-[9px] font-black text-slate-500 group-hover:text-cyan-600">
                            {loc._count?.rooms || 0} RUANG
                        </span>
                        </div>
                   

                    
                        <button 
                        onClick={(e) => {
                            e.stopPropagation(); // Agar toggleLocation tidak terpicu
                            handleDelete(loc.id, loc.name, deleteLocation);
                        }} 
                        className="p-2 text-red-200 hover:text-rose-500 transition-colors"
                        >
                        <Trash2 size={18}/>
                        </button>
                        <ChevronRight size={16} className={`text-slate-300 transition-transform ${expandedLocation === loc.id ? "rotate-90 text-fuchsia-500" : ""}`} />
                    </div>
                     </div>
                    

                    {/* DAFTAR RUANGAN (SUB-LIST) */}
                    <AnimatePresence>
                    {expandedLocation === loc.id && (
                        <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden flex flex-col gap-1.5 pl-14 pr-2"
                        >
                        {loc.rooms && loc.rooms.length > 0 ? (
                            loc.rooms.map((room: any) => (
                            <motion.div 
                                key={room.id}
                                initial={{ x: -10, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                className="bg-white/50 border border-slate-100 p-3 rounded-xl flex items-center justify-between group/room"
                            >
                                <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-cyan-400 group-hover/room:scale-150 transition-transform" />
                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{room.name}</span>
                                </div>
                                <button 
                                onClick={() => handleDelete(room.id, room.name, deleteRoom)}
                                className="opacity-0 group-hover/room:opacity-100 p-1 text-slate-300 hover:text-rose-500 transition-all"
                                >
                                <Trash2 size={14}/>
                                </button>
                            </motion.div>
                            ))
                        ) : (
                            <p className="text-[9px] text-slate-400 uppercase font-bold pl-4 italic">Belum ada ruangan di cabang ini.</p>
                        )}
                        </motion.div>
                    )}
                    </AnimatePresence>
                </div>
                ))}
            </motion.div>
          )}

          {/* TAB SESI */}
          {activeTab === "sesi" && (
            <motion.div key="sesi" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
              <button onClick={() => setModal({ type: 'session' })} className="w-full bg-fuchsia-600 text-white py-4 rounded-3xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-fuchsia-100"><Plus size={16} /> Buat Sesi Baru</button>
              {initialSessions.map((sesi: any) => (
                <div key={sesi.id} className="bg-white p-2 rounded-lg border border-slate-100 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-fuchsia-50 text-fuchsia-500 rounded-xl flex items-center justify-center"><Clock size={20} /></div>
                    <div><h3 className="text-sm font-black text-slate-800 uppercase leading-none">{sesi.name}</h3><p className="text-[10px] font-bold text-slate-400 mt-1">{sesi.startTime} - {sesi.endTime}</p></div>
                  </div>
                  <button onClick={() => handleDelete(sesi.id, sesi.name, deleteStudentSession)} className="p-2 text-red-200 hover:text-rose-500"><Trash2 size={18}/></button>
                </div>
              ))}
            </motion.div>
          )}

          {/* TAB MAPEL */}
          {activeTab === "mapel" && (
            <motion.div key="mapel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
              <button onClick={() => setModal({ type: 'subject' })} className="w-full bg-fuchsia-500 text-white py-4 rounded-3xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl"><Plus size={16} /> Tambah Mapel</button>
              <div className="flex flex-wrap gap-2">
                {initialSubjects.map((sub: any) => (
                  <div key={sub.id} className="px-5 py-3 bg-white border border-slate-100 rounded-2xl flex items-center gap-3 shadow-sm group">
                    <BookOpen size={14} className="text-cyan-500" />
                    <span className="text-[10px] font-black text-slate-700 uppercase">{sub.name}</span>
                    <button onClick={() => handleDelete(sub.id, sub.name, deleteSubject)} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-rose-500"><X size={12}/></button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* --- MODAL ENGINE --- */}
      <AnimatePresence>
        {modal.type && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative">
              <button onClick={closeModal} className="absolute top-6 right-6 text-slate-300 hover:text-slate-900"><X size={20} /></button>
              
              {/* Form Lokasi */}
              {modal.type === 'location' && (
                <form onSubmit={(e) => handleAction(e, createLocation)} className="space-y-2">
                  <h2 className="text-lg font-bold text-fuchsia-500 uppercase  mb-4">Tambah Cabang</h2>
                  <input name="name" placeholder="Nama Cabang" className="w-full bg-slate-50 border border-slate-100 px-5 py-4 rounded-2xl text-xs font-bold" required />
                  <input name="address" placeholder="Alamat Singkat" className="w-full bg-slate-50 border border-slate-100 px-5 py-4 rounded-2xl text-xs font-bold" />
                  <div className="grid grid-cols-2 gap-2 italic">
                    <input name="latitude" type="number" step="any" placeholder="Latitude" className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-2xl text-[10px] font-bold" />
                    <input name="longitude" type="number" step="any" placeholder="Longitude" className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-2xl text-[10px] font-bold" />
                  </div>
                  <button disabled={isPending} className="w-full bg-fuchsia-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase">{isPending ? <Loader2 className="animate-spin mx-auto"/> : "Simpan Cabang"}</button>
                </form>
              )}

              {/* Form Sesi */}
              {modal.type === 'session' && (
                <form onSubmit={(e) => handleAction(e, createStudentSession)} className="space-y-4">
                  <h2 className="text-xl font-black text-fuchsia-600 uppercase italic mb-4">Buat Slot Waktu</h2>
                  <input name="name" placeholder="Contoh: Sesi Pagi" className="w-full bg-slate-50 border border-slate-100 px-5 py-4 rounded-2xl text-xs font-bold" required />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[8px] font-black text-slate-400 uppercase ml-2">Mulai</label>
                      <input name="startTime" type="time" className="w-full bg-slate-50 border border-slate-100 px-5 py-4 rounded-2xl text-xs font-bold" required />
                    </div>
                    <div>
                      <label className="text-[8px] font-black text-slate-400 uppercase ml-2">Selesai</label>
                      <input name="endTime" type="time" className="w-full bg-slate-50 border border-slate-100 px-5 py-4 rounded-2xl text-xs font-bold" required />
                    </div>
                  </div>
                  <button disabled={isPending} className="w-full bg-fuchsia-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase">{isPending ? <Loader2 className="animate-spin mx-auto"/> : "Simpan Sesi"}</button>
                </form>
              )}

              {/* Form Mapel */}
              {modal.type === 'subject' && (
                <form onSubmit={(e) => handleAction(e, createSubject)} className="space-y-4">
                  <h2 className="text-xl font-black text-slate-900 uppercase italic mb-4">Mata Pelajaran</h2>
                  <input name="name" placeholder="Contoh: Matematika" className="w-full bg-slate-50 border border-slate-100 px-5 py-4 rounded-2xl text-xs font-bold" required />
                  <button disabled={isPending} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase italic tracking-widest">Simpan Mapel</button>
                </form>
              )}

              {/* Form Ruangan (Gunakan logic select initialLocations) */}
              {modal.type === 'room' && (
                <form onSubmit={(e) => handleAction(e, createRoom)} className="space-y-4">
                   <h2 className="text-xl font-black text-cyan-500 uppercase italic mb-4">Tambah Ruangan</h2>
                   <input name="name" placeholder="Nama Ruang (Contoh: A1)" className="w-full bg-slate-50 border border-slate-100 px-5 py-4 rounded-2xl text-xs font-bold" required />
                   <select name="locationId" className="w-full bg-slate-50 border border-slate-100 px-5 py-4 rounded-2xl text-xs font-bold appearance-none" required>
                     <option value="">-- Pilih Cabang --</option>
                     {initialLocations.map((loc: any) => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                   </select>
                   <button disabled={isPending} className="w-full bg-cyan-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase">Simpan Ruang</button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}