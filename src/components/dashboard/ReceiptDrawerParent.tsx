"use client";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Share2, ShieldCheck, Wallet } from "lucide-react";
import { useRef } from "react";
import { toPng } from "html-to-image";

export default function ReceiptDrawer({ payment, studentName, onClose }: any) {
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!payment) return null;

  const displayId = payment.id || `GRP-${new Date(payment.date).getTime()}`;
  const isDeposit = payment.method === "DEPOSIT";
  // Gunakan fallback 0 agar tidak muncul NaN atau error .toLocaleString()
  const totalAmount = payment.amount || 0;

  const handleDownload = async () => {
    if (!receiptRef.current) return;
    try {
      const dataUrl = await toPng(receiptRef.current, {
        cacheBust: true,
        backgroundColor: "#ffffff",
        style: { borderRadius: "0px" },
      });
      const link = document.createElement("a");
      link.download = `Kwitansi-${studentName.replace(/,/g, "")}-${displayId.slice(-4)}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Gagal mendownload kwitansi", err);
    }
  };

  const handleShare = async () => {
    if (!receiptRef.current) return;
    try {
      const dataUrl = await toPng(receiptRef.current, {
        backgroundColor: "#ffffff",
      });
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], "kwitansi.png", { type: "image/png" });

      if (navigator.share) {
        await navigator.share({
          files: [file],
          title: "Kwitansi Pembayaran",
          text: `Bukti pembayaran resmi - ${studentName}`,
        });
      }
    } catch (err) {
      console.error("Gagal share kwitansi", err);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-end justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="relative w-full max-w-md bg-slate-50 rounded-t-[40px] p-6 pb-10 shadow-2xl overflow-hidden"
        >
          <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6" />

          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-6">
            <div ref={receiptRef} className="bg-white p-8 relative">
              {/* Lubang Kertas Decor */}
              <div className="absolute -top-2 left-0 right-0 flex justify-around px-4">
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className="w-4 h-4 bg-slate-50 rounded-full border border-slate-100"
                  />
                ))}
              </div>

              {/* Header */}
              <div className="flex justify-between items-start mb-8 pt-4">
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    Official Receipt
                  </h4>
                  <p className="text-xl font-black text-slate-800 tracking-tighter">
                    Bimbel Pro
                  </p>
                  <div className="flex flex-col text-[10px] mt-1">
                    <span className="text-slate-400 font-bold uppercase">
                      No. Transaksi
                    </span>
                    <span className="text-slate-800 font-black">
                      #{displayId.slice(-8).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">
                    Tanggal
                  </span>
                  <p className="text-slate-800 font-black text-xs">
                    {new Date(
                      payment.date || payment.createdAt,
                    ).toLocaleDateString("id-ID", { dateStyle: "medium" })}
                  </p>
                </div>
              </div>

              {/* Watermark */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] -rotate-12">
                <h1 className="text-7xl font-black">PAID LUNAS</h1>
              </div>

              {/* Detail Transaksi (List Anak) */}
              <div className="space-y-4 border-t border-dashed border-slate-200 pt-6 mb-4">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em]">
                  Rincian Layanan
                </p>
                {payment.isGroup ? (
                  payment.items.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-start text-xs"
                    >
                      <div className="flex flex-col">
                        <span className="text-slate-800 font-black uppercase">
                          {item.student?.fullName || "Siswa"}
                        </span>
                        <span className="text-[9px] text-slate-400 font-bold">
                          Biaya Kursus / Paket Sesi
                        </span>
                      </div>
                      <span className="text-slate-800 font-black">
                        Rp {(Number(item.amount) || 0).toLocaleString("id-ID")}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-800 font-black uppercase">
                      {studentName}
                    </span>
                    <span className="text-slate-800 font-black">
                      Rp {(Number(payment.amount) || 0).toLocaleString("id-ID")}
                    </span>
                  </div>
                )}
              </div>

              {/* Perhitungan Pembayaran */}
              <div className="bg-slate-50 rounded-2xl p-4 space-y-2 mb-6 border border-slate-100">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-bold">Subtotal</span>
                  <span className="text-slate-800 font-black">
                    {/* Ini mengambil dari amount yang dikirim saat onClick */}
                    Rp {(Number(payment.amount) || 0).toLocaleString("id-ID")}
                  </span>
                </div>

                {/* Logic Potong Deposit tetap menggunakan payment.amount karena yang dipotong adalah biaya kursusnya */}
                {isDeposit && (
                  <div className="flex justify-between text-xs text-emerald-600">
                    <div className="flex items-center gap-1.5 font-bold uppercase text-[10px]">
                      <Wallet size={10} /> Potong Deposit
                    </div>
                    <span className="font-black">
                      - Rp{" "}
                      {(Number(payment.amount) || 0).toLocaleString("id-ID")}
                    </span>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-900 uppercase">
                    Total Bayar
                  </span>
                  <span className="text-xl font-black text-slate-900 tracking-tighter">
                    Rp {isDeposit ? "0" : totalAmount.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              {/* Footer / Keamanan */}
              <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                <ShieldCheck size={14} className="shrink-0" />
                <p className="text-[8px] font-bold uppercase leading-tight tracking-tight">
                  {isDeposit
                    ? "Pembayaran berhasil didebit dari saldo deposit keluarga."
                    : "Dokumen ini adalah bukti pembayaran sah yang dihasilkan secara digital."}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleDownload}
              className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              <Download size={16} /> Simpan PNG
            </button>
            <button
              onClick={handleShare}
              className="px-6 bg-white text-slate-600 border border-slate-200 py-4 rounded-2xl flex items-center justify-center active:scale-95 transition-transform shadow-sm"
            >
              <Share2 size={16} />
            </button>
            <button
              onClick={onClose}
              className="px-4 bg-slate-200 text-slate-500 py-4 rounded-2xl flex items-center justify-center active:scale-95 transition-transform"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
