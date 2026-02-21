"use client";

import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { AnimatePresence } from "framer-motion";
import { Download, Share2, Key, Copy, CheckCircle2, Lock,  } from "lucide-react";
import ResetPasswordModal from "./ResetPassword"; // Gunakan versi Modal yang kita buat sebelumnya

interface Props {
  user: {
    id: string; // Pastikan ID database ikut dikirim
    name: string;
    qrCodeId: string;
    email?: string;
  };
}

export default function GeneratorQR({ user }: Props) {
  const [showResetModal, setShowResetModal] = useState(false);

  const downloadQRCode = () => {
    const svg = document.getElementById("qr-gen");
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `QR-${user.name}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const copyPassword = () => {
    navigator.clipboard.writeText("rumahbimbels123");
    alert("Password default disalin!");
  };

  return (
    <div className="flex flex-col items-center p-8 bg-white rounded-[2.5rem] shadow-xl border border-slate-100 max-w-sm mx-auto relative">
      
      {/* SUCCESS BADGE */}
      <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full mb-6">
        <CheckCircle2 size={12} />
        <span className="text-[9px] font-black uppercase tracking-widest">Registrasi Berhasil</span>
      </div>

      <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">
        ID Kehadiran Digital
      </h2>
      
      {/* QR CODE CONTAINER */}
      <div className="p-6 bg-slate-50 rounded-[2rem] mb-6 border-4 border-white shadow-inner relative group">
        <QRCodeSVG 
          id="qr-gen"
          value={user.qrCodeId} 
          size={180}
          level="H"
          includeMargin={false}
        />
      </div>

      <div className="text-center mb-6">
        <p className="font-black text-slate-900 uppercase tracking-tighter text-lg leading-none">
          {user.name}
        </p>
        <p className="text-[8px] font-bold text-slate-400 mt-2 font-mono break-all px-4">
          ID: {user.qrCodeId}
        </p>
      </div>

      {/* LOGIN INFO BOX */}
      <div className="w-full bg-fuchsia-50/50 border border-fuchsia-100 rounded-2xl p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 bg-fuchsia-100 rounded-lg text-fuchsia-600">
            <Key size={12} />
          </div>
          <p className="text-[9px] font-black text-fuchsia-900 uppercase tracking-widest">Akses Login Staff</p>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center bg-white p-2 rounded-xl border border-fuchsia-50">
            <span className="text-[8px] font-bold text-slate-400 uppercase ml-1">Email</span>
            <span className="text-[10px] font-black text-slate-700">{user.email || "staff@modernlab.com"}</span>
          </div>
          <div className="flex justify-between items-center bg-white p-2 rounded-xl border border-fuchsia-50">
            <span className="text-[8px] font-bold text-slate-400 uppercase ml-1">Password</span>
            <button 
              onClick={copyPassword}
              className="flex items-center gap-1.5 hover:text-fuchsia-600 transition-colors"
            >
              <span className="text-[10px] font-black text-slate-700">rumahbimbels123</span>
              <Copy size={10} />
            </button>
          </div>
        </div>
      </div>

      {/* RESET PASSWORD BUTTON */}
      <button 
        onClick={() => setShowResetModal(true)}
        className="w-full flex items-center justify-center gap-2 p-4 mb-4 bg-slate-50 text-slate-500 rounded-2xl hover:bg-rose-50 hover:text-rose-600 transition-all border border-transparent hover:border-rose-100 group"
      >
        <Lock size={14} className="group-hover:animate-bounce" />
        <span className="text-[9px] font-black uppercase tracking-widest">Atur Password Kustom</span>
      </button>

      {/* ACTIONS */}
      <div className="flex gap-2 w-full">
        <button 
          onClick={downloadQRCode}
          className="flex-1 bg-slate-900 text-white py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-slate-200"
        >
          <Download size={16} />
          <span className="text-[9px] font-black uppercase tracking-widest">Unduh QR</span>
        </button>
        <button className="bg-slate-100 text-slate-600 px-5 rounded-2xl active:scale-95 border border-slate-200">
          <Share2 size={16} />
        </button>
      </div>

      {/* RESET PASSWORD MODAL OVERLAY */}
      <AnimatePresence>
        {showResetModal && (
          <ResetPasswordModal 
            userId={user.id} 
            userName={user.name} 
            onClose={() => setShowResetModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}