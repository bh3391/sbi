"use client";

import React, { useState } from "react";
import { 
  X, Calendar, BookOpen, Clock, Search, 
  Loader2, FileText, CheckCircle2, CalendarClock 
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
}

export default function StudentLogModal({ 
  student, 
  logs, 
  onClose,
  isLoading,
  dateRange,
  onFilter
}: StudentLogModalProps) {
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
              {student?.fullName || "Riwayat Siswa"}
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

        {/* List Log - Dense View */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50/20">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-300">
              <Loader2 size={18} className="animate-spin mb-2" />
              <p className="text-[8px] font-black uppercase">Loading Logs...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-slate-300 text-[9px] font-bold uppercase tracking-widest">No history found</p>
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="p-2.5 rounded-lg border border-fuchsia-200 bg-cyan-50/50 hover:border-slate-200 transition-all group">
                {/* Log Meta & Process Status */}
                <div className="flex justify-between items-start mb-2">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-700 leading-none">
                      {new Date(log.createdAt).toLocaleDateString('id-ID', { weekday: 'short', day: '2-digit', month: 'short' })}
                    </span>
                    <span className="text-[7px] text-cyan-600 font-bold uppercase mt-0.5 tracking-tighter">
                      Absen: {log.status}
                    </span>
                  </div>
                  
                  <div className="flex flex-col items-end gap-1">
                    <span className={`px-1.5 py-0.5 rounded text-[7px] font-black tracking-tighter uppercase border ${
                      log.processStatus === 'DONE' 
                      ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                      : log.processStatus === 'SCHEDULED'
                      ? "bg-amber-50 text-amber-600 border-amber-100"
                      : "bg-slate-50 text-slate-400 border-slate-100"
                    }`}>
                      {log.processStatus}
                    </span>
                  </div>
                </div>

                {/* Quick Action Buttons (Reschedule / Done) */}
                {log.processStatus !== 'DONE' && (
                  <div className="flex gap-1 mb-2 border-t border-slate-50 pt-2 animate-in fade-in slide-in-from-top-1">
                    <button 
                      disabled={isUpdating === log.id}
                      onClick={() => handleStatusUpdate(log.id, 'SCHEDULED')}
                      className="flex-1 py-1 bg-amber-500 text-white text-[7px] font-black uppercase rounded flex items-center justify-center gap-1 hover:bg-amber-600 disabled:opacity-50"
                    >
                      <CalendarClock size={8} /> Reschedule
                    </button>
                    <button 
                      disabled={isUpdating === log.id}
                      onClick={() => handleStatusUpdate(log.id, 'DONE')}
                      className="flex-1 py-1 bg-emerald-500 text-white text-[7px] font-black uppercase rounded flex items-center justify-center gap-1 hover:bg-emerald-600 disabled:opacity-50"
                    >
                      <CheckCircle2 size={8} /> Set Done
                    </button>
                  </div>
                )}

                {/* Subject & Session Info */}
                <div className="grid grid-cols-1 gap-1 border-t border-slate-50 pt-2">
                  <div className="flex items-center gap-2 text-slate-700">
                    <BookOpen size={10} className="text-slate-500" />
                    <span className="text-[8px] font-bold uppercase truncate">{log.subject?.name || '---'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <Clock size={10} className="text-slate-500" />
                    <span className="text-[8px] font-bold uppercase">{log.session?.name || '---'}</span>
                  </div>
                </div>

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
        <div className="p-3 border-t border-slate-100 bg-white">
          <button onClick={onClose} className="w-full py-2 text-[9px] font-black uppercase tracking-[0.2em] bg-fuchsia-500 text-white rounded-md">
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
}