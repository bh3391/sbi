"use client";

import React, { useState } from "react";
import { getStudentLogs } from "@/app/actions/attendance";
import StudentLogModal from "./StudentLogModal";
import AbsensiForm from "./AbsensiForm";
import {
  MapPin,
  Search,
  Plus,
  ChevronRight,
  UserCircle,
  Calendar,
} from "lucide-react";
import { AnimatePresence } from "framer-motion";

export default function AbsensiSiswaClient({
  teacherName,
  teacherId,
  initialStudents,
  initialSubjects,
  initialSessions,
  locations,
  dataAddon,
}: any) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [studentLogs, setStudentLogs] = useState<any[]>([]);
  const [showLogModal, setShowLogModal] = useState(false);
  const [showAbsensiForm, setShowAbsensiForm] = useState(false);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("ALL");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleRowClick = async (student: any) => {
    setSelectedStudent(student);
    setShowLogModal(true); // Buka modal dulu agar UX terasa cepat
    setIsLoadingLogs(true);

    try {
      // Gunakan parameter startDate/endDate yang ada di state
      const res = (await getStudentLogs(student.id, startDate, endDate)) as any;
      if (res?.success) {
        setStudentLogs(res.data);
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setIsLoadingLogs(false);
    }
  };

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

  const filteredStudents = initialStudents.filter((s: any) => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.nickname &&
        s.nickname.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesLocation =
      selectedLocation === "ALL" || s.locationId === selectedLocation;

    return matchesSearch && matchesLocation;
  });

  return (
    <div className="min-h-screen bg-cyan-50 pb-32 font-sans antialiased text-slate-900">
      {/* 1. TOP APP BAR - Compact */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border border-cyan-300  px-4 py-2.5">
        <div className="flex justify-between items-center max-w-5xl mx-auto">
          <div className="flex flex-col">
            <h1 className="text-sm font-bold tracking-tight text-slate-800">
              Absensi Siswa
            </h1>
            <div className="flex items-center gap-1.5">
              <Calendar size={10} className="text-blue-500" />
              <span className="text-[9px] font-medium text-slate-500 uppercase tracking-tighter">
                {new Date().toLocaleDateString("id-ID", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                })}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-cyan-100 px-2 py-1 rounded-md border border-slate-100">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
            <span className="text-[8px] font-bold text-slate-700 uppercase tracking-widest">
              {teacherName}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-1 md:p-4 space-y-2">
        {/* 2. SEARCH BAR - Ultra Slim */}
        <div className="relative border border-cyan-200 rounded-lg shadow-sm">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={13}
          />
          <input
            type="text"
            placeholder="Cari siswa..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-cyan-200 rounded-lg text-[11px] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/5 focus:border-blue-400 transition-all shadow-sm"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto py-2 no-scrollbar -mx-1 px-1">
          <button
            onClick={() => setSelectedLocation("ALL")}
            className={`px-2 py-1 rounded-lg text-[8px] font-bold uppercase tracking-widest transition-all whitespace-nowrap border-2 flex items-center gap-2 ${
              selectedLocation === "ALL"
                ? "bg-fuchsia-500 border-slate-50 text-white shadow-lg shadow-slate-200"
                : "bg-white border-slate-100 text-slate-400 hover:border-slate-300"
            }`}
          >
            <div
              className={`w-1.5 h-1.5 rounded-full ${selectedLocation === "ALL" ? "bg-cyan-400 animate-pulse" : "bg-slate-200"}`}
            />
            All Branches
          </button>

          {locations.map((loc: any) => {
            const isActive = selectedLocation === loc.id;
            // Hitung jumlah siswa per lokasi secara real-time
            const count = initialStudents.filter(
              (s: any) => s.locationId === loc.id,
            ).length;

            return (
              <button
                key={loc.id}
                onClick={() => setSelectedLocation(loc.id)}
                className={`px-2 py-1 rounded-lg text-[8px] font-bold uppercase tracking-widest transition-all whitespace-nowrap border-2 flex items-center gap-2 ${
                  isActive
                    ? "bg-white border-cyan-500 text-cyan-600 shadow-lg shadow-cyan-100"
                    : "bg-white border-slate-100 text-slate-400 hover:border-slate-300"
                }`}
              >
                <MapPin
                  size={12}
                  className={isActive ? "text-cyan-500" : "text-slate-300"}
                />
                {loc.name}
                <span
                  className={`ml-1 px-1.5 py-0.5 rounded-lg text-[8px] ${isActive ? "bg-cyan-100 text-cyan-600" : "bg-slate-50 text-slate-400"}`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* 3. STUDENT TABLE - Dense View */}
        <div className="bg-white rounded-md border border-cyan-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left table-auto">
              <thead>
                <tr className="bg-cyan-50 border-b border-cyan-100">
                  <th className="px-4 py-2 text-[8px] font-bold text-slate-800 uppercase tracking-widest">
                    Nama & Status Hari Ini
                  </th>
                  <th className="px-4 py-2 text-[8px] font-bold text-slate-800 uppercase tracking-widest">
                    Sesi
                  </th>
                  <th className="px-4 py-2 text-[8px] font-bold text-slate-800 uppercase tracking-widest">
                    Add-on
                  </th>
                  <th className="px-4 py-2 text-right text-[8px] font-bold text-slate-800 uppercase tracking-widest">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyan-100">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student: any) => {
                    const todayLog = student.attendances?.[0];
                    const status = todayLog?.processStatus || "LISTED";
                    const hasAbsen = student.attendances?.length > 0;

                    return (
                      <tr
                        key={student.id}
                        onClick={() => handleRowClick(student)}
                        className="group hover:bg-slate-50/80 transition-colors cursor-pointer"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                                hasAbsen
                                  ? "bg-blue-50 text-blue-500"
                                  : "bg-slate-50 text-slate-300"
                              }`}
                            >
                              <UserCircle size={18} />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[11px] font-bold text-slate-700 leading-none">
                                {student.nickname || student.fullName}
                              </span>
                              <div className="flex items-center gap-1.5 mt-1">
                                <span
                                  className={`text-[7px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter border ${
                                    status === "DONE"
                                      ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                      : status === "SCHEDULED"
                                        ? "bg-amber-50 text-amber-600 border-amber-100"
                                        : "bg-white text-slate-700 border-slate-200"
                                  }`}
                                >
                                  {hasAbsen ? status : "Belum Absen"}
                                </span>
                                {todayLog?.subject?.name && (
                                  <span className="text-[7px] text-slate-400 font-bold uppercase">
                                    • {todayLog.subject.name}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-slate-600">
                              {student.remainingSesi} Sesi
                            </span>
                            <div className="w-10 h-1 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-500 ${student.remainingSesi <= 2 ? "bg-rose-500" : "bg-cyan-500"}`}
                                style={{
                                  width: `${Math.min((student.remainingSesi / 12) * 100, 100)}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-slate-600">
                              {student.addOnSesi} Sesi
                            </span>
                            <div className="w-10 h-1 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-500 ${student.addOnSesi <= 2 ? "bg-rose-500" : "bg-fuchsia-500"}`}
                                style={{
                                  width: `${Math.min((student.addOnSesi / 12) * 100, 100)}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3 text-right">
                          <ChevronRight
                            size={14}
                            className="inline text-slate-300 group-hover:text-blue-500 transition-colors"
                          />
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-10 text-center text-slate-400"
                    >
                      <p className="text-[10px] font-medium uppercase tracking-widest">
                        Data tidak ditemukan
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* 4. FAB - Small & Sharp */}
      <button
        onClick={() => setShowAbsensiForm(true)}
        className="fixed bottom-24 right-5 w-12 h-12 bg-fuchsia-400 text-white rounded-xl shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-50 group"
      >
        <Plus size={22} strokeWidth={3} />
        <span className="absolute right-14 bg-slate-900 text-white text-[8px] font-black px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap uppercase tracking-widest">
          Input
        </span>
      </button>

      {/* 5. MODALS */}
      <AnimatePresence>
        {showAbsensiForm && (
          <AbsensiForm
            onClose={() => setShowAbsensiForm(false)}
            teacherName={teacherName}
            teacherId={teacherId}
            dataSiswa={initialStudents}
            dataSubject={initialSubjects}
            dataSession={initialSessions}
            dataAddon={dataAddon}
          />
        )}
      </AnimatePresence>

      {showLogModal && (
        <StudentLogModal
          student={selectedStudent}
          logs={studentLogs}
          onClose={() => setShowLogModal(false)}
          isLoading={isLoadingLogs}
          dateRange={{ startDate, setStartDate, endDate, setEndDate }}
          onFilter={applyDateFilter}
          refreshLogs={applyDateFilter}
        />
      )}
    </div>
  );
}
