"use client"
import { motion, AnimatePresence } from "framer-motion";
import { X, Receipt, Check, Download, Share2 } from "lucide-react";
import { useRef } from "react";
 import { toPng } from "html-to-image";
import download from "downloadjs";

export default function ReceiptDrawer({ payment, studentName, onClose }: any) {
  
  const receiptRef = useRef<HTMLDivElement>(null);
  const handleDownload = async () => {
  if (!receiptRef.current) return;
  try {
    const dataUrl = await toPng(receiptRef.current, { cacheBust: true });
    
    // Cara manual tanpa library downloadjs
    const link = document.createElement('a');
    link.download = `Kwitansi-${studentName}.png`;
    link.href = dataUrl;
    link.click();
    
  } catch (err) {
    console.error("Gagal mendownload kwitansi", err);
  }
};

  const handleShare = async () => {
    if (!receiptRef.current) return;
    try {
      const dataUrl = await toPng(receiptRef.current);
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], "kwitansi.png", { type: "image/png" });

      if (navigator.share) {
        await navigator.share({
          files: [file],
          title: 'Kwitansi Pembayaran',
          text: `Bukti pembayaran ${payment.category} - ${studentName}`,
        });
      } else {
        alert("Fitur share tidak didukung di browser ini, silakan gunakan tombol download.");
      }
    } catch (err) {
      console.error("Gagal share kwitansi", err);
    }
  };

  if (!payment) return null;
 

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-end justify-center">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
          className="relative mx-1 bg-white border border-slate-200 ring-4 ring-fuchsia-200 min-h-[400px] max-w-md rounded-t-[40px] p-8 shadow-2xl"
        >
          {/* Dekorasi Lubang Kertas Struk */}
          <div ref={receiptRef} className="bg-white p-4">
          <div  className="absolute -top-2 left-0 right-0 flex justify-around px-8">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="w-4 h-4 bg-slate-800 rounded-full" />
            ))}
          </div>

          <div className="flex justify-between items-start mb-8">
            <div className="bg-emerald-100 p-3 rounded-2xl text-emerald-600">
              <Receipt size={24} />
            </div>
            <div>
                <img src="/logo-header.png" alt="Logo Bimbel Pro" className="w-16 h-16 object-contain" />
            </div>
            <button onClick={onClose} className="bg-slate-100 p-2 rounded-full text-slate-400">
              <X size={20} />
            </button>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Kuitansi Digital</h2>
            <p className={`text-2xl font-black italic uppercase tracking-tight ${
                payment.status === 'SUCCESS' ? 'text-emerald-600' : 'text-amber-500'
            }`}>
                {payment.status === 'SUCCESS' ? 'Terbayar Lunas' : 'Menunggu Konfirmasi'}
            </p>
            
            <p className="text-[10px] text-slate-400 font-bold mt-1">
                NO. REF: {payment.id.slice(-8).toUpperCase()}
            </p>
          </div>

          {/* Detail Transaksi */}
          <div className="space-y-4 border-y border-dashed border-slate-200 py-6 mb-8">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400 font-bold uppercase">Nama Siswa</span>
              <span className="text-slate-800 font-black uppercase text-right">{studentName}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400 font-bold uppercase">Kategori</span>
              <span className="text-slate-800 font-black uppercase">{payment.category}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400 font-bold uppercase">Tanggal</span>
              <span className="text-slate-800 font-black tracking-tighter">
                {new Date(payment.createdAt).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}
              </span>
            </div>
            <div className="flex justify-between items-center pt-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Bayar</span>
              <span className="text-xl font-black text-emerald-600">Rp {payment.amount.toLocaleString('id-ID')}</span>
            </div>
         
          <div className="flex justify-between text-xs">
              <span className="text-slate-400 font-bold uppercase">Catatan</span>
              <span className="text-slate-800 font-black tracking-tighter">
                {payment.notes || "-"}
              </span>
           </div>
            </div>

          <div className="bg-emerald-50 p-4 rounded-2xl flex items-start gap-3 border border-emerald-100 mb-8">
            <div className="bg-emerald-500 text-white p-1 rounded-full"><Check size={12} /></div>
            <p className="text-[10px] text-emerald-700 font-bold leading-relaxed uppercase tracking-tight">
              Pembayaran ini telah terverifikasi secara sah oleh sistem manajemen Bimbel Pro.
            </p>
          </div>
          </div>
          

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button onClick={handleDownload} className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
              <Download size={14} /> Simpan PNG
            </button>
            <button onClick={handleShare} className="flex-[0.5] bg-slate-100 text-slate-600 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
              <Share2 size={14} />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}