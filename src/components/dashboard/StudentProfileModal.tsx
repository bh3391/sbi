"use client";
import { motion } from "framer-motion";
import {
  X,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  MessageCircle,
  User,
  Award,
  Hash,
  Copy,
  Check,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

interface StudentProfileModalProps {
  student: any;
  onClose: () => void;
  onEdit: (student: any) => void; // Fungsi pemicu edit
}

export default function StudentProfileModal({
  student,
  onClose,
  onEdit,
}: StudentProfileModalProps) {
  const [copied, setCopied] = useState(false);

  const { data: session } = useSession();
  const user = session?.user;

  if (!student) return null;

  const NGROK_URL = "https://fructed-lashawn-inertial.ngrok-free.dev";
  const publicUrl = `${NGROK_URL}/p/${student.id}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    toast.success("Link profil berhasil disalin!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
      />

      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="relative w-full max-w-md bg-white rounded-t-[40px] sm:rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[95vh]"
      >
        {/* 1. Header Area with Banner */}
        <div className="relative h-32 bg-gradient-to-tr from-cyan-400 to-fuchsia-500 flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/40 rounded-full text-white z-50 backdrop-blur-md transition-all active:scale-90"
          >
            <X size={20} />
          </button>
        </div>

        {/* 2. Floating Profile Picture */}
        <div className="relative flex justify-center -mt-16 z-10">
          <div className="relative group">
            <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-[35px] bg-white p-1.5 shadow-xl ring-1 ring-slate-200">
              <div className="w-full h-full rounded-[28px] bg-slate-50 flex items-center justify-center text-slate-300 overflow-hidden border border-slate-100">
                {student.imageProfile ? (
                  <img
                    src={student.imageProfile}
                    alt={student.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={50} strokeWidth={1.5} />
                )}
              </div>
            </div>

            {/* Status Badge */}
            <div className="absolute -bottom-2 -right-2">
              <span
                className={`text-[9px] font-black px-3 py-1.5 rounded-2xl border shadow-lg uppercase tracking-wider text-white ${
                  student.status === "ACTIVE"
                    ? "bg-emerald-500 border-emerald-400"
                    : student.status === "NEWSTUDENT"
                      ? "bg-amber-500 border-amber-400"
                      : student.status === "SUSPEND"
                        ? "bg-rose-500 border-rose-400"
                        : "bg-slate-500 border-slate-400"
                }`}
              >
                {student.status}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Main Content Area (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-6 pt-4 pb-8 space-y-8 no-scrollbar">
          {/* Identity */}
          <div className="text-center space-y-1">
            <h2 className="text-xl font-black text-slate-800 tracking-tight leading-tight">
              {student.fullName}
            </h2>
            <div className="flex items-center justify-center gap-2">
              <span className="h-px w-4 bg-cyan-200"></span>
              <p className="text-[10px] font-black text-cyan-600 uppercase tracking-[0.2em]">
                {student.nickname || "Siswa"}
              </p>
              <span className="h-px w-4 bg-cyan-200"></span>
            </div>
          </div>

          {/* Quick Stats: Sisa Sesi */}
          <div className="bg-gradient-to-br from-cyan-50 to-white border border-cyan-100 p-4 rounded-3xl flex flex-col gap-2 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white rounded-2xl text-cyan-500 shadow-sm">
                  <CreditCard size={18} />
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                    Sisa Sesi
                  </p>
                  <p className="text-base font-black text-slate-700">
                    {student.remainingSesi}
                  </p>
                </div>
              </div>
              <button
                onClick={copyToClipboard}
                className="p-2 bg-white rounded-xl border border-slate-100 text-slate-400 hover:text-cyan-500 transition-colors shadow-sm"
              >
                {copied ? (
                  <Check size={14} className="text-emerald-500" />
                ) : (
                  <Copy size={14} />
                )}
              </button>
            </div>
            {/* Mini Progress Bar */}
            <div className="w-full bg-slate-200/50 h-1.5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${Math.min((student.remainingSesi / (student.package?.sesiCredit || 12)) * 100, 100)}%`,
                }}
                className="h-full bg-cyan-500"
              />
            </div>
          </div>

          {/* QR Code Section */}
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="bg-white p-4 rounded-3xl shadow-sm ring-1 ring-slate-100">
              <QRCodeSVG
                value={publicUrl}
                size={140}
                level={"H"}
                includeMargin={false}
              />
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 text-slate-400 mb-1">
                <Award size={10} strokeWidth={3} className="text-fuchsia-500" />
                <p className="text-[9px] font-black uppercase tracking-[0.2em]">
                  Scan for Parent Access
                </p>
              </div>
              <p className="text-[10px] font-bold text-slate-500 font-mono tracking-tighter bg-white px-3 py-1 rounded-full shadow-sm border border-slate-100 inline-block">
                ID: {student.id}
              </p>
            </div>
          </div>

          {/* Detail List */}
          <div className="bg-white rounded-3xl border border-slate-100 p-2 space-y-1">
            {[
              {
                icon: <User size={14} className="text-fuchsia-500" />,
                label: "Orang Tua",
                value: student.parentName,
              },
              {
                icon: <MapPin size={14} className="text-cyan-500" />,
                label: "Lokasi",
                value: student.locationName,
              },
              {
                icon: <Award size={14} className="text-amber-500" />,
                label: "Paket",
                value: student.packageId.name || "Reguler",
              },
              {
                icon: <Award size={14} className="text-amber-500" />,
                label: "Kuota Sesi",
                value: student.remainingSesi || "Habis",
              },
              {
                icon: <Award size={14} className="text-amber-500" />,
                label: "Add On Sesi",
                value: student.addOnSesi || "-",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-slate-50 rounded-lg">
                    {item.icon}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {item.label}
                  </span>
                </div>
                <span className="text-xs font-black text-slate-700">
                  {item.value}
                </span>
              </div>
            ))}
          </div>

          {/* Footer Action */}
          <div className="flex gap-3 pt-2">
            {user?.role !== "TEACHER" && (
              <a
                href={`https://wa.me/${student.parentContact?.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-[2] bg-slate-900 text-white py-4 rounded-2xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 active:scale-95 transition-all shadow-xl shadow-slate-200"
              >
                <MessageCircle size={16} /> Hubungi Orang Tua
              </a>
            )}
            <button
              onClick={() => onEdit(student)}
              className="flex-1 bg-white border-2 border-slate-100 text-slate-600 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest active:bg-slate-50 transition-all hover:border-cyan-200"
            >
              Edit
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
