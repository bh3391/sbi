"use client";

import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { Download, Share2 } from "lucide-react";

interface Props {
  user: {
    name: string;
    qrCodeId: string;
  };
}

export default function GeneratorQR({ user }: Props) {
  
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

  return (
    <div className="flex flex-col items-center p-10 bg-white rounded-[2.5rem] shadow-xl border border-slate-100">
      <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">
        ID Kehadiran Digital
      </h2>
      
      {/* QR CODE CONTAINER */}
      <div className="p-6 bg-slate-50 rounded-[2rem] mb-6 border-4 border-white shadow-inner">
        <QRCodeSVG 
          id="qr-gen"
          value={user.qrCodeId} 
          size={200}
          level="H" // High error correction
          includeMargin={false}
          imageSettings={{
            src: "/logo-icon.png", // Opsional: Logo kecil di tengah QR
            x: undefined,
            y: undefined,
            height: 40,
            width: 40,
            excavate: true,
          }}
        />
      </div>

      <div className="text-center mb-8">
        <p className="font-black text-slate-900 uppercase tracking-tighter text-lg leading-none">
          {user.name}
        </p>
        <p className="text-[8px] font-bold text-slate-400 mt-2 font-mono">
          ID: {user.qrCodeId}
        </p>
      </div>

      {/* ACTIONS */}
      <div className="flex gap-2 w-full">
        <button 
          onClick={downloadQRCode}
          className="flex-1 bg-slate-900 text-white py-3 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <Download size={16} />
          <span className="text-[9px] font-black uppercase tracking-widest">Simpan</span>
        </button>
        <button className="bg-slate-100 text-slate-600 px-4 rounded-xl active:scale-95">
          <Share2 size={16} />
        </button>
      </div>
    </div>
  );
}