"use client";

import React from "react";
import { X, AlertCircle, HelpCircle, Clock, CheckCircle, UserCheck, Search } from "lucide-react";
import { updateStudentStatusToDone } from "@/app/actions/attendance";
import { Loader2 } from "lucide-react";
import { useState } from "react";

interface StudentTask {
  id: string;
  processStatus: string;
  student: {
    fullName: string;
  };
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  tasks: StudentTask[];
}

export const StudentAttendanceDrawer = ({ isOpen, onClose, tasks }: Props) => {
    
    const [processingId, setProcessingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleProcess = async (taskId: string) => {
    setProcessingId(taskId);
    const res = await updateStudentStatusToDone(taskId);
    if (!res.success) {
      alert(res.message);
    }
    setProcessingId(null);
  };

  // Logika Sorting: LISTED (1), SCHEDULED (2), DONE (3)
  const statusPriority: Record<string, number> = {
    "LISTED": 1,
    "SCHEDULED": 2,
    "DONE": 3
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    const priorityA = statusPriority[a.processStatus?.toUpperCase()] || 99;
    const priorityB = statusPriority[b.processStatus?.toUpperCase()] || 99;
    return priorityA - priorityB;
  });

  return (
    <div className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-sm flex items-end justify-center">
      <div className="bg-cyan-50 w-full h-[95vh] rounded-t-[2.5rem] flex flex-col animate-in slide-in-from-bottom duration-300">
        
        {/* HEADER */}
        <div className="p-6 border-b border-cyan-100 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-rose-50 rounded-full flex items-center justify-center text-rose-500">
              <AlertCircle size={20} />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-tighter">Absensi Siswa</h2>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                {tasks.filter(t => t.processStatus !== 'DONE').length} Perlu Diproses
              </p>
            </div>
          </div>
          <button onClick={onClose} className="h-10 w-10 bg-fuchsia-500 rounded-full flex items-center justify-center text-white">
            <X size={20} />
          </button>
        </div>

        {/* LIST KONTEN */}
        <div className="flex-1 overflow-y-auto px-6 py-4 pb-20">
          <div className="divide-y divide-slate-50 ">
            {sortedTasks.map((task) => {
              const status = task.processStatus?.trim().toUpperCase();
              const isListed = status === "LISTED";
              const isScheduled = status === "SCHEDULED";
              const isDone = status === "DONE";
              const isLoading = processingId === task.id;

              return (
                <div key={task.id} className={`flex border-b border-cyan-100 justify-between items-center py-5 transition-all ${isDone ? 'opacity-40' : ''}`}>
                  <div>
                    <p className={`font-black uppercase text-[11px] leading-none mb-1 ${isDone ? 'text-slate-400' : 'text-slate-800'}`}>
                      {task.student?.fullName}
                    </p>
                    
                    <div className={`flex items-center gap-1 font-black uppercase text-[8px] tracking-tighter ${
                      isListed ? "text-rose-500" : isScheduled ? "text-amber-500" : "text-emerald-500"
                    }`}>
                      {isListed && <HelpCircle size={10} strokeWidth={3} />}
                      {isScheduled && <Clock size={10} strokeWidth={3} />}
                      {isDone && <CheckCircle size={10} strokeWidth={3} />}
                      <span>{task.processStatus}</span>
                    </div>
                  </div>

                  <div>
                    {!isDone ? (
                      <button 
                        onClick={() => handleProcess(task.id)}
                        disabled={isLoading}
                        className={`min-w-[80px] h-9 rounded-xl text-[9px] font-black uppercase tracking-widest text-white shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2 ${
                          isListed ? "bg-rose-500" : "bg-amber-500"
                        } disabled:opacity-50`}
                      >
                        {isLoading ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          "Proses"
                        )}
                      </button>
                    ) : (
                      <div className="h-8 w-8 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center">
                        <CheckCircle size={16} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* FOOTER ACTION */}
        <div className="p-6 bg-cyan-500 border-t border-slate-100 rounded-t-[2rem]">
           <button onClick={onClose} className="w-full bg-fuchsia-500  text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em]">
             Tutup Daftar
           </button>
        </div>
      </div>
    </div>
  );
  
};