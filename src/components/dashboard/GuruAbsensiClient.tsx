"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  HelpCircle,
  Clock,
  AlertCircle,
  UserCheck,
  Calendar,
  Fingerprint,
  LogOut,
  FileText,
  X,
  QrCode as QrIcon,
} from "lucide-react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useZxing } from "react-zxing";
import {
  handleTeacherCheckIn,
  handleTeacherCheckOut,
  handleSubmitLeave,
} from "@/app/actions/teacher";
import DashboardHeader from "./header";
import { StudentAttendanceDrawer } from "./StudentAttendanceDrawer";
import { Toaster, toast } from "sonner";
import { getStudentLogs } from "@/app/actions/attendance";
import StudentLogModal from "@/components/dashboard/StudentLogModal";

interface Props {
  initialData: {
    profile: any;
    personalAttendance: any[];
    pendingTasks: any[];
  };
}

export default function GuruAbsensiClient({ initialData }: Props) {
  const [loading, setLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveType, setLeaveType] = useState<"IZIN" | "SAKIT" | "CUTI" | "">(
    "",
  );
  const [notes, setNotes] = useState("");
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showStudentDrawer, setShowStudentDrawer] = useState(false);
  const [selectedStudentForLog, setSelectedStudentForLog] = useState<any>(null);
  const [studentLogs, setStudentLogs] = useState<any[]>([]);
  const [isLogLoading, setIsLogLoading] = useState(false);
  const [startDateState, setStartDateState] = useState<string>("");
  const [endDateState, setEndDateState] = useState<string>("");

  const {
    profile,
    personalAttendance = [],
    pendingTasks = [],
  } = initialData || {};
  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  const filteredAttendance = personalAttendance.filter((log) => {
    const logDate = new Date(log.date);
    return (
      logDate.getMonth() === selectedMonth &&
      logDate.getFullYear() === selectedYear
    );
  });

  const fetchLogs = async (studentId: string) => {
    setIsLogLoading(true);
    try {
      const res = await getStudentLogs(studentId); // Fungsi getStudentLogs yang kita buat sebelumnya
      if (res.success) setStudentLogs(res.data);
    } finally {
      setIsLogLoading(false);
    }
  };

  // Deteksi jika sudah check-in hari ini
  const todayStr = new Date().toLocaleDateString("en-CA");
  const activeAttendance = personalAttendance.find(
    (log) =>
      new Date(log.date).toLocaleDateString("en-CA") === todayStr &&
      log.type === "HADIR" &&
      !log.checkOut,
  );
  const isCheckedIn = !!activeAttendance;

  // Handler Scanner
  const { ref } = useZxing({
    // Ganti onDecodeResult menjadi onResult
    onResult: (result) => {
      const text = result.getText();
      if (text) {
        // Beri feedback getar singkat jika di HP
        if (typeof navigator !== "undefined" && navigator.vibrate) {
          navigator.vibrate(100);
        }
        handleScanSuccess(text);
      }
    },
    paused: !showScanner,
    constraints: {
      video: {
        facingMode: "environment",
        aspectRatio: 1.0,
      },
    },
  });
  const handleScanSuccess = async (decodedText: string) => {
    setShowScanner(false); // Tutup scanner segera
    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        const attendanceAction = !isCheckedIn
          ? handleTeacherCheckIn(decodedText, coords)
          : handleTeacherCheckOut();

        toast.promise(attendanceAction, {
          loading: isCheckedIn
            ? "Proses Absen Pulang..."
            : "Proses Absen Masuk...",
          success: (res: any) => {
            setLoading(false);
            if (res.success) return res.message;
            throw new Error(res.message);
          },
          error: (err) => {
            setLoading(false);
            return err.message || "Gagal memproses absensi";
          },
        });
      },
      (err) => {
        setLoading(false);
        toast.error("Gagal mengambil lokasi", {
          description: "Pastikan GPS aktif dan izin lokasi diberikan.",
        });
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const onLeaveSubmit = async () => {
    // Validasi awal tetap ada agar tidak memicu toast loading jika data kosong
    if (!leaveType) {
      toast.warning("Pilih Alasan Izin", {
        description:
          "Mohon pilih kategori izin (Sakit/Izin/Lainnya) terlebih dahulu.",
      });
      return;
    }

    setLoading(true);

    // Gunakan toast.promise untuk pengalaman UX yang lebih interaktif
    toast.promise(handleSubmitLeave(leaveType as any, notes), {
      loading: "Sedang mengirim permohonan izin...",
      success: (res: any) => {
        if (res.success) {
          // Reset form & tutup modal
          setShowLeaveModal(false);
          setLeaveType("");
          setNotes("");
          return "Permohonan izin berhasil dikirim ke Admin!";
        } else {
          throw new Error(res.message || "Gagal mengirim izin");
        }
      },
      error: (err) => {
        return err.message || "Terjadi kesalahan sistem saat mengirim izin";
      },
      finally: () => {
        setLoading(false);
      },
    });
  };
  const summary = filteredAttendance.reduce(
    (acc, log) => {
      const type = log.type?.toUpperCase();
      const status = log.status?.toUpperCase();

      // 1. Hitung Berdasarkan Type
      if (type === "HADIR" || type === "PRESENT") {
        acc.attend++;

        // 2. Jika Hadir, cek apakah telat atau tepat waktu
        if (status === "LATE") {
          acc.late++;
        } else {
          acc.onTime++;
        }
      } else if (type === "IZIN" || type === "SAKIT" || type === "LEAVE") {
        acc.leave++;
      } else if (type === "ALPHA" || type === "ABSENT") {
        acc.alpha++;
      }

      return acc;
    },
    { onTime: 0, late: 0, leave: 0, alpha: 0, attend: 0 },
  );

  return (
    <div className="h-screen bg-transparent  font-sans">
      <DashboardHeader userId="" title="Absensi " />
      {/* SECTION 1: PROFILE & PRIMARY ACTION */}
      <section className="h-[48vh] flex flex-col items-center justify-center bg-gradient-to-t from-cyan-100 to-fuchsia-100 px-2">
        <div className="relative mb-6">
          <div className="h-40 w-40 rounded-full border-[6px] border-white shadow-2xl overflow-hidden ring-1 ring-slate-200">
            <img
              src={
                profile?.image ||
                `https://ui-avatars.com/api/?name=${profile?.name}`
              }
              alt="Avatar"
              className="h-full w-full object-cover"
            />
          </div>
          <div
            className={`absolute bottom-3 right-3 h-6 w-6 border-4 border-white rounded-full shadow-lg ${isCheckedIn ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`}
          />
        </div>

        <div className="text-center w-full max-w-[320px] space-y-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-slate-900 leading-none uppercase tracking-tighter">
              {profile?.name}
            </h1>
            <p className="text-[10px] font-black text-cyan-600 uppercase tracking-[0.2em]">
              {profile?.role}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowScanner(true)}
              disabled={loading}
              className={`flex-[2] py-4 rounded-2xl shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50 ${
                isCheckedIn
                  ? "bg-rose-600 shadow-rose-100"
                  : "bg-cyan-500 shadow-cyan-200"
              } text-white`}
            >
              {isCheckedIn ? <LogOut size={20} /> : <QrIcon size={20} />}
              <span className="text-[11px] font-black uppercase tracking-widest leading-none">
                {loading
                  ? "Processing..."
                  : isCheckedIn
                    ? "Scan to Out"
                    : "Scan to In"}
              </span>
            </button>

            <button
              onClick={() => setShowLeaveModal(true)}
              className="flex-1 bg-slate-100 text-slate-600 rounded-2xl flex items-center justify-center active:scale-95"
            >
              <FileText size={22} />
            </button>
          </div>
        </div>
      </section>
      {/* SCANNER OVERLAY */}
      {showScanner && (
        <div className="fixed mb-3 inset-0 z-[100] bg-slate-100/90 backdrop-blur-xl flex flex-col items-center justify-center p-6">
          <div className="w-full max-w-sm relative overflow-hidden rounded-[2.5rem] bg-black border border-white/10 shadow-2xl">
            {/* Header & Close */}
            <div className="absolute top-6 left-6 right-6 z-20 flex justify-between items-center">
              <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-400 animate-pulse">
                  Online
                </span>
              </div>
              <button
                onClick={() => setShowScanner(false)}
                className="h-10 w-10 bg-rose-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-rose-500/20 active:scale-90 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Video Viewport */}
            <div className="relative aspect-square bg-slate-900 flex items-center justify-center">
              <video
                ref={ref}
                className="w-full h-full object-cover scale-110" // Sedikit zoom agar memenuhi frame
              />

              {/* Custom Scanner Overlay */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Vignette Background */}
                <div className="absolute inset-0 border-[50px] border-black/60 shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]"></div>

                {/* Scanner Frame */}
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-56 h-56 relative">
                    {/* Corners */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-cyan-400 rounded-tl-2xl"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-cyan-400 rounded-tr-2xl"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-cyan-400 rounded-bl-2xl"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-cyan-400 rounded-br-2xl"></div>

                    {/* Animated Scanning Line */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_rgba(34,211,238,0.8)] animate-scan-line"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 bg-cyan-500 text-center">
              <p className="text-[10px] text-white font-bold uppercase tracking-[0.2em] leading-relaxed">
                Hadapkan Kamera <br /> ke QR Code Absensi
              </p>
            </div>
          </div>
        </div>
      )}
      {/* SECTION 2: ATTENDANCE LOG */}
      <section className="mt-4 px-6 py-4 space-y-3 bg-gradient-to-b from-cyan-100 to-fuchsia-100 px-2 border-t border-slate-200">
        <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2 px-1">
          <Calendar size={14} className="text-cyan-600" /> Riwayat Absensi
        </h3>
        <div className="overflow-hidden border border-cyan-100 rounded-2xl shadow-sm bg-white">
          <table className="w-full text-left">
            <thead className="bg-cyan-50 text-[8px] font-black text-slate-900 uppercase tracking-widest">
              <tr>
                <th className="px-4 py-3">Tanggal / Jam</th>
                <th className="px-4 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-[10px]">
              {personalAttendance.length > 0 ? (
                personalAttendance.slice(0, 5).map((log) => (
                  <tr key={log.id}>
                    <td className="px-4 py-4 uppercase tracking-tighter">
                      <p className="font-base text-slate-900">
                        {new Date(log.date).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </p>
                      <p className="text-[8px] font-base text-slate-900 tabular-nums">
                        {log.type === "HADIR"
                          ? `${new Date(log.checkIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} ${log.checkOut ? "- " + new Date(log.checkOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}`
                          : log.type}
                      </p>
                      <p className="text-[7px] text-cyan-600 font-bold tracking-widest">
                        {log.location}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span
                        className={`text-[8px]  px-2 py-1 rounded-md uppercase ${
                          log.status === "LATE"
                            ? "bg-amber-50 text-amber-600"
                            : log.status === "LEAVE"
                              ? "bg-blue-50 text-blue-600"
                              : "bg-emerald-50 text-emerald-600"
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={2}
                    className="p-8 text-center text-[9px] font-bold text-slate-300 uppercase"
                  >
                    Belum ada data
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex justify-between items-center px-1">
          <button
            onClick={() => setShowAllHistory(true)}
            className="text-[9px] font-bold text-cyan-600 uppercase tracking-widest hover:underline"
          >
            Lihat Semua
          </button>
        </div>
      </section>
      {/* MODAL FULL HISTORY */}
      {showAllHistory && (
        <div className="fixed inset-0 z-[110] max-w-lg mx-auto mx-1  bg-slate-900/60 backdrop-blur-sm flex items-end justify-center">
          <div className="bg-cyan-50 w-full h-[90vh] rounded-t-[2rem] flex flex-col animate-in slide-in-from-bottom duration-300">
            {/* HEADER & CLOSE */}
            <div className="p-6 pb-2 flex justify-between  items-start">
              <div>
                <h2 className="text-lg font-bold text-slate-900 uppercase tracking-tighter">
                  Rekap Absensi
                </h2>
                <p className="text-[9px] font-bold text-cyan-600 uppercase tracking-[0.2em]">
                  {profile?.name}
                </p>
              </div>
              <button
                onClick={() => setShowAllHistory(false)}
                className="h-10 w-10 bg-fuchsia-500 rounded-full flex items-center justify-center text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* HORIZONTAL MONTH FILTER */}
            <div className="px-6 py-4">
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                {months.map((month, index) => (
                  <button
                    key={month}
                    onClick={() => setSelectedMonth(index)}
                    className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                      selectedMonth === index
                        ? "bg-cyan-500 text-white shadow-lg shadow-cyan-100"
                        : "bg-white border border-cyan-200 text-slate-800"
                    }`}
                  >
                    {month}
                  </button>
                ))}
              </div>
            </div>

            {/* TABLE HEADER */}
            <div className="grid grid-cols-2 px-8 py-3 bg-cyan-100 text-[8px]  text-slate-800 uppercase tracking-widest">
              <span>Tanggal / Jam</span>
              <span className="text-right">Status</span>
            </div>

            {/* SCROLLABLE LIST */}
            <div className="flex-1 overflow-y-auto px-1 pb-10">
              <div className="divide-y divide-slate-50">
                {filteredAttendance.length > 0 ? (
                  filteredAttendance.map((log) => (
                    <div
                      key={log.id}
                      className="flex justify-between items-center hover:bg-cyan-100 border-b border-cyan-100 px-4  h-[60px]"
                    >
                      <div className="space-y-0.5">
                        <p className="text-[11px] font-black text-slate-900 uppercase">
                          {new Date(log.date).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "short",
                          })}
                        </p>
                        <p className="text-[9px] font-medium text-slate-500 tabular-nums uppercase">
                          {log.type === "HADIR" || log.type === "PRESENT"
                            ? `${new Date(log.checkIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} ${log.checkOut ? "→ " + new Date(log.checkOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}`
                            : log.type}
                        </p>
                        <p className="text-[7px] font-bold text-cyan-600 tracking-wider uppercase">
                          {log.location}
                        </p>
                      </div>

                      <div className="text-right">
                        <span
                          className={`text-[8px] font-black px-2.5 py-1 rounded-lg uppercase inline-block ${
                            log.status === "LATE"
                              ? "bg-amber-100 text-amber-700"
                              : log.status === "LEAVE" || log.status === "IZIN"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {log.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-20 text-center space-y-2">
                    <Calendar className="mx-auto text-slate-200" size={40} />
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                      Tidak ada data di bulan ini
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* FOOTER TOTAL (Opsional) */}
            {filteredAttendance.length > 0 && (
              <div className="p-6 bg-cyan-800 text-white rounded-t-[2.5rem] shadow-2xl space-y-4">
                {/* Baris Atas: Grid Ringkasan Utama */}
                <div className="grid grid-cols-4 gap-2">
                  <div className="bg-white/5 p-2 rounded-xl border border-white/5 text-center">
                    <p className="text-[6px] font-black uppercase tracking-widest text-emerald-400 mb-1">
                      On Time
                    </p>
                    <p className="text-sm font-black">{summary.onTime}</p>
                  </div>
                  <div className="bg-white/5 p-2 rounded-xl border border-white/5 text-center">
                    <p className="text-[6px] font-black uppercase tracking-widest text-amber-400 mb-1">
                      Late
                    </p>
                    <p className="text-sm font-black">{summary.late}</p>
                  </div>
                  <div className="bg-white/5 p-2 rounded-xl border border-white/5 text-center">
                    <p className="text-[6px] font-black uppercase tracking-widest text-blue-400 mb-1">
                      Izin/Sakit
                    </p>
                    <p className="text-sm font-black">{summary.leave}</p>
                  </div>
                  <div className="bg-white/5 p-2 rounded-xl border border-white/5 text-center">
                    <p className="text-[6px] font-black uppercase tracking-widest text-rose-400 mb-1">
                      Alpha
                    </p>
                    <p className="text-sm font-black">{summary.alpha}</p>
                  </div>
                </div>

                {/* Baris Tengah: Progress Bar Visual */}
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden flex">
                  <div
                    style={{
                      width: `${(summary.onTime / filteredAttendance.length) * 100}%`,
                    }}
                    className="bg-emerald-500 h-full"
                  />
                  <div
                    style={{
                      width: `${(summary.late / filteredAttendance.length) * 100}%`,
                    }}
                    className="bg-amber-500 h-full"
                  />
                  <div
                    style={{
                      width: `${(summary.leave / filteredAttendance.length) * 100}%`,
                    }}
                    className="bg-blue-500 h-full"
                  />
                  <div
                    style={{
                      width: `${(summary.alpha / filteredAttendance.length) * 100}%`,
                    }}
                    className="bg-rose-500 h-full"
                  />
                </div>

                {/* Baris Bawah: Total */}
                <div className="flex justify-between items-center pt-2 border-t border-white/10">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-50">
                      Total Kehadiran
                    </span>
                    <p className="text-[8px] text-emerald-400 font-bold uppercase">
                      {summary.attend} Hari Berhasil Absen
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-white leading-none">
                      {filteredAttendance.length}
                    </span>
                    <span className="text-[10px] font-bold text-slate-50 uppercase ml-1">
                      Hari
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* SECTION 3: PENDING TASKS */}
      <section className="px-6 py-10 space-y-3 bg-gradient-to-t from-cyan-100 to-fuchsia-100">
        <div className="flex items-center gap-2 px-1">
          <AlertCircle size={14} className="text-rose-500" />
          <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">
            Siswa Listed
          </h3>
        </div>
        <div className="overflow-hidden border border-rose-100 rounded-2xl shadow-sm bg-white">
          <table className="w-full text-left">
            <tbody className="divide-y divide-rose-50 text-[10px]">
              {pendingTasks.length > 0 ? (
                pendingTasks.slice(0, 5).map((task) => (
                  <tr key={task.id}>
                    <td className="px-4 py-4">
                      <p className="font-black text-slate-800 uppercase leading-none">
                        {task.student?.fullName}
                      </p>
                      <span
                        className={`text-[8px]  px-2 py-1 rounded-md uppercase ${
                          task.processStatus === "LISTED"
                            ? "bg-rose-50 text-rose-600"
                            : task.processStatus === "SCHEDULED"
                              ? "bg-amber-50 text-amber-600"
                              : "bg-emerald-50 text-emerald-600"
                        }`}
                      >
                        {task.processStatus}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedStudentForLog(task.student);
                          fetchLogs(task.student.id);
                        }}
                        className="h-9 w-9 bg-cyan-50 text-cyan-600 rounded-xl inline-flex items-center justify-center active:scale-90 transition-all border border-cyan-100 hover:bg-cyan-100"
                      >
                        <Clock size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="p-8 text-center text-[9px] font-bold text-slate-300 uppercase italic">
                    Semua tugas beres!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <button
          onClick={() => setShowStudentDrawer(true)}
          className="text-[9px] font-bold text-rose-600 uppercase tracking-widest hover:underline"
        >
          Lihat Semua
        </button>
      </section>
      <StudentAttendanceDrawer
        tasks={pendingTasks}
        isOpen={showStudentDrawer}
        onClose={() => setShowStudentDrawer(false)}
        onOpenLog={(student) => {
          setSelectedStudentForLog(student); // State di parent
          fetchLogs(student.id); // Fungsi fetch log di parent
        }}
      />
      {/* MODAL PENGAJUAN IZIN */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-cyan-50 w-full max-w-sm rounded-[2.5rem] p-8 space-y-6 shadow-2xl animate-in slide-in-from-bottom-20 duration-300">
            <div className="flex justify-between items-center">
              <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">
                Pengajuan Absen
              </h3>
              <button
                onClick={() => setShowLeaveModal(false)}
                className="h-8 w-8 rounded-full bg-fuchsia-500 flex items-center justify-center text-slate-50"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-1">
              {["IZIN", "SAKIT", "CUTI"].map((t) => (
                <button
                  key={t}
                  onClick={() => setLeaveType(t as any)}
                  className={`py-3 rounded-xl text-[9px] font-black transition-all border ${
                    leaveType === t
                      ? "bg-fuchsia-500 border-fuchsia-900 text-white"
                      : "bg-white border-slate-700 text-slate-400"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Keterangan..."
              className="w-full bg-transparent border border-slate-300 rounded-2xl p-4 text-[11px] h-24 focus:ring-1 focus:ring-slate-100"
            />

            <button
              onClick={onLeaveSubmit}
              disabled={!leaveType || loading}
              className="w-full bg-fuchsia-500 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] disabled:opacity-20 shadow-lg"
            >
              {loading ? "Mengirim..." : "Kirim Pengajuan"}
            </button>
          </div>
        </div>
      )}
      <div className="h-24 bg-gradient-to-b from-cyan-100 to-fuchsia-100" />{" "}
      {/* Spacer untuk scrollable content */}
      {selectedStudentForLog && (
        <StudentLogModal
          student={selectedStudentForLog}
          logs={studentLogs}
          isLoading={isLogLoading}
          onClose={() => setSelectedStudentForLog(null)}
          refreshLogs={() => fetchLogs(selectedStudentForLog.id)}
          // Pastikan dateRange dikelola dengan state jika ingin filter tanggal berfungsi
          dateRange={{
            startDate: startDateState,
            setStartDate: setStartDateState,
            endDate: endDateState,
            setEndDate: setEndDateState,
          }}
          onFilter={() => fetchLogs(selectedStudentForLog.id)}
        />
      )}
    </div>
  );
}
