"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import StudentProfileModal from "./StudentProfileModal";
import StudentLogModal from "@/components/dashboard/StudentLogModal";
import AddStudentForm from "@/components/dashboard/AddStudentForm";
import StudentFormModal from "@/components/dashboard/StudentFormModal"; // Form khusus Edit
import { getStudentLogs } from "@/app/actions/attendance";
import { User, History, Search, Plus, ChevronDown, Circle } from "lucide-react";
import { updateStudentStatus } from "@/app/actions/students";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

export default function DataSiswaClient({
  initialStudents,
  locations,
  packages,
  subjects,
  addOns,
}: any) {
  const { data: session } = useSession();
  const userRole = session?.user?.role;
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [activeStatusId, setActiveStatusId] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState("ALL");

  // Kontrol Modal
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false); // Untuk FAB (Tambah)
  const [isEditOpen, setIsEditOpen] = useState(false); // Untuk Edit (dari Profil)
  const [showLogs, setShowLogs] = useState(false);

  // State untuk Log Data
  const [studentLogs, setStudentLogs] = useState<any[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Logic: Ambil Log Kehadiran
  const handleOpenLogs = async (student: any) => {
    setSelectedStudent(student);
    setShowLogs(true);
    setIsLoadingLogs(true);
    try {
      const res = (await getStudentLogs(student.id)) as any;
      if (res?.success) setStudentLogs(res.data);
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  // Logic: Filter Tanggal di Modal Log
  const applyDateFilter = async () => {
    if (!selectedStudent) return;
    setIsLoadingLogs(true);
    try {
      const res = (await getStudentLogs(
        selectedStudent.id,
        startDate,
        endDate,
      )) as any;
      if (res?.success) setStudentLogs(res.data);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  // Logic: Trigger Edit dari dalam Profile Modal
  const handleOpenEdit = (student: any) => {
    setIsProfileOpen(false); // Tutup modal profil dulu
    setSelectedStudent(student);
    setIsEditOpen(true); // Buka modal form edit
  };

  const filtered = initialStudents.filter((s: any) => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.nickname.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLocation =
      selectedLocation === "ALL" || s.locationId === selectedLocation;

    return matchesSearch && matchesLocation;
  });

  return (
    <div className="space-y-4 mt-1">
      {/* Search Bar */}

      <div className="relative group">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-500 transition-colors"
          size={16}
        />
        <input
          type="text"
          placeholder="Cari nama atau panggilan..."
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all shadow-sm"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Location Filter Bar */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        <button
          onClick={() => setSelectedLocation("ALL")}
          className={`px-4 py-2 rounded-xl text-[8px] font-bold uppercase tracking-wider transition-all whitespace-nowrap border ${
            selectedLocation === "ALL"
              ? "bg-fuchsia-500 text-white border-fuchsia-900 shadow-md"
              : "bg-white text-slate-800 border-slate-100 hover:border-slate-300"
          }`}
        >
          All Locations
        </button>

        {locations.map((loc: any) => (
          <button
            key={loc.id}
            onClick={() => setSelectedLocation(loc.id)}
            className={`px-4 py-2 rounded-xl text-[8px] font-bold uppercase tracking-wider transition-all whitespace-nowrap border ${
              selectedLocation === loc.id
                ? "bg-cyan-500 text-white border-cyan-500 shadow-md shadow-cyan-100"
                : "bg-white text-slate-800 border-slate-100 hover:border-slate-300"
            }`}
          >
            {loc.name}
          </button>
        ))}
      </div>

      {/* Student List */}
      <div className="grid grid-cols-1 gap-2">
        {filtered.length > 0 ? (
          filtered.map((student: any) => (
            <div
              key={student.id}
              className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:border-cyan-200 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-400 to-fuchsia-400 flex items-center justify-center text-white font-black shadow-lg shadow-cyan-100 overflow-hidden">
                  {student.imageProfile ? (
                    <img
                      src={student.imageProfile}
                      alt={student.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={20} />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 leading-tight">
                    {student.nickname}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    {/* DROPDOWN STATUS QUICK ACTION */}
                    <div className="relative inline-block text-left">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveStatusId(
                            activeStatusId === student.id ? null : student.id,
                          );
                        }}
                        // Kunci tombol jika role adalah TEACHER
                        disabled={userRole === "TEACHER"}
                        className={`text-[8px] font-bold px-2 py-0.5 rounded-full uppercase flex items-center gap-1 transition-all ${
                          student.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-600"
                            : student.status === "SUSPEND"
                              ? "bg-rose-50 text-rose-500"
                              : student.status === "NEWSTUDENT"
                                ? "bg-amber-50 text-amber-600"
                                : "bg-slate-50 text-slate-500"
                        } ${
                          userRole === "TEACHER"
                            ? "cursor-default opacity-80" // Tampilan saat terkunci
                            : "cursor-pointer hover:scale-105 active:scale-95"
                        }`}
                      >
                        {student.status}
                        {/* Sembunyikan panah jika TEACHER agar tidak terlihat seperti menu */}
                        {userRole !== "TEACHER" && <ChevronDown size={8} />}
                      </button>

                      {/* Menu Dropdown - Hanya Render jika BUKAN TEACHER */}
                      {userRole !== "TEACHER" &&
                        activeStatusId === student.id && (
                          <>
                            <div
                              className="fixed inset-0 z-50"
                              onClick={() => setActiveStatusId(null)}
                            />
                            <div className="absolute left-0 mt-1 w-28 bg-white border border-slate-100 rounded-xl shadow-xl z-[60] p-1 animate-in fade-in zoom-in duration-150">
                              {[
                                "ACTIVE",
                                "SUSPEND",
                                "NEWSTUDENT",
                                "INACTIVE",
                              ].map((st) => (
                                <button
                                  key={st}
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    setActiveStatusId(null);
                                    if (st === student.status) return;
                                    const res = await updateStudentStatus(
                                      student.id,
                                      st,
                                    );
                                    if (res.success)
                                      toast.success(
                                        `Status ${student.nickname} diubah ke ${st}`,
                                      );
                                  }}
                                  className="w-full text-left px-3 py-2 text-[9px] font-black uppercase rounded-lg hover:bg-slate-50 text-slate-500 hover:text-cyan-600 transition-colors flex items-center gap-2"
                                >
                                  <Circle
                                    size={6}
                                    fill={
                                      st === student.status
                                        ? "currentColor"
                                        : "none"
                                    }
                                  />
                                  {st}
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                    </div>

                    <span
                      className={`text-[8px] font-bold px-2 py-0.5 rounded-full uppercase ${student.remainingSesi <= 2 ? "bg-rose-50 text-rose-500" : "bg-cyan-50 text-cyan-600"}`}
                    >
                      {student.remainingSesi} Sesi
                    </span>
                    <span
                      className={`text-[8px] font-bold px-2 py-0.5 rounded-full uppercase ${student.addOnSesi <= 2 ? "bg-rose-50 text-rose-500" : "bg-cyan-50 text-cyan-600"}`}
                    >
                      + {student.addOnSesi} Sesi
                    </span>
                    <span className="hidden sm:inline text-[9px] text-slate-400 font-italic uppercase tracking-tighter">
                      • {student.locationName}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                {/* Tombol Log & Profil tetap sama */}
                <button
                  onClick={() => handleOpenLogs(student)}
                  className="p-2.5 bg-cyan-50 text-cyan-600 rounded-xl hover:bg-cyan-600 hover:text-white transition-all"
                >
                  <History size={18} />
                </button>
                <button
                  onClick={() => {
                    setSelectedStudent(student);
                    setIsProfileOpen(true);
                  }}
                  className="p-2.5 bg-fuchsia-50 text-fuchsia-600 rounded-xl hover:bg-fuchsia-600 hover:text-white transition-all"
                >
                  <User size={18} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center">
            <p className="text-slate-400 text-sm font-medium">
              Siswa tidak ditemukan
            </p>
          </div>
        )}

        {/* Floating Action Button (FAB) */}
        <div className="fixed bottom-20 right-6 z-50">
          <motion.button
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => setShowAddStudent(true)}
            className="group relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-slate-900 text-white shadow-2xl transition-all"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-fuchsia-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Plus size={24} strokeWidth={3} className="relative z-10" />
          </motion.button>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence mode="wait">
        {/* Modal Profil */}
        {isProfileOpen && (
          <StudentProfileModal
            key="profile"
            student={selectedStudent}
            onClose={() => setIsProfileOpen(false)}
            onEdit={handleOpenEdit}
          />
        )}

        {/* Modal Edit (Triggered by Profile) */}
        {isEditOpen && (
          <StudentFormModal
            key="edit-form"
            isOpen={isEditOpen}
            onClose={() => {
              setIsEditOpen(false);
              setSelectedStudent(null);
            }}
            initialData={selectedStudent}
            references={{ locations, packages, subjects }}
          />
        )}

        {/* Modal Tambah (Triggered by FAB) */}
        {showAddStudent && (
          <AddStudentForm
            key="add-form"
            onClose={() => setShowAddStudent(false)}
            locations={locations}
            packages={packages}
            subjects={subjects}
            addOns={addOns}
          />
        )}

        {/* Modal Log Kehadiran */}
        {showLogs && (
          <StudentLogModal
            key="logs"
            student={selectedStudent}
            logs={studentLogs}
            onClose={() => {
              setShowLogs(false);
              setStudentLogs([]);
            }}
            isLoading={isLoadingLogs}
            dateRange={{ startDate, setStartDate, endDate, setEndDate }}
            onFilter={applyDateFilter}
            refreshLogs={applyDateFilter}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
