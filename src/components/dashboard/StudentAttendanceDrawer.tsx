"use client";

import React, { useState } from "react";
import {
  X,
  AlertCircle,
  Clock,
  CheckCircle,
  Loader2,
  Search,
} from "lucide-react";
import { updateStudentStatusToDone } from "@/app/actions/attendance";

interface StudentTask {
  id: string;
  processStatus: string;
  student: {
    id: string;
    fullName: string;
  };
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  tasks: StudentTask[];
  onOpenLog: (student: any) => void;
}

export const StudentAttendanceDrawer = ({
  isOpen,
  onClose,
  tasks,
  onOpenLog,
}: Props) => {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  if (!isOpen) return null;

  // 1. Filter Tugas yang belum selesai
  // 2. Filter berdasarkan pencarian nama
  const filteredTasks = tasks
    .filter((t) => t.processStatus !== "DONE")
    .filter((t) =>
      t.student?.fullName.toLowerCase().includes(searchQuery.toLowerCase()),
    );

  const groupedTasks = filteredTasks.reduce(
    (acc, task) => {
      const studentId = task.student.id;
      if (!acc[studentId]) {
        acc[studentId] = {
          student: task.student,
          tasks: [],
        };
      }
      acc[studentId].tasks.push(task);
      return acc;
    },
    {} as Record<string, { student: any; tasks: StudentTask[] }>,
  );
  const groupedArrays = Object.values(groupedTasks);

  const handleProcess = async (taskId: string) => {
    setProcessingId(taskId);
    const res = await updateStudentStatusToDone(taskId);
    if (!res.success) {
      alert(res.message);
    }
    setProcessingId(null);
  };

  return (
    <div className="fixed inset-0 z-[110] max-w-md mx-auto bg-slate-900/60 backdrop-blur-sm mx-1 flex items-end justify-center">
      <div className="bg-cyan-50 w-full h-[95vh] rounded-t-[2.5rem] flex flex-col animate-in slide-in-from-bottom duration-300 overflow-hidden">
        {/* HEADER DRAWER */}
        <div className="p-6 flex justify-between items-center bg-white/50 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-white border border-cyan-100 rounded-full flex items-center justify-center text-cyan-500 shadow-sm">
              <AlertCircle size={20} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-tighter">
                Manajemen Absensi
              </h2>
              <p className="text-[9px]  text-slate-400 uppercase tracking-[0.2em]">
                {filteredTasks.length} Siswa Ditemukan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-10 w-10 bg-fuchsia-500 rounded-full flex items-center justify-center text-white active:scale-90 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* SEARCH BAR SECTION */}
        <div className="px-6 pb-4 bg-white/50">
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search
                size={14}
                className="text-slate-400 group-focus-within:text-cyan-500 transition-colors"
              />
            </div>
            <input
              type="text"
              placeholder="CARI NAMA SISWA..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-11 pr-4 text-[10px]  uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all shadow-sm placeholder:text-slate-300"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-rose-500"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* CONTENT SECTION */}
        <div className="flex-1 overflow-y-auto">
          <section className="px-6 py-4 space-y-3 bg-gradient-to-t from-cyan-50 to-white min-h-full">
            <div className="flex items-center gap-2 px-1">
              <AlertCircle size={14} className="text-rose-500" />
              <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">
                Daftar Tunggu
              </h3>
            </div>

            <div className="overflow-hidden border border-rose-100 rounded-2xl shadow-sm bg-white">
              <table className="w-full text-left">
                <tbody className="divide-y divide-rose-50 text-[10px]">
                  {groupedArrays.length > 0 ? (
                    groupedArrays.map((group) => (
                      <tr
                        key={group.student.id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-4 py-4">
                          <p className="font-black text-slate-800 uppercase leading-none mb-1.5">
                            {group.student?.fullName}
                          </p>
                          <span
                            className={`text-[8px] px-2 py-1 rounded-md font-black uppercase tracking-tighter ${
                              group.tasks[0].processStatus === "LISTED"
                                ? "bg-rose-50 text-rose-600 border border-rose-100"
                                : group.tasks[0].processStatus === "SCHEDULED"
                                  ? "bg-amber-50 text-amber-600 border-amber-100"
                                  : "bg-emerald-50 text-emerald-600 border-emerald-100"
                            }`}
                          >
                            {group.tasks[0].processStatus}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => onOpenLog(group.student)}
                              className="h-9 w-9 bg-cyan-50 text-cyan-600 rounded-xl inline-flex items-center justify-center active:scale-90 transition-all border border-cyan-100 hover:bg-cyan-100"
                            >
                              <Clock size={16} />
                            </button>

                            <button
                              onClick={() => handleProcess(group.tasks[0].id)}
                              disabled={processingId === group.tasks[0].id}
                              className="h-9 w-9 bg-fuchsia-500 text-white rounded-xl inline-flex items-center justify-center active:scale-90 transition-all disabled:opacity-50"
                            >
                              {processingId === group.tasks[0].id ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <CheckCircle size={16} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="p-12 text-center">
                        <div className="flex flex-col items-center opacity-30">
                          <Search size={32} className="mb-2 text-slate-400" />
                          <p className="text-[9px] font-bold text-slate-400 uppercase italic tracking-widest">
                            {searchQuery
                              ? "Siswa tidak ditemukan"
                              : "Semua tugas beres!"}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* FOOTER */}
        <div className="p-6 bg-cyan-50 border-t border-slate-100">
          <button
            onClick={onClose}
            className="w-full bg-fuchsia-500 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-fuchsia-200 active:scale-95 transition-all"
          >
            Tutup Panel
          </button>
        </div>
      </div>
    </div>
  );
};
