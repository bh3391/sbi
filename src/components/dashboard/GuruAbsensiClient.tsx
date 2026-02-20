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
  QrCode as QrIcon
} from "lucide-react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { handleTeacherCheckIn, handleTeacherCheckOut, handleSubmitLeave } from "@/app/actions/teacher";
import DashboardHeader from "./header";
import { StudentAttendanceDrawer } from "./StudentAttendanceDrawer";


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
  const [leaveType, setLeaveType] = useState<"IZIN" | "SAKIT" | "CUTI" | "">("");
  const [notes, setNotes] = useState("");
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showStudentDrawer, setShowStudentDrawer] = useState(false);

  const { profile, personalAttendance = [], pendingTasks = [] } = initialData || {};
  const months = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];


const filteredAttendance = personalAttendance.filter((log) => {
  const logDate = new Date(log.date);
  return logDate.getMonth() === selectedMonth && logDate.getFullYear() === selectedYear;
});

  // Deteksi jika sudah check-in hari ini
  const todayStr = new Date().toLocaleDateString('en-CA');
  const activeAttendance = personalAttendance.find(log => 
    new Date(log.date).toLocaleDateString('en-CA') === todayStr && 
    log.type === "HADIR" && !log.checkOut
  );
  const isCheckedIn = !!activeAttendance;

  // Handler Scanner
  useEffect(() => {
    let scanner: any;
    if (showScanner) {
      scanner = new Html5QrcodeScanner("reader", { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      }, false);

      scanner.render(async (decodedText: string) => {
        setLoading(true);
        
        // Ambil Lokasi GPS sebelum kirim ke server
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const coords = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };

            if (!isCheckedIn) {
              const res = await handleTeacherCheckIn(decodedText, coords);
              if (!res.success) alert(res.message);
            } else {
              const res = await handleTeacherCheckOut();
              if (!res.success) alert(res.message);
            }
            
            scanner.clear();
            setShowScanner(false);
            setLoading(false);
          },
          (err) => {
            alert("Izin lokasi ditolak. Aktifkan GPS untuk absen.");
            setLoading(false);
          }
        );
      }, (err: any) => {});
    }
    return () => { if (scanner) scanner.clear(); };
  }, [showScanner, isCheckedIn]);

  const onLeaveSubmit = async () => {
    if (!leaveType) return;
    setLoading(true);
    const res = await handleSubmitLeave(leaveType as any, notes);
    if (res.success) {
      setShowLeaveModal(false);
      setLeaveType("");
      setNotes("");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-transparent pb-32 font-sans">
        <DashboardHeader title="Absensi "  />
      
      {/* SECTION 1: PROFILE & PRIMARY ACTION */}
      <section className="h-[48vh] flex flex-col items-center justify-center bg-gradient-to-t from-cyan-100 to-fuchsia-100 px-2">
        <div className="relative mb-6">
          <div className="h-40 w-40 rounded-full border-[6px] border-white shadow-2xl overflow-hidden ring-1 ring-slate-200">
            <img 
              src={profile?.image || `https://ui-avatars.com/api/?name=${profile?.name}`} 
              alt="Avatar" 
              className="h-full w-full object-cover"
            />
          </div>
          <div className={`absolute bottom-3 right-3 h-6 w-6 border-4 border-white rounded-full shadow-lg ${isCheckedIn ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
        </div>

        <div className="text-center w-full max-w-[320px] space-y-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-slate-900 leading-none uppercase tracking-tighter">{profile?.name}</h1>
            <p className="text-[10px] font-black text-cyan-600 uppercase tracking-[0.2em]">{profile?.role}</p>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={() => setShowScanner(true)}
              disabled={loading}
              className={`flex-[2] py-4 rounded-2xl shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50 ${
                isCheckedIn ? 'bg-rose-600 shadow-rose-100' : 'bg-cyan-500 shadow-cyan-200'
              } text-white`}
            >
              {isCheckedIn ? <LogOut size={20} /> : <QrIcon size={20} />}
              <span className="text-[11px] font-black uppercase tracking-widest leading-none">
                {loading ? "Processing..." : isCheckedIn ? "Scan to Out" : "Scan to In"}
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
        <div className="fixed inset-0 z-[100] bg-slate-300/95 backdrop-blur-md flex flex-col items-center justify-center p-6">
          <div className="w-full max-w-sm overflow-hidden rounded-[2.5rem] bg-cyan-50 border-1 border-cyan-300 p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-800">Scanner Aktif</h3>
              <button onClick={() => setShowScanner(false)} className="h-10 w-10 bg-fuchsia-500 rounded-full flex items-center justify-center text-slate-50">
                <X size={20}/>
              </button>
            </div>
            <div id="reader" className="overflow-hidden rounded-3xl border-0 bg-slate-50"></div>
            <p className="text-center text-[10px] text-slate-800 mt-6 font-bold uppercase tracking-widest">Scan QR Pribadi Anda di Lokasi Kantor</p>
          </div>
        </div>
      )}

      {/* SECTION 2: ATTENDANCE LOG */}
      <section className="px-6 py-4 space-y-3 bg-gradient-to-b from-cyan-100 to-fuchsia-100 px-2 border-t border-slate-200">
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
              {personalAttendance.length > 0 ? personalAttendance.slice(0, 5).map((log) => (
                <tr key={log.id}>
                  <td className="px-4 py-4 uppercase tracking-tighter">
                    <p className="font-base text-slate-900">
                      {new Date(log.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                    </p>
                    <p className="text-[8px] font-base text-slate-900 tabular-nums">
                      {log.type === 'HADIR' 
                        ? `${new Date(log.checkIn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} ${log.checkOut ? '- ' + new Date(log.checkOut).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}`
                        : log.type
                      }
                    </p>
                    <p className="text-[7px] text-cyan-600 font-bold tracking-widest">{log.location}</p>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className={`text-[8px]  px-2 py-1 rounded-md uppercase ${
                      log.status === 'LATE' ? 'bg-amber-50 text-amber-600' : 
                      log.status === 'LEAVE' ? 'bg-blue-50 text-blue-600' : 
                      'bg-emerald-50 text-emerald-600'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={2} className="p-8 text-center text-[9px] font-bold text-slate-300 uppercase">Belum ada data</td></tr>
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
    <div className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-sm flex items-end justify-center">
        <div className="bg-cyan-50 w-full h-[100vh] rounded-t-[2rem] flex flex-col animate-in slide-in-from-bottom duration-300">
        
        {/* HEADER & CLOSE */}
        <div className="p-6 pb-2 flex justify-between items-start">
            <div>
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tighter">Rekap Absensi</h2>
            <p className="text-[9px] font-bold text-cyan-600 uppercase tracking-[0.2em]">{profile?.name}</p>
            </div>
            <button onClick={() => setShowAllHistory(false)} className="h-10 w-10 bg-fuchsia-500 rounded-full flex items-center justify-center text-white"><X size={20}/></button>
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
            {filteredAttendance.length > 0 ? filteredAttendance.map((log) => (
                <div key={log.id} className="flex justify-between items-center hover:bg-cyan-500 border-b border-cyan-100 px-4  h-[60px]">
                <div className="space-y-0.5">
                    <p className="text-[11px] font-black text-slate-900 uppercase">
                    {new Date(log.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                    </p>
                    <p className="text-[9px] font-medium text-slate-500 tabular-nums uppercase">
                    {log.type === 'HADIR' || log.type === 'PRESENT'
                        ? `${new Date(log.checkIn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} ${log.checkOut ? '→ ' + new Date(log.checkOut).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}`
                        : log.type
                    }
                    </p>
                    <p className="text-[7px] font-bold text-cyan-600 tracking-wider uppercase">{log.location}</p>
                </div>

                <div className="text-right">
                    <span className={`text-[8px] font-black px-2.5 py-1 rounded-lg uppercase inline-block ${
                    log.status === 'LATE' ? 'bg-amber-100 text-amber-700' : 
                    log.status === 'LEAVE' || log.status === 'IZIN' ? 'bg-blue-100 text-blue-700' : 
                    'bg-emerald-100 text-emerald-700'
                    }`}>
                    {log.status}
                    </span>
                </div>
                </div>
            )) : (
                <div className="py-20 text-center space-y-2">
                <Calendar className="mx-auto text-slate-200" size={40} />
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Tidak ada data di bulan ini</p>
                </div>
            )}
            </div>
        </div>

      {/* FOOTER TOTAL (Opsional) */}
      {filteredAttendance.length > 0 && (
        <div className="p-6 bg-fuchsia-500 text-white flex justify-between items-center rounded-t-[2rem]">
          <span className="text-[10px] font-black uppercase tracking-widest">Total Kehadiran</span>
          <span className="text-xl font-black">{filteredAttendance.length} <small className="text-[10px] opacity-70">HARI</small></span>
        </div>
      )}
            </div>
    </div>
        )}

      {/* SECTION 3: PENDING TASKS */}
      <section className="px-6 py-10 space-y-3 bg-gradient-to-t from-cyan-100 to-fuchsia-100">
        <div className="flex items-center gap-2 px-1">
          <AlertCircle size={14} className="text-rose-500" />
          <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Siswa Listed</h3>
        </div>
        <div className="overflow-hidden border border-rose-100 rounded-2xl shadow-sm bg-white">
          <table className="w-full text-left">
            <tbody className="divide-y divide-rose-50 text-[10px]">
              {pendingTasks.length > 0 ? pendingTasks.slice(0, 5).map((task) => (
                <tr key={task.id}>
                  <td className="px-4 py-4">
                    <p className="font-black text-slate-800 uppercase leading-none">{task.student?.fullName}</p>
                    <span className={`text-[8px]  px-2 py-1 rounded-md uppercase ${
                      task.processStatus === 'LISTED' ? 'bg-rose-50 text-rose-600' : 
                      task.processStatus === 'SCHEDULED' ? 'bg-amber-50 text-amber-600' : 
                      'bg-emerald-50 text-emerald-600'
                    }`}>
                      {task.processStatus}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button className="h-9 w-9 bg-slate-900 text-white rounded-xl inline-flex items-center justify-center active:scale-90 transition-all">
                      <UserCheck size={16} />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr><td className="p-8 text-center text-[9px] font-bold text-slate-300 uppercase italic">Semua tugas beres!</td></tr>
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
        isOpen={showStudentDrawer}
        onClose={() => setShowStudentDrawer(false)}
        tasks={pendingTasks}
        />

      {/* MODAL PENGAJUAN IZIN */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-cyan-50 w-full max-w-sm rounded-[2.5rem] p-8 space-y-6 shadow-2xl animate-in slide-in-from-bottom-20 duration-300">
            <div className="flex justify-between items-center">
              <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Pengajuan Absen</h3>
              <button onClick={() => setShowLeaveModal(false)} className="h-8 w-8 rounded-full bg-fuchsia-500 flex items-center justify-center text-slate-50">
                <X size={16} />
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-1">
              {["IZIN", "SAKIT", "CUTI"].map((t) => (
                <button 
                  key={t}
                  onClick={() => setLeaveType(t as any)}
                  className={`py-3 rounded-xl text-[9px] font-black transition-all border ${
                    leaveType === t ? "bg-fuchsia-500 border-fuchsia-900 text-white" : "bg-white border-slate-700 text-slate-400"
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
    </div>
  );
}