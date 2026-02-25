"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { User, History, Search, Loader2, Plus, GraduationCap, MapPin, Mail, ShieldCheck, Pencil } from "lucide-react";
import AddTeacherForm from "@/components/dashboard/AddTeacherForm"; 
// Pastikan Anda membuat komponen Profile Modal khusus Guru atau sesuaikan StudentProfileModal
import TeacherProfileModal from "@/components/dashboard/TeacherProfileModal"; 
import EditTeacherForm from "@/components/dashboard/EditTeacherForm";

export default function DataGuruClient({ 
  teachers, 
  locations 
}: any) {
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [showAddTeacher, setShowAddTeacher] = useState(false);
  
  // State untuk kontrol Modal
  const [showProfile, setShowProfile] = useState(false);
  
const [showEditForm, setShowEditForm] = useState(false);

  const filtered = teachers.filter((t: any) => 
    t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.nickname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 mt-3  rounded-2xl border border-slate-200">
      {/* Search Bar */}
      <div className="relative group m-2">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-fuchsia-500 transition-colors" size={16} />
        <input 
          type="text" 
          placeholder="Cari nama, panggilan, atau spesialisasi..."
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-fuchsia-500/10 focus:border-fuchsia-500 transition-all shadow-sm"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Teacher List */}
      <div className="grid grid-cols-1 gap-1 px-1">
        {filtered.length > 0 ? (
          filtered.map((teacher: any) => (
            <div key={teacher.id} className="bg-gradient-to-r from-cyan-300 to-fuchsia-100  p-1 rounded-lg border border-slate-100 shadow-sm flex items-center justify-between hover:border-fuchsia-200 transition-all">
              <div className="flex items-center gap-3">
                {/* Avatar Section */}
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-400 overflow-hidden shadow-inner border border-slate-100">
                  {teacher.image ? (
                    <img 
                      src={teacher.image} 
                      alt={teacher.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={24} strokeWidth={1.5} />
                  )}
                </div>

                {/* Info Section */}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-slate-800 leading-tight">{teacher.name}</h3>
                    {teacher.role === 'ADMIN' && (
                      <ShieldCheck size={12} className="text-fuchsia-500" />
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                    <span className="flex items-center gap-1 text-[9px] font-bold text-cyan-600 uppercase tracking-tight">
                      <GraduationCap size={10} /> {teacher.specialization || "Generalist"}
                    </span>
                    <span className="flex items-center gap-1 text-[9px] text-slate-400 font-medium uppercase tracking-tighter">
                      <MapPin size={10} /> {teacher.homebase?.name || "No Homebase"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                {/* Tombol Lihat Profil */}
                <button 
                  onClick={() => { setSelectedTeacher(teacher); setShowProfile(true); }}
                  className="p-2.5  text-cyan-600 rounded-xl hover:bg-cyan-500 hover:text-white active:scale-90 transition-all border border-slate-100 shadow-sm group"
                  title="Lihat Profil"
                >
                  <User size={18} />
                </button>

                {/* Tombol Edit Profil - BARU */}
                <button 
                  onClick={() => { setSelectedTeacher(teacher); setShowEditForm(true); }}
                  className="p-2.5  text-fuchsia-400 rounded-xl hover:bg-fuchsia-600 hover:text-white active:scale-90 transition-all border border-slate-100 shadow-sm"
                  title="Edit Data"
                >
                  <Pencil size={18} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center space-y-2">
            <p className="text-slate-400 text-sm font-medium">Data pengajar tidak ditemukan</p>
          </div>
        )}

        {/* Floating Action Button (FAB) */}
        <div className="fixed bottom-24 right-6 z-50">
          <motion.button
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => setShowAddTeacher(true)}
            className="group relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-slate-900 text-white shadow-2xl shadow-slate-400 transition-all active:bg-fuchsia-600"
          >
            {/* Background Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-fuchsia-600 to-cyan-500 opacity-0 transition-opacity group-hover:opacity-100" />
            
            {/* Icon */}
            <div className="relative z-10 flex items-center gap-2">
              <Plus size={28} strokeWidth={3} />
              <span className="hidden max-w-0 overflow-hidden whitespace-nowrap text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 group-hover:max-w-xs group-hover:ml-2 sm:inline-block">
                Tambah Staff
              </span>
            </div>
          </motion.button>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showProfile && (
          <TeacherProfileModal 
            teacher={selectedTeacher} 
            onClose={() => setShowProfile(false)} 
          />
        )}

        {showAddTeacher && (
          <AddTeacherForm 
            onClose={() => setShowAddTeacher(false)}
            locations={locations}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
  {showEditForm && (
    <EditTeacherForm 
      teacherData={selectedTeacher} 
      locations={locations} 
      onClose={() => setShowEditForm(false)} 
    />
  )}
</AnimatePresence>
    </div>
  );
}