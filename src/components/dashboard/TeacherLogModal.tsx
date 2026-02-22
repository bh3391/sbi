"use client";

import React, { useState } from "react";
import { 
  X, Calendar, BookOpen, Clock, Search, 
  Loader2, FileText, CheckCircle2, CalendarClock 
} from "lucide-react";
import { updateProcessStatusAction } from "@/app/actions/attendance";

interface TeacherLogModalProps {
  teacher: any;
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
}

export default function TeacherLogModal({ 
  teacher, 
  logs, 
  onClose,
  isLoading,
  dateRange,
  onFilter
}: TeacherLogModalProps) {
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const handleStatusUpdate = async (logId: string, status: string) => {
    setIsUpdating(logId);
    const res = await updateProcessStatusAction(logId, status);
    if (res.success) {
      // Refresh data logs setelah update berhasil
      onFilter(); 
    } else {
      alert(res.message);
    }
    setIsUpdating(null);
  };

  return (
    <div className="fixed inset-0 z-[110] bg-slate-900/40 backdrop-blur-[2px] flex justify-end animate-in fade-in duration-200">
      
      <div className="w-full max-w-[320px] bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header - Compact */}
        <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-cyan-100/50">
          <div className="flex flex-col">
            <h3 className="text-[11px] font-bold text-slate-800 uppercase tracking-tight truncate max-w-[200px]">
              {teacher?.name || "Riwayat Guru"}
            </h3>
            <p className="text-[8px] text-slate-700 uppercase tracking-widest font-bold">Log Activity</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-fuchsia-500 rounded-md transition-all text-slate-400">
            <X size={16} />
          </button>
        </div>


        {/* Filter Area */}
        <div className="px-4 py-2.5 bg-fuchsia-50/50 border-b border-slate-100">
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
              className="bg-fuchsia-500 text-white p-1.5 rounded hover:bg-slate-800 disabled:bg-slate-200 transition-all"
            >
              {isLoading ? <Loader2 size={12} className="animate-spin" /> : <Search size={12} />}
            </button>
          </div>
        </div>
        <div className="p-4 max-h-[70vh] overflow-y-auto bg-cyan-50/30">
  {isLoading ? (
    /* Skeleton Loading - Disesuaikan dengan bentuk Card agar tidak kaku */
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-20 bg-white border border-slate-100 animate-pulse rounded-xl" />
      ))}
    </div>
  ) : logs.length === 0 ? (
    /* Empty State */
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="p-3 bg-white rounded-full shadow-sm mb-3">
        <Search size={20} className="text-slate-200" />
      </div>
      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
        No history found
      </p>
    </div>
  ) : (
    /* List Content */
    <div className="space-y-3">
      {logs.slice(0, 10).map((log) => {
        const isLate = log.status === "LATE";
        
        return (
          <div 
            key={log.id} 
            className="p-3 rounded-xl border border-slate-100 bg-white hover:border-cyan-200 hover:shadow-sm transition-all group"
          >
            <div className="flex justify-between items-center">
              {/* Sisi Kiri: Waktu & Tanggal */}
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex flex-col items-center justify-center border shrink-0 ${
                  isLate ? 'bg-red-50 border-red-100 text-red-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'
                }`}>
                  <span className="text-[10px] font-bold leading-none">
                    {new Date(log.checkIn).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="text-[7px] uppercase font-black tracking-tighter mt-0.5">WIB</span>
                </div>
                
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-bold text-slate-700 truncate">
                    {new Date(log.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })}
                  </span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-[8px] text-slate-400 font-medium">Lokasi:</span>
                    <span className="text-[8px] text-cyan-600 font-bold uppercase tracking-tight truncate">
                      {log.location || 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sisi Kanan: Status Badge */}
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <span className={`px-2 py-0.5 rounded-full text-[8px] font-black tracking-widest uppercase border ${
                  isLate 
                    ? 'bg-amber-50 text-amber-600 border-amber-200' 
                    : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                }`}>
                  {isLate ? 'TERLAMBAT' : 'TEPAT WAKTU'}
                </span>
                <span className="text-[7px] text-slate-300 font-bold tracking-widest uppercase">
                  {log.type}
                </span>
              </div>
            </div>

            {/* Note Section */}
            {log.notes && (
              <div className="mt-2 pt-2 border-t border-slate-50">
                <p className="text-[9px] text-slate-500 italic leading-relaxed">
                  "{log.notes}"
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  )}
</div>
        {/* List Log - Dense View */}
        

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 bg-white">
          <button onClick={onClose} className="w-full py-2 text-[9px] font-black uppercase tracking-[0.2em] bg-fuchsia-500 text-white rounded-md">
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
}