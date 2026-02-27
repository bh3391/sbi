"use client";

import React, { useState, useMemo } from "react";
import { Search, X, MapPin, Clock, Calendar as CalendarIcon, Plus, UserPlus2, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  rooms: any[];
  sessions: any[];
  days: string[];
  sch?: any[]; // Opsional jika data sudah ada di dalam object rooms
  onSelectSlot: (day: string, room: any, session: any, schedule?: any) => void;
}

export default function AvailabilityExplorer({ rooms, sessions, days, onSelectSlot }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const availableSlots = useMemo(() => {
    const slots: any[] = [];

    days.forEach((day) => {
      rooms.forEach((room) => {
        const existingSchedules = room.schedules?.filter((s: any) => s.day === day) || [];
        
        sessions.forEach((session) => {
          const scheduleAtThisSession = existingSchedules.find((s: any) => s.sessionId === session.id);

          if (!scheduleAtThisSession) {
            slots.push({
              type: 'EMPTY',
              day, room, session,
              remaining: 5,
              key: `empty-${day}-${room.id}-${session.id}`
            });
          } else if (scheduleAtThisSession.students.length < 5) {
            slots.push({
              type: 'AVAILABLE',
              day, room, session,
              schedule: scheduleAtThisSession,
              remaining: 5 - scheduleAtThisSession.students.length,
              key: `avail-${scheduleAtThisSession.id}`
            });
          }
        });
      });
    });
    return slots;
  }, [rooms, sessions, days]);

  const filteredSlots = availableSlots.filter(slot => 
    slot.room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    slot.day.toLowerCase().includes(searchQuery.toLowerCase()) ||
    slot.session.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* FAB BUTTON */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 h-12 w-12 bg-slate-900 text-white rounded-3xl shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 group"
      >
        <div className="absolute -top-2 -right-2 bg-cyan-500 text-[10px] font-black px-2 py-1 rounded-full border-4 border-[#F8FAFC]">
          {availableSlots.length}
        </div>
        <Search size={24} className="group-hover:rotate-12 transition-transform" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed inset-0 bg-slate-50/50 opacity-100 mx-1 z-[60] flex flex-col mt-20 rounded-t-3xl shadow-2xl rounded-t-[30px] overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-cyan-50 border-b border-slate-100  sticky top-0 z-10">
              <div className="flex  justify-between items-center mb-6">
                <div>
                  <h2 className="text-lg font-bold  text-slate-900">Jadwal Tersedia</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tersedia {availableSlots.length} Opsi Jadwal</p>
                </div>
                <button onClick={() => setIsOpen(false)} className="h-8 w-8 bg-fuchsia-500 rounded-2xl flex items-center justify-center text-slate-50">
                  <X size={24} />
                </button>
              </div>

              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="text"
                  placeholder="Cari Hari, Ruangan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border-none p-3 pl-10 rounded-2xl text-xs font-bold outline-none ring-2 ring-transparent focus:ring-cyan-100 transition-all"
                />
              </div>
            </div>

            {/* List Slot */}
            <div className="flex-1 overflow-y-auto p-1 space-y-2 no-scrollbar pb-24 bg-cyan-50">
              {filteredSlots.map((slot) => (
                <div 
                  key={slot.key}
                  className="bg-white border border-slate-100 p-2 rounded shadow-sm flex items-center justify-between group hover:border-cyan-200 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className={`h-8 w-8 rounded-2xl flex items-center justify-center shadow-lg ${
                      slot.type === 'EMPTY' ? 'bg-cyan-500 text-white' : 'bg-amber-500 text-white'
                    }`}>
                      {slot.type === 'EMPTY' ? <Plus size={22} /> : <UserPlus2 size={22} />}
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-fuchsia-600 uppercase italic">{slot.day}</span>
                        <span className="text-slate-200 text-[8px]">●</span>
                        <span className="text-[10px] font-black text-cyan-600 uppercase italic">{slot.room.name}</span>
                      </div>
                      
                      <h4 className="text-sm font-black text-slate-800 uppercase mt-0.5">
                        {slot.session.name} 
                        <span className="text-[9px] font-medium text-slate-400 ml-2 italic">({slot.session.startTime})</span>
                      </h4>

                      {/* VISUAL COUNTER & PROGRESS BAR */}
                      <div className="flex items-center gap-3 mt-1.5">
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <div 
                              key={i} 
                              className={`h-1 w-2.5 rounded-full ${
                                i < (slot.type === 'EMPTY' ? 0 : slot.schedule.students.length) 
                                  ? 'bg-amber-400' 
                                  : 'bg-slate-200'
                              }`} 
                            />
                          ))}
                        </div>
                        <div className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter ${
                          slot.type === 'EMPTY' ? 'bg-slate-100 text-slate-400' : 'bg-amber-100 text-amber-600'
                        }`}>
                          {slot.type === 'EMPTY' ? '0/5' : `${slot.schedule.students.length}/5`} Murid
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => {
                      // Perbaikan: Kirim slot.schedule agar handleSelectAvailableSlot bisa membedakan ADD vs EDIT
                      onSelectSlot(slot.day, slot.room, slot.session, slot.schedule);
                      setIsOpen(false);
                    }}
                    className="h-8 w-8 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-90 transition-all"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}