"use client";

import React, { useState, useMemo } from "react";
import { 
  X, Calendar, BookOpen, Clock, Search, 
  Loader2, CheckCircle2, CalendarClock, ListFilter, CheckCircle, ChevronDown, ChevronUp
} from "lucide-react";
import { updateProcessStatusAction } from "@/app/actions/attendance";
import { toast } from "sonner";

// ... (Interface tetap sama)
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
  refreshLogs: () => Promise<void> | void; 
}

export default function StudentLogModal({ 
  student, logs, onClose, isLoading, dateRange, onFilter, refreshLogs
}: StudentLogModalProps) {
  const [activeTab, setActiveTab] = useState<'ALL' | 'PLAN' | 'DONE'>('ALL');
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [rescheduleDates, setRescheduleDates] = useState<Record<string, string>>({});
  const [activeRescheduleId, setActiveRescheduleId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
    // Tutup form reschedule jika sedang terbuka saat ganti kartu
    if (expandedId !== id) setActiveRescheduleId(null);
  };
  // LOGIKA FILTER TAB
  const filteredLogs = useMemo(() => {
    if (activeTab === 'ALL') return logs;
    if (activeTab === 'PLAN') return logs.filter(l => l.processStatus === 'LISTED' || l.processStatus === 'SCHEDULED');
    if (activeTab === 'DONE') return logs.filter(l => l.processStatus === 'DONE');
    return logs;
  }, [logs, activeTab]);

  const handleStatusUpdate = async (logId: string, status: string, customDate?: string) => {
    setIsUpdating(logId);
    toast.promise(updateProcessStatusAction(logId, status, customDate), {
      loading: 'Memperbarui status...',
      success: (res) => {
        if (res?.success) {
          setActiveRescheduleId(null);
          refreshLogs();
          return `Berhasil: ${status}`;
        }
        throw new Error(res?.message || "Gagal");
      },
      error: (err) => err.message,
      finally: () => setIsUpdating(null),
    });
  };

  return (
    <div className="fixed inset-0 z-[110] bg-slate-900/40 backdrop-blur-[2px] flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-[320px] bg-cyan-50 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-200 flex justify-between items-center bg-cyan-50">
          <div className="flex flex-col">
            <h3 className="text-[11px] font-bold text-slate-800 uppercase truncate max-w-[200px]">
              {student?.fullName || "Riwayat"}
            </h3>
            <p className="text-[8px] text-cyan-600 uppercase tracking-widest font-black">Log Activity</p>
          </div>
          <button onClick={onClose} className="p-1.5 bg-fuchsia-500 rounded-2xl text-slate-50"><X size={16} /></button>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-white mx-4 mt-4 rounded-lg border border-cyan-200">
          {[
            { id: 'ALL', label: 'All', icon: ListFilter },
            { id: 'PLAN', label: 'Plan', icon: CalendarClock },
            { id: 'DONE', label: 'Done', icon: CheckCircle }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[9px] font-bold uppercase tracking-tighter transition-all ${
                activeTab === tab.id 
                ? "bg-white text-cyan-600 shadow-sm ring-1 ring-slate-200" 
                : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <tab.icon size={12} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filter Date Area */}
        <div className="px-4 py-3">
          <div className="flex gap-1 items-center bg-white p-1 rounded-lg border border-cyan-100">
            <input 
              type="date" value={dateRange.startDate} 
              onChange={(e) => dateRange.setStartDate(e.target.value)}
              className="flex-1 text-[8px] p-1.5 bg-transparent outline-none font-bold text-slate-600"
            />
            <Search size={10} className="text-slate-300" />
            <input 
              type="date" value={dateRange.endDate} 
              onChange={(e) => dateRange.setEndDate(e.target.value)}
              className="flex-1 text-[8px] p-1.5 bg-transparent outline-none font-bold text-slate-600"
            />
            <button 
              onClick={onFilter} disabled={isLoading}
              className="bg-cyan-500 text-white p-1.5 rounded-md hover:bg-cyan-600 disabled:bg-slate-200"
            >
              {isLoading ? <Loader2 size={10} className="animate-spin" /> : <Search size={10} />}
            </button>
          </div>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-50/50">
      {isLoading ? (
        // Skeleton Loader...
        [1, 2, 3].map((i) => <div key={i} className="h-12 bg-white animate-pulse rounded-xl" />)
      ) : filteredLogs.length === 0 ? (
        <div className="text-center py-10 text-[9px] font-bold text-slate-400 uppercase">No Data</div>
      ) : (
        filteredLogs.map((log) => {
          const isExpanded = expandedId === log.id;

          return (
            <div 
              key={log.id} 
              className={`bg-white border transition-all duration-200 overflow-hidden ${
                isExpanded ? 'rounded-2xl border-cyan-200 shadow-md' : 'rounded-xl border-slate-100 shadow-sm'
              }`}
            >
              {/* HEADER KARTU (Selalu Muncul) */}
              <button 
                onClick={() => toggleExpand(log.id)}
                className="w-full px-4 py-3 flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-start">
                    <span className="text-[10px] font-black text-slate-800 uppercase tracking-tighter">
                      {new Date(log.date || log.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                    </span>
                    <span className="text-[7px] text-slate-400 font-bold uppercase leading-none">
                       {new Date(log.date || log.createdAt).toLocaleDateString('id-ID', { weekday: 'long' })}
                    </span>
                  </div>

                  <div className={`px-2 py-0.5 rounded text-[7px] font-black uppercase border ${
                    log.processStatus === 'DONE' ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                    : log.processStatus === 'SCHEDULED' ? "bg-amber-50 text-amber-600 border-amber-100"
                    : "bg-rose-50 text-rose-600 border-rose-100"
                  }`}>
                    {log.processStatus || 'LISTED'}
                  </div>
                </div>

                {isExpanded ? <ChevronUp size={14} className="text-cyan-500" /> : <ChevronDown size={14} className="text-slate-300" />}
              </button>

              {/* DETAIL & ACTIONS (Muncul Saat Klik) */}
              {isExpanded && (
                <div className="px-4 pb-4 animate-in slide-in-from-top-2 duration-300">
                  <div className="h-[1px] bg-slate-50 w-full mb-3" />
                  
                  {/* Info Subjek & Sesi */}
                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center gap-2 text-slate-600">
                      <BookOpen size={11} className="text-cyan-500" />
                      <span className="text-[9px] font-bold uppercase">{log.subject?.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Clock size={11} className="text-cyan-500" />
                      <span className="text-[9px] font-bold uppercase">{log.session?.name}</span>
                    </div>
                    {log.rescheduleDate && (
                      <div className="mt-2 p-1.5 bg-amber-50 rounded-lg flex items-center gap-2 text-amber-600">
                        <CalendarClock size={11} />
                        <span className="text-[8px] font-black">Reschedule To: {new Date(log.rescheduleDate).toLocaleDateString('id-ID')}</span>
                      </div>
                    )}
                  </div>

                  {/* Tombol Aksi */}
                  {log.processStatus !== 'DONE' && (
                    <div className="space-y-2">
                      {activeRescheduleId === log.id ? (
                        <div className="flex gap-1 animate-in zoom-in-95 duration-200">
                          <input 
                            type="date" 
                            className="flex-1 text-[9px] border border-amber-200 rounded-lg px-2 py-1.5 bg-amber-50/30 outline-none"
                            onChange={(e) => setRescheduleDates(prev => ({ ...prev, [log.id]: e.target.value }))}
                          />
                          <button 
                            onClick={() => handleStatusUpdate(log.id, 'SCHEDULED', rescheduleDates[log.id])}
                            className="p-2 bg-amber-500 text-white rounded-lg shadow-sm"><CheckCircle2 size={14}/></button>
                          <button onClick={() => setActiveRescheduleId(null)} className="p-2 text-slate-400"><X size={14}/></button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => setActiveRescheduleId(log.id)}
                            className="flex-1 py-2 bg-slate-50 text-slate-600 text-[8px] font-black uppercase rounded-lg border border-slate-100 hover:bg-slate-100 transition-colors"
                          >
                            Reschedule
                          </button>
                          <button 
                            onClick={() => handleStatusUpdate(log.id, 'DONE')}
                            className="flex-1 py-2 bg-emerald-500 text-white text-[8px] font-black uppercase rounded-lg shadow-sm shadow-emerald-100 hover:bg-emerald-600 transition-colors"
                          >
                            Mark Done
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
        {/* Footer */}
        <div className="p-4 bg-cyan-50 border-t border-slate-100">
          <button onClick={onClose} className="w-full py-3 text-[10px] font-black uppercase tracking-widest bg-fuchsia-500 text-white rounded-xl active:scale-95 transition-all">
            Dismiss Panel
          </button>
        </div>
      </div>
    </div>
  );
}