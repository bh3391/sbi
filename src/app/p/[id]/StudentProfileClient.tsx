"use client";

import { useState } from "react";
import { 
  CheckCircle2, Calendar, CreditCard, MessageCircle, 
  Clock, ChevronRight 
} from "lucide-react";
import ReceiptDrawer from "@/components/dashboard/ReceiptDrawer";
import StudentProgressChart from "@/components/dashboard/StudentProgressChart";
import { motion } from "framer-motion";

export default function StudentPublicClient({ student }: { student: any }) {
  const [selectedPayment, setSelectedPayment] = useState<any>(null);

  const totalSesi = student.package?.sesiCredit || 1;
  const progressPercent = Math.min((student.remainingSesi / totalSesi) * 100, 100);

  return (
    <div className="max-w-lg mx-auto min-h-screen bg-[#F8FAFC] pb-24 font-sans text-slate-900">

      {/* 1. Header & Brand */}
      <div className="bg-gradient-to-tl from-fuchsia-600 to-cyan-300 pt-8 pb-16 px- rounded-b-[40px] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/10 rounded-full -mr-16 -mt-16 blur-3xl" />
        <div className="relative flex flex-col items-center">
          <div className="w-32 h-32 bg-gradient-to-tr from-fuchsia-600 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black mb-3 rotate-3 shadow-xl overflow-hidden border-2 border-white/20">
            {student.imageProfile ? (
                <img 
                src={student.imageProfile} 
                alt={student.fullName} 
                className="w-full h-full object-cover -rotate-3 scale-110" 
                />
            ) : (
                <span className="uppercase">{student.fullName.charAt(0)}</span>
            )}
            </div>
          <h1 className="text-xl font-black text-white uppercase tracking-tight italic text-center">
            {student.fullName}
          </h1>
          <p className="text-white text-[10px] font-bold uppercase tracking-[0.2em] mt-1">
            Student Membership Card
          </p>
        </div>
      </div>
      {student.status === "UNPAID" && (
        <div className="mt-3 bg-amber-500/20 border border-amber-500/50 px-4 py-1 rounded-full">
            <p className="text-[9px] font-black text-amber-500 uppercase tracking-[0.2em]">
            Tagihan Bulan Ini Tersedia
            </p>
        </div>
        )}
      {student.remainingSesi <= 2 && (
        <motion.div 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-rose-500 text-white px-6 py-3 flex items-center justify-between gap-3 shadow-lg"
        >
            <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg animate-pulse">
                <Clock size={18} className="text-white" />
            </div>
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest leading-none">Peringatan Kuota</p>
                <p className="text-xs font-bold opacity-90">Sesi belajar hampir habis!</p>
            </div>
            </div>
            <a 
            href={`https://wa.me/628123456789?text=Halo Admin, kuota ${student.fullName} sisa ${student.remainingSesi}. Saya ingin top up.`}
            className="bg-white text-rose-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow-sm active:scale-95 transition-transform"
            >
            Isi Ulang
            </a>
        </motion.div>
        )}

      

      {/* 2. Sisa Sesi Card */}
      <div className="px-2 -mt-8 relative z-10">
        <div className="bg-white rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
            Sisa Sesi Belajar
          </p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-6xl font-black text-slate-800 tracking-tighter">
              {student.remainingSesi}
            </span>
            <div className="text-left leading-none">
              <p className="text-xs font-bold text-slate-400 uppercase">Sesi</p>
              <p className="text-xs font-bold text-slate-400 uppercase">Tersisa</p>
            </div>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full mt-6 overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ${
                student.remainingSesi < 3 ? 'bg-rose-500' : 'bg-fuchsia-600'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-[9px] text-slate-400 mt-2 font-medium italic">
            Paket: {student.package?.name || "N/A"}
          </p>
        </div>
      </div>
      <div className="px-2 my-6 ">
        <StudentProgressChart attendances={student.attendances} />
        </div>

      {/* 3. Riwayat Section */}
      <div className="px-2 space-y-6">
        {/* Riwayat Absensi */}
        <section>
          <div className="flex justify-between items-end mb-4 px-2">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
              Kehadiran Terakhir
            </h3>
            <Clock size={14} className="text-slate-300" />
          </div>
          <div className="space-y-3">
            {student.attendances.length > 0 ? student.attendances.map((atd: any) => (
              <div key={atd.id} className="bg-white p-4 rounded-2xl flex items-center justify-between border border-slate-200/60 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-xl">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-800">
                      {new Date(atd.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })}
                    </p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">
                      Hadir • {new Date(atd.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <CheckCircle2 size={18} className="text-emerald-500" />
              </div>
            )) : (
              <p className="text-center text-xs text-slate-400 italic py-4">Belum ada data hadir.</p>
            )}
          </div>
        </section>

        {/* Riwayat Pembayaran */}
        <section>
          <div className="flex justify-between items-end mb-4 px-2">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
              Pembayaran Terverifikasi
            </h3>
            <CreditCard size={14} className="text-slate-300" />
          </div>
          <div className="space-y-3">
            {student.payments.map((p: any) => (
              <div 
                key={p.id} 
                onClick={() => setSelectedPayment(p)}  
                className="bg-white p-4 rounded-2xl flex justify-between items-center border border-slate-200/60 shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                <div>
                  <p className="text-[10px] font-black text-slate-700 uppercase">{p.category}</p>
                  <p className="text-[9px] text-slate-400 font-bold italic">
                    {new Date(p.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-black text-slate-800">
                    Rp {p.amount.toLocaleString('id-ID')}
                  </p>
                  <p className={`text-[8px] font-bold uppercase tracking-tighter ${p.status === 'SUCCESS' ? 'text-emerald-600' : 'text-amber-500'}`}>
                    {p.status === 'SUCCESS' ? 'Lunas' : 'Pending'}
                    </p>
                  <ChevronRight size={14} className="text-slate-300" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <ReceiptDrawer 
        payment={selectedPayment} 
        studentName={student.fullName}
        onClose={() => setSelectedPayment(null)} 
      />

      {/* 4. WhatsApp CTA */}
      <div className="fixed bottom-6 left-6 right-6 flex justify-center">
        <a 
          href={`https://wa.me/628123456789?text=Halo Admin, saya orang tua dari ${student.fullName}. Ingin menanyakan perihal sesi belajar.`}
          target="_blank"
          className="bg-emerald-500 hover:bg-emerald-600 active:scale-95 transition-all text-white w-full max-w-md py-4 rounded-2xl shadow-[0_10px_30px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest"
        >
          <MessageCircle size={18} fill="currentColor" />
          Hubungi Admin (WhatsApp)
        </a>
      </div>
    </div>
  );
}