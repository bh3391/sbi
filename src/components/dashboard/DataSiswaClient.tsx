"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import StudentProfileModal from "./StudentProfileModal";
import StudentLogModal from "@/components/dashboard/StudentLogModal";
import AddStudentForm from "@/components/dashboard/AddStudentForm";
import { getStudentLogs } from "@/app/actions/attendance"; // Pastikan path action benar
import { User, History, Search, Loader2, Plus } from "lucide-react";

export default function DataSiswaClient({ initialStudents, 
  locations, 
  packages, 
  subjects }: any) {
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [showAddStudent, setShowAddStudent] = useState(false);
  
  // State untuk kontrol Modal
  const [showProfile, setShowProfile] = useState(false);
  const [showLogs, setShowLogs] = useState(false);

  // State untuk Log Data (seperti di fitur Absensi)
  const [studentLogs, setStudentLogs] = useState<any[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  

  // Logic untuk mengambil Log Kehadiran
  const handleOpenLogs = async (student: any) => {
    setSelectedStudent(student);
    setShowLogs(true);
    setIsLoadingLogs(true);
    try {
      const res = await getStudentLogs(student.id) as any;
      if (res?.success) {
        setStudentLogs(res.data);
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  // Logic untuk Filter Tanggal di dalam Modal Log
  const applyDateFilter = async () => {
    if (!selectedStudent) return;
    setIsLoadingLogs(true);
    try {
      const res = await getStudentLogs(selectedStudent.id, startDate, endDate) as any;
      if (res?.success) setStudentLogs(res.data);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const filtered = initialStudents.filter((s: any) => 
    s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.nickname.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-500 transition-colors" size={16} />
        <input 
          type="text" 
          placeholder="Cari nama atau panggilan..."
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all shadow-sm"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Student List */}
      <div className="grid grid-cols-1 gap-1">
        {filtered.length > 0 ? (
          filtered.map((student: any) => (
            <div key={student.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:border-cyan-200 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-400 to-fuchsia-400 flex items-center justify-center text-white font-black shadow-lg shadow-cyan-100">
                  {student.imageProfile ? (
                  <img 
                    src={student.imageProfile} 
                    alt={student.fullName} 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User size={50} strokeWidth={1.5} />
                )}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 leading-tight">{student.nickname}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full uppercase ${student.remainingSesi <= 2 ? 'bg-rose-50 text-rose-500' : 'bg-cyan-50 text-cyan-600'}`}>
                      {student.remainingSesi} Sesi
                    </span>
                    <span className="text-[9px] text-slate-400 font-italic uppercase tracking-tighter">
                      • {student.locationName}
                    </span>
                  </div>
                </div>
              </div>


              <div className="flex gap-2">
                {/* Tombol Log Kehadiran */}
                <button 
                  onClick={() => handleOpenLogs(student)}
                  className="p-2.5 bg-cyan-50 text-cyan-600 rounded-xl hover:bg-cyan-600 hover:text-white active:scale-90 transition-all"
                >
                  <History size={18} />
                </button>
                
                {/* Tombol Profil */}
                <button 
                  onClick={() => { setSelectedStudent(student); setShowProfile(true); }}
                  className="p-2.5 bg-fuchsia-50 text-fuchsia-600 rounded-xl hover:bg-fuchsia-600 hover:text-white active:scale-90 transition-all"
                >
                  <User size={18} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center space-y-2">
            <p className="text-slate-400 text-sm font-medium">Siswa tidak ditemukan</p>
          </div>
        )}
        {/* Floating Action Button (FAB) */}
        <div className="fixed bottom-20 right-6 z-50">
          <motion.button
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => setShowAddStudent(true)}
            className="group relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-fuchsia-500 text-white shadow-2xl shadow-slate-300 transition-all active:bg-cyan-600"
          >
            {/* Background Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-fuchsia-600 to-cyan-500 opacity-0 transition-opacity group-hover:opacity-100" />
            
            {/* Icon */}
            <div className="relative z-10 flex items-center gap-2">
              <Plus size={24} strokeWidth={3} />
              {/* Label yang muncul di desktop atau saat hover */}
              <span className="hidden max-w-0 overflow-hidden whitespace-nowrap text-[10px] font-black uppercase tracking-widest transition-all duration-300 group-hover:max-w-xs sm:inline-block">
                Siswa Baru
              </span>
            </div>
          </motion.button>

          {/* Tooltip Mobile Style (Opsional) */}
          <div className="absolute bottom-full right-0 mb-3 whitespace-nowrap rounded-md bg-slate-800 px-2 py-1 text-[8px] font-bold uppercase tracking-widest text-white opacity-0 transition-opacity group-hover:opacity-100 sm:hidden">
            Tambah Siswa
          </div>
        </div>
      </div>

      {/* Modals dengan AnimatePresence */}
      <AnimatePresence>
        {showProfile && (
          <StudentProfileModal 
            student={selectedStudent} 
            onClose={() => setShowProfile(false)} 
          />
        )}

        {showLogs && (
          <StudentLogModal 
            student={selectedStudent} 
            logs={studentLogs} 
            onClose={() => {
                setShowLogs(false);
                setStudentLogs([]); // Clear logs saat tutup
            }}
            isLoading={isLoadingLogs}
            dateRange={{ startDate, setStartDate, endDate, setEndDate }}
            onFilter={applyDateFilter}
            refreshLogs={applyDateFilter}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showAddStudent && (
          <AddStudentForm 
            onClose={() => setShowAddStudent(false)}
            locations={locations}
            packages={packages}
            subjects={subjects}
          />
        )}
      </AnimatePresence>
    </div>
  );
}