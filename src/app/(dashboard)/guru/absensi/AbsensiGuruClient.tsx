"use client";

import React, { useState, useMemo } from "react";
import { getAllTeacherAttendanceByDate } from "@/app/actions/teacher";


import { 
  Search, 
  Plus, 
  ChevronRight, 
  UserCircle, 
  Calendar
} from "lucide-react";
 import { AnimatePresence } from "framer-motion";
import TeacherLogModal from "@/components/dashboard/TeacherLogModal";

export default function AbsensiGuruClient({ 
  teacherName,
  teacherId, 
  initialsessions,
  
  
  initialTeachers, 
}: any) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [teacherLogs, setTeacherLogs] = useState<any[]>([]);
  const [showLogModal, setShowLogModal] = useState(false);
  const[startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]); // Default ke hari ini
  const[endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]); // Bisa diatur sesuai kebutuhan
  
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const user = { name: teacherName || "Admin" }; // Fallback ke "Admin" jika teacherName tidak tersedia
   // Debug: Pastikan data guru diterima dengan benar
  const [selectedDate, setSelectedDate] = useState("");

  const handleRowClick = async (teacher: any) => {
    setSelectedTeacher(teacher);
    setTeacherLogs([]); // Kosongkan log lama agar user tidak lihat data guru sebelumnya
    setIsLoadingLogs(true);
    setShowLogModal(true);

    try {
      // Pastikan format tanggal aman
      const date = selectedDate ? new Date(selectedDate) : new Date();
      
      const res = await getAllTeacherAttendanceByDate(teacher.id, date) as any;
      
      if (res?.success) {
        setTeacherLogs(res.data);
      } else {
        // Tambahkan feedback jika gagal
        alert(res.message || "Gagal mengambil data absensi");
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
      alert("Terjadi kesalahan koneksi");
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const applyDateFilter = async () => {
  if (!selectedTeacher || !startDate) return;

  setIsLoadingLogs(true);
  try {
    // Kirim string "YYYY-MM-DD" langsung ke action
    // atau jika action butuh Date, kirim dengan offset Singapore
    const res = await getAllTeacherAttendanceByDate(
      selectedTeacher.id, 
      new Date(`${startDate}T00:00:00+08:00`) 
    );
    
    if (res?.success) setTeacherLogs(res.data);
  } finally {
    setIsLoadingLogs(false);
  }
};

  const filteredTeachers = useMemo(() => {
  const search = searchTerm.toLowerCase().trim();
  return (initialTeachers || []).filter((t: any) => {
    // Cek semua kemungkinan field nama
    const fullName = (t?.fullName || t?.name || "").toLowerCase();
    const nickname = (t?.nickname || "").toLowerCase();
    return fullName.includes(search) || nickname.includes(search);
  });
  }, [searchTerm, initialTeachers]);
  

  return (
    <div className="min-h-screen bg-cyan-50 pb-32 font-sans antialiased text-slate-900">
      {/* 1. TOP APP BAR - Compact */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border border-cyan-300  px-4 py-2.5">
        <div className="flex justify-between items-center max-w-5xl mx-auto">
          <div className="flex flex-col">
            <h1 className="text-sm font-bold tracking-tight text-slate-800">Absensi Guru</h1>
            <div className="flex items-center gap-1.5">
               <Calendar size={10} className="text-blue-500" />
               <span className="text-[9px] font-medium text-slate-500 uppercase tracking-tighter">
                {new Date().toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}
               </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-cyan-100 px-2 py-1 rounded-md border border-slate-100">
             <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
             <span className="text-[8px] font-bold text-slate-700 uppercase tracking-widest">
              {user?.name || "Admin"}
             </span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-1 md:p-4 space-y-4">
        {/* 2. SEARCH BAR - Ultra Slim */}
        <div className="relative border border-cyan-200 rounded-lg shadow-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
          <input 
            type="text"
            placeholder="Cari Guru..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-cyan-200 rounded-lg text-[11px] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/5 focus:border-blue-400 transition-all shadow-sm"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* 3. USER TABLE - Dense View */}
        <div className="bg-white rounded-md border border-cyan-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left table-auto">
              <thead>
                <tr className="bg-cyan-50 border-b border-cyan-100">
                  <th className="px-4 py-2 text-[8px] font-bold text-slate-800 uppercase tracking-widest">Nama & Status Hari Ini</th>
                  
                  <th className="px-4 py-2 text-right text-[8px] font-bold text-slate-800 uppercase tracking-widest">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyan-100">
                {filteredTeachers.length > 0 ? (
                  filteredTeachers.map((teacher: any) => {
                    // Ambil log absensi terbaru
                  const todayLog = teacher.teacherAttendances?.[0]; 
                  const status = todayLog?.type || 'Belum Absen';
                  const isLate = todayLog?.status;
                  const hasAbsen = teacher.teacherAttendances?.length > 0;// Debug: Lihat data absensi guru di console
                  
                    // Helper untuk warna status
                    const getStatusStyle = (status: string) => {
                      switch (status) {
                        case 'HADIR': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
                        case 'IZIN': return 'bg-amber-50 text-amber-600 border-amber-100';
                        case 'SAKIT': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
                        case 'CUTI': return 'bg-red-50 text-red-600 border-red-100';
                        default: return 'bg-red-50 text-red-400 border-slate-200';
                      }
                    };

                    return (
                      <tr 
                        key={teacher.id} 
                        // PASTIKAN: kirim parameter 'teacher' ke fungsi klik
                        onClick={() => handleRowClick(teacher)}
                        className="group hover:bg-cyan-50/50 transition-colors cursor-pointer border-b border-cyan-50 last:border-none"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {/* Avatar Icon dengan indikator status */}
                            <div className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                              hasAbsen ? 'bg-cyan-100 text-cyan-600' : 'bg-slate-100 text-slate-400'
                            }`}>
                              <UserCircle size={20} />
                              {hasAbsen && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
                              )}
                            </div>

                            <div className="flex flex-col">
                              <span className="text-[12px] font-bold text-slate-700">
                                {teacher.nickname || teacher.fullName || teacher.name}
                              </span>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter border ${getStatusStyle(status)}`}>
                                  {status}
                                </span>
                                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter border ${isLate ? "bg-red-50 text-red-600 border-red-100" : "bg-green-50 text-green-600 border-green-100"}`}>
                                  {isLate ? "Late" : "On Time"}
                                </span>
                                
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end">
                            <ChevronRight size={16} className="text-slate-300 group-hover:text-cyan-500 transition-transform group-hover:translate-x-1" />
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  /* TAMPILKAN INI HANYA JIKA TIDAK ADA DATA */
                  <tr>
                    <td colSpan={2} className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <div className="p-3 bg-slate-50 rounded-full">
                          <Search size={20} className="text-slate-300" />
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          Guru tidak ditemukan
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>


      
      {/* 5. MODALS */}
      {showLogModal && (
              <TeacherLogModal 
                teacher={selectedTeacher} 
                logs={teacherLogs} 
                onClose={() => setShowLogModal(false)}
                isLoading={isLoadingLogs}
                dateRange={{ startDate, setStartDate, endDate, setEndDate }}
                onFilter={applyDateFilter}
              />
            )}
      
       



      

      
    </div>
  );
}