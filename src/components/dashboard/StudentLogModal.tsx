"use client";

import React, { useState } from "react";
import { 
  X, Calendar, BookOpen, Clock, Search, 
  Loader2, CheckCircle2, CalendarClock 
} from "lucide-react";
import { updateProcessStatusAction } from "@/app/actions/attendance";

interface StudentLogModalProps {
  student: any;
  logs: any[];
  onClose: () => void;
  isLoading?: boolean;
  dateRange: {
    startDate: string;
    setStartDate: (date: string) => void;
    endDate: string;
    setEndDate: (date: string) => void;
  };
  onFilter: () => void;
  // Tambahkan prop ini agar bisa merefresh data di parent
  refreshLogs: () => Promise<void> | void; 
}

export default function StudentLogModal({ 
  student, 
  logs, 
  onClose,
  isLoading,
  dateRange,
  onFilter,
  refreshLogs
}: StudentLogModalProps) {
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [rescheduleDates, setRescheduleDates] = useState<Record<string, string>>({});
  const [activeRescheduleId, setActiveRescheduleId] = useState<string | null>(null);

  const handleDateChange = (logId: string, date: string) => {
    setRescheduleDates(prev => ({ ...prev, [logId]: date }));
  };

  const handleStatusUpdate = async (logId: string, status: string, customDate?: string) => {
    setIsUpdating(logId);
    try {
      // Menggunakan action yang sudah diimport
      const res = await updateProcessStatusAction(logId, status, customDate);
      
      if (res?.success) {
        // Reset state lokal
        setActiveRescheduleId(null);
        // Panggil refresh data dari parent
        refreshLogs();
      } else {
        alert(res?.message || "Gagal memperbarui status");
      }
    } catch (error) {
      console.error("Update error:", error);
      alert("Terjadi kesalahan sistem");
    } finally {
      setIsUpdating(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] bg-slate-900/40 backdrop-blur-[2px] flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-[320px] bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-cyan-50">
          <div className="flex flex-col">
            <h3 className="text-[11px] font-bold text-slate-800 uppercase tracking-tight truncate max-w-[200px]">
              {student?.fullName || "Riwayat Siswa"}
            </h3>
            <p className="text-[8px] text-cyan-600 uppercase tracking-widest font-black">Log Activity</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-md transition-all text-slate-400">
            <X size={16} />
          </button>
        </div>

        {/* Filter Area */}
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100">
          <div className="flex gap-1.5 items-center">
            <input 
              type="date" 
              value={dateRange.startDate} 
              onChange={(e) => dateRange.setStartDate(e.target.value)}
              className="flex-1 text-[9px] p-1.5 bg-white border border-slate-200 rounded outline-none font-bold text-slate-600 focus:border-cyan-500"
            />
            <span className="text-slate-300 text-[10px]">-</span>
            <input 
              type="date" 
              value={dateRange.endDate} 
              onChange={(e) => dateRange.setEndDate(e.target.value)}
              className="flex-1 text-[9px] p-1.5 bg-white border border-slate-200 rounded outline-none font-bold text-slate-600 focus:border-cyan-500"
            />
            <button 
              onClick={onFilter}
              disabled={isLoading}
              className="bg-fuchsia-500 text-white p-1.5 rounded hover:bg-fuchsia-600 disabled:bg-slate-200 transition-all"
            >
              {isLoading ? <Loader2 size={12} className="animate-spin" /> : <Search size={12} />}
            </button>
          </div>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-cyan-50">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-white border border-slate-100 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-slate-300 text-[10px] font-bold uppercase tracking-widest">No history found</p>
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="p-3 rounded-xl border border-slate-200 bg-white hover:border-cyan-200 transition-all group shadow-sm">
                
                {/* Meta Info */}
                <div className="flex justify-between items-start mb-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-700 leading-none">
                      {new Date(log.date || log.createdAt).toLocaleDateString('id-ID', { weekday: 'short', day: '2-digit', month: 'short' })}
                    </span>
                    <span className={`text-[7px] font-bold uppercase mt-1 px-1 rounded w-fit ${
                      log.status === 'LATE' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
                    }`}>
                      {log.status}
                    </span>
                  </div>
                  
                  <span className={`px-1.5 py-0.5 rounded text-[7px] font-black tracking-tighter uppercase border ${
                    log.processStatus === 'DONE' 
                      ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                      : log.processStatus === 'SCHEDULED'
                      ? "bg-amber-50 text-amber-600 border-amber-100"
                      : "bg-slate-50 text-slate-400 border-slate-100"
                  }`}>
                    {log.processStatus || 'PENDING'}
                  </span>
                </div>

                {/* Subject & Session */}
                <div className="space-y-1 mb-2">
                  <div className="flex items-center gap-2 text-slate-600">
                    <BookOpen size={10} className="text-cyan-500" />
                    <span className="text-[9px] font-bold uppercase truncate">{log.subject?.name || 'No Subject'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Clock size={10} className="text-cyan-500" />
                    <span className="text-[9px] font-bold uppercase">{log.session?.name || '---'}</span>
                  </div>
                  {log.processStatus === 'SCHEDULED' && (
                    <div className="flex items-center gap-2 text-amber-600">
                      <Calendar size={10} />
                      <span className="text-[7px] font-bold">{new Date(log.rescheduleDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    </div>)}
                </div>

                {/* Action Section */}
                {log.processStatus !== 'DONE' && (
                  <div className="mt-2 border-t border-slate-50 pt-2 space-y-2">
                    {activeRescheduleId === log.id ? (
                      <div className="animate-in slide-in-from-top-1 duration-200">
                        <label className="text-[7px] font-black text-amber-600 uppercase mb-1 block">New Schedule Date:</label>
                        <div className="flex gap-1">
                          <input 
                            type="date"
                            value={rescheduleDates[log.id] || ""}
                            onChange={(e) => handleDateChange(log.id, e.target.value)}
                            className="flex-1 text-[9px] border border-amber-200 rounded px-2 py-1 bg-amber-50/30 outline-none"
                          />
                          <button 
                            disabled={!rescheduleDates[log.id] || isUpdating === log.id}
                            onClick={() => handleStatusUpdate(log.id, 'SCHEDULED', rescheduleDates[log.id])}
                            className="bg-amber-500 text-white px-2 rounded disabled:opacity-50"
                          >
                            <CalendarClock size={12} />
                          </button>
                          <button onClick={() => setActiveRescheduleId(null)} className="text-slate-400 px-1">
                            <X size={12} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-1">
                        <button 
                          onClick={() => setActiveRescheduleId(log.id)}
                          className="flex-1 py-1.5 bg-amber-50 text-amber-600 border border-amber-100 text-[8px] font-black uppercase rounded flex items-center justify-center gap-1"
                        >
                          <CalendarClock size={10} /> Reschedule
                        </button>
                        <button 
                          disabled={isUpdating === log.id}
                          onClick={() => handleStatusUpdate(log.id, 'DONE')}
                          className="flex-1 py-1.5 bg-emerald-500 text-white text-[8px] font-black uppercase rounded flex items-center justify-center gap-1 shadow-sm shadow-emerald-100"
                        >
                          <CheckCircle2 size={10} /> Set Done
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {log.materi && (
                  <div className="mt-2 p-1.5 bg-slate-50 rounded border-l-2 border-slate-200">
                    <p className="text-[8px] text-slate-500 leading-tight italic tracking-tighter uppercase">
                      "{log.materi}"
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-white">
          <button onClick={onClose} className="w-full py-2.5 text-[10px] font-black uppercase tracking-[0.2em] bg-fuchsia-500 text-white rounded-xl shadow-lg active:scale-95 transition-all">
            Close Activity Panel
          </button>
        </div>
      </div>
    </div>
  );
}