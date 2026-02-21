"use client";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Mail, User, Award, Hash, ShieldCheck, Briefcase, MessageSquare, Lock } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import ResetPasswordForm from "./ResetPassword";

export default function TeacherProfileModal({ teacher, onClose }: any) {
  if (!teacher) return null;
  const [isResetting, setIsResetting] = useState(false);

  return (
    <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
      />

      <motion.div 
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="relative w-full max-w-md bg-white rounded-t-[40px] sm:rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[95vh]"
      >
        {/* 1. Header Banner */}
        <div className="relative h-32 bg-gradient-to-br from-slate-800 via-slate-900 to-fuchsia-900 flex-shrink-0">
          <button 
            onClick={onClose} 
            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white z-50 backdrop-blur-md transition-all active:scale-90"
          >
            <X size={20} />
          </button>
        </div>

        {/* 2. Floating Profile Picture */}
        <div className="relative flex justify-center -mt-16 z-10">
          <div className="relative group">
            <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-[35px] bg-cyan-100 p-1.5 shadow-xl ring-1 ring-cyan-200">
              <div className="w-full h-full rounded-[28px] bg-slate-50 flex items-center justify-center text-slate-300 overflow-hidden border border-slate-100">
                {teacher.image ? (
                  <img src={teacher.image} alt={teacher.name} className="w-full h-full object-cover" />
                ) : (
                  <User size={50} strokeWidth={1.5} />
                )}
              </div>
            </div>

            <div className="absolute -bottom-2 -right-2">
              <span className={`flex items-center gap-1.5 text-[8pt] font-base px-1 py-1.5 rounded-2xl border shadow-lg uppercase tracking-wider text-white ${
                teacher.role === 'ADMIN' ? 'bg-fuchsia-600 border-fuchsia-400' : 'bg-cyan-600 border-cyan-400'
              }`}>
                {teacher.role === 'ADMIN' && <ShieldCheck size={12} />}
                {teacher.role}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Main Content Area */}
        <div className="flex-1 overflow-y-auto px-6 pt-4 pb-8 space-y-8 no-scrollbar">
          
          {/* Identity */}
          <div className="text-center space-y-1">
            <h2 className="text-md font-bold text-slate-800 tracking-tight leading-tight">{teacher.name}</h2>
            <div className="flex items-center justify-center gap-2">
               <span className="h-px w-4 bg-slate-200"></span>
               <p className="text-[8pt] font-bold text-cyan-600 uppercase tracking-[0.2em]">{teacher.nickname || "Staff"}</p>
               <span className="h-px w-4 bg-slate-200"></span>
            </div>
          </div>

          {/* Teacher Stats/Info Cards */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-fuchsia-50 border border-slate-100 p-1 rounded-xl flex items-center gap-1">
              <div className="p-1 bg-white rounded-2xl text-fuchsia-500 shadow-sm"><Award size={18} /></div>
              <div>
                <p className="text-[8pt]  text-slate-400 uppercase tracking-tighter">Subject</p>
                <p className="text-[8pt] font-bold text-slate-700 truncate w-20 uppercase">{teacher.specialization || "General"}</p>
              </div>
            </div>
            <div className="bg-cyan-50 border border-slate-100 p-1 rounded-xl flex items-center gap-1">
              <div className="p-1 bg-white rounded-2xl text-cyan-500 shadow-sm"><MapPin size={18} /></div>
              <div>
                <p className="text-[8pt] font-bold text-slate-400 uppercase tracking-tighter">Cabang</p>
                <p className="text-[8pt] font-black text-slate-700 truncate w-24 uppercase">{teacher.homebase?.name || "Pusat"}</p>
              </div>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="bg-cyan-50/50 rounded-[32px] p-6 border border-dashed border-cyan-200 flex flex-col items-center space-y-4">
            <div className="bg-white p-4 rounded-3xl shadow-sm ring-1 ring-slate-100">
              <QRCodeSVG 
                value={teacher.qrCodeId || teacher.id} 
                size={140}
                level={"H"}
              />
            </div>
            <div className="text-center">
                <div className="flex items-center justify-center gap-1.5 text-slate-800 mb-1">
                    <Hash size={12} strokeWidth={3} />
                    <p className="text-[8pt] font-bold uppercase tracking-[0.1em]">Teacher Access Key</p>
                </div>
                <p className="text-[10pt]  text-slate-800 font-mono tracking-tighter bg-fuchsia-50 px-3 py-1 rounded-full shadow-sm">
                  {teacher.qrCodeId?.substring(0, 18)}...
                </p>
            </div>
          </div>

          {/* Professional Detail List */}
          <div className="bg-fuchsia-50 rounded-xl border border-fuchsia-500 p-2 space-y-1">
            {[
              { icon: <Mail size={16} className="text-fuchsia-500" />, label: "Email", value: teacher.email },
              { icon: <Briefcase size={16} className="text-cyan-500" />, label: "Role", value: teacher.role },
              { icon: <Hash size={16} className="text-amber-500" />, label: "ID Guru", value: teacher.id.substring(0, 8).toUpperCase() },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-2xl hover:bg-pink-50 transition-colors">
                <div className="flex items-center gap-1">
                  <div className="p-1.5 bg-slate-50 rounded-lg">{item.icon}</div>
                  <span className="text-[6pt]  text-slate-700 uppercase tracking-wider">{item.label}</span>
                </div>
                <span className="text-[10pt]  text-slate-700">{item.value}</span>
              </div>
            ))}
          </div>

          {/* Reset Password Logic */}
          <div className="space-y-4">
            {isResetting ? (
              <div className="bg-slate-50 rounded-3xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-top-4">
                <ResetPasswordForm 
                  userId={teacher.id} 
                  userName={teacher.name} 
                  onSuccess={() => {
                    
                    setIsResetting(false);
                  }} 
                />
                <button 
                  onClick={() => setIsResetting(false)}
                  className="w-full py-3 text-[10pt] font-bold text-slate-400 hover:text-slate-600 transition-colors border-t border-slate-200"
                >
                  Batal Ganti Password
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsResetting(true)}
                className="w-full flex items-center justify-between p-4 bg-rose-50 border border-rose-100 rounded-2xl hover:bg-rose-100 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Lock size={18} className="text-rose-500" />
                  <span className="text-[10pt] font-black text-rose-600 uppercase tracking-widest">Keamanan & Password</span>
                </div>
                <div className="text-[10pt] font-black text-rose-400 opacity-0 group-hover:opacity-100 transition-all">GANTI</div>
              </button>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex gap-3 pt-2">
            <button className="flex-[2] bg-slate-900 text-white py-4 rounded-2xl flex items-center justify-center gap-2 font-black text-[10pt] uppercase tracking-widest hover:bg-slate-800 active:scale-95 transition-all shadow-xl shadow-slate-200">
              <MessageSquare size={18} /> Chat Internal
            </button>
            <button className="flex-1 bg-white border-2 border-slate-100 text-slate-600 py-4 rounded-2xl font-black text-[10pt] uppercase tracking-widest active:bg-slate-50 transition-all hover:border-fuchsia-200">
              Edit
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}