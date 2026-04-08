"use client";

import { useState, useEffect } from "react";
import {
  MessageCircle,
  Users,
  CheckCircle2,
  Clock,
  X,
  Loader2,
  Copy,
  Check,
  ChevronRight,
  Wallet,
  FileText,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { markAsPaid } from "@/app/actions/invoice";
import { sendFonneNotification } from "@/lib/fonnte";

export function ParentInvoiceCard({ parentData }: { parentData: any }) {
  const [showDetail, setShowDetail] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "TRANSFER">(
    "CASH",
  );
  const [isCopied, setIsCopied] = useState(false);

  // 1. STATE UNTUK SALDO DINAMIS (Konversi ke Number untuk keamanan)
  const [dynamicDeposit, setDynamicDeposit] = useState(
    Number(parentData.depositBalance || 0),
  );

  // Sinkronisasi jika data dari server (props) berubah
  useEffect(() => {
    setDynamicDeposit(Number(parentData.depositBalance || 0));
  }, [parentData.depositBalance]);

  // 2. HITUNG TOTAL GABUNGAN BERDASARKAN KOLOM AMOUNT
  const totalAmountGroup = parentData.items.reduce(
    (acc: number, inv: any) => acc + Number(inv.amount || 0),
    0,
  );

  const isAllPaid = parentData.items.every((inv: any) => inv.status === "PAID");
  const locationName = parentData.items[0]?.student?.location?.name || "Pusat";
  const parentContact = parentData.items[0]?.student?.parentContact || "";

  // Helper Notifikasi WA
  const notifySuccess = async (data: any, method: string) => {
    try {
      const msg = `*✅ PEMBAYARAN DITERIMA*\n\nHalo Ayah/Bunda,\nPembayaran *${data.studentName}* sejumlah Rp ${Number(data.amount).toLocaleString("id-ID")} via ${method} telah diterima. Sesi belajar telah ditambahkan ke sistem. 🙏✨`;
      await sendFonneNotification(data.parentContact, msg);
    } catch (error) {
      console.error("WhatsApp Notification Error:", error);
    }
  };

  // HANDLER: Bayar Satuan (Manual atau Deposit)
  const handlePay = async (invoiceId: string, customMethod?: string) => {
    const method = customMethod || paymentMethod;
    setLoadingAction(invoiceId);

    try {
      const res = await markAsPaid(invoiceId, method);

      if (res.success && res.data) {
        toast.success(`Pembayaran ${method} berhasil diproses`);

        // Update saldo deposit di UI tanpa reload
        if (res.data.newDepositBalance !== undefined) {
          setDynamicDeposit(Number(res.data.newDepositBalance));
        }

        await notifySuccess(res.data, method);
      } else {
        toast.error(res.error || "Gagal memproses pembayaran");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan koneksi");
    } finally {
      setLoadingAction(null);
    }
  };

  // HANDLER: Lunasi Semua
  const handleMarkAllPaid = async () => {
    const unpaidInvoices = parentData.items.filter(
      (inv: any) => inv.status === "UNPAID",
    );
    if (unpaidInvoices.length === 0)
      return toast.info("Semua invoice sudah lunas");

    if (
      !confirm(
        `Konfirmasi pelunasan ${unpaidInvoices.length} invoice via ${paymentMethod}?`,
      )
    )
      return;

    setLoadingAction("mark-all");
    try {
      for (const inv of unpaidInvoices) {
        const res = await markAsPaid(inv.id, paymentMethod);
        if (res.success && res.data) {
          if (res.data.newDepositBalance !== undefined) {
            setDynamicDeposit(Number(res.data.newDepositBalance));
          }
        }
      }
      toast.success(
        `Seluruh tagihan ${parentData.parentName} berhasil dilunasi`,
      );
      setShowDetail(false);
    } catch (err) {
      toast.error("Gagal memproses pembayaran massal");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/parent/invoice/${encodeURIComponent(parentData.parentId)}`;
    navigator.clipboard.writeText(link);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    toast.success("Link kuitansi disalin");
  };

  return (
    <>
      {/* TAMPILAN KARTU LUAR */}
      <motion.div
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowDetail(true)}
        className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm mb-4 cursor-pointer hover:shadow-md transition-all group"
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-4">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isAllPaid ? "bg-emerald-50 text-emerald-500" : "bg-slate-50 text-slate-400 group-hover:bg-cyan-50 group-hover:text-cyan-500"}`}
            >
              <Users size={18} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-tight">
                {parentData.parentName}
              </h4>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                <span className="text-[8px] bg-fuchsia-100 text-fuchsia-600 px-2 py-0.5 rounded-full font-black uppercase">
                  {parentData.items.length} Anak
                </span>
                <span className="text-[8px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-black uppercase flex items-center gap-1">
                  <Wallet size={8} /> Rp{" "}
                  {dynamicDeposit.toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          </div>
          <div className={isAllPaid ? "text-emerald-500" : "text-amber-500"}>
            {isAllPaid ? <CheckCircle2 size={16} /> : <Clock size={16} />}
          </div>
        </div>

        <div className="flex justify-between items-end border-t border-slate-50 pt-3">
          <div>
            <p className="text-[8px] font-bold text-slate-400 uppercase mb-0.5">
              Total Tagihan (Base Amount)
            </p>
            <p className="text-sm font-black text-slate-900">
              Rp {totalAmountGroup.toLocaleString("id-ID")}
            </p>
          </div>
          <div className="text-[10px] font-black text-cyan-600 uppercase flex items-center gap-1">
            Kelola <ChevronRight size={14} />
          </div>
        </div>
      </motion.div>

      {/* DRAWER PANEL */}
      <AnimatePresence>
        {showDetail && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDetail(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-slate-50 rounded-t-[40px] z-[110] max-h-[94vh] overflow-y-auto max-w-lg mx-auto pb-10 shadow-2xl"
            >
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mt-4 mb-8" />

              <div className="px-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-lg font-black text-slate-900 uppercase tracking-tighter">
                      {parentData.parentName}
                    </h2>
                    <p className="text-cyan-500 text-[10px] font-bold uppercase tracking-widest">
                      {locationName}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowDetail(false)}
                    className="p-2 bg-slate-200 rounded-full text-slate-500 hover:bg-red-500 hover:text-white transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* AREA SALDO DEPOSIT */}
                <div className="mb-6 p-5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[24px] text-white shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Wallet size={48} />
                  </div>
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-70 mb-1">
                    Saldo Deposit Keluarga
                  </p>
                  <h3 className="text-2xl font-black">
                    Rp {dynamicDeposit.toLocaleString("id-ID")}
                  </h3>
                </div>

                {/* PILIHAN METODE PEMBAYARAN */}
                <div className="mb-6 p-1 bg-slate-200/50 rounded-2xl flex gap-1">
                  {(["CASH", "TRANSFER"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setPaymentMethod(m)}
                      className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${paymentMethod === m ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
                    >
                      {m === "CASH" ? (
                        <Wallet size={12} />
                      ) : (
                        <FileText size={12} />
                      )}{" "}
                      {m}
                    </button>
                  ))}
                </div>

                {/* LIST TAGIHAN PER ANAK */}
                <div className="space-y-3 mb-8">
                  {parentData.items.map((inv: any) => (
                    <div
                      key={inv.id}
                      className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="font-bold text-slate-900 text-xs uppercase">
                            {inv.student.fullName}
                          </p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">
                            {inv.student.package?.name || "Paket Sesi"}
                          </p>
                        </div>
                        <div
                          className={`text-[8px] px-2 py-1 rounded-full font-black uppercase ${inv.status === "PAID" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}
                        >
                          {inv.status === "PAID" ? "Lunas" : "Outstanding"}
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-50 pt-4">
                        <div className="flex flex-col">
                          <span className="text-[8px] font-bold text-slate-400 uppercase">
                            Amount
                          </span>
                          <span className="font-black text-slate-900">
                            Rp {Number(inv.amount || 0).toLocaleString("id-ID")}
                          </span>
                        </div>

                        {inv.status === "UNPAID" && (
                          <div className="flex gap-2">
                            <button
                              disabled={
                                loadingAction !== null ||
                                dynamicDeposit < Number(inv.totalToPay)
                              }
                              onClick={() => handlePay(inv.id, "DEPOSIT")}
                              className="px-3 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[9px] font-black uppercase hover:bg-emerald-600 hover:text-white disabled:opacity-30 transition-all"
                            >
                              PAKAI DEPOSIT
                            </button>
                            <button
                              disabled={loadingAction !== null}
                              onClick={() => handlePay(inv.id)}
                              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase hover:bg-cyan-600 transition-all flex items-center justify-center min-w-[80px]"
                            >
                              {loadingAction === inv.id ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : (
                                "BAYAR"
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* TOTAL & ACTION */}
                <div className="bg-slate-900 rounded-[32px] p-6 text-white shadow-xl">
                  <p className="text-[9px] font-black uppercase tracking-[2px] opacity-70 mb-1">
                    Total Gabungan (Amount)
                  </p>
                  <h3 className="text-2xl font-black mb-6">
                    Rp {totalAmountGroup.toLocaleString("id-ID")}
                  </h3>

                  {!isAllPaid && (
                    <button
                      onClick={handleMarkAllPaid}
                      disabled={loadingAction !== null}
                      className="w-full mb-3 py-4 bg-cyan-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                      {loadingAction === "mark-all" ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        <CheckCircle2 size={16} />
                      )}
                      LUNASI SEMUA ({paymentMethod})
                    </button>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={handleCopyLink}
                      className="p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-colors"
                    >
                      {isCopied ? (
                        <Check size={18} className="text-emerald-400" />
                      ) : (
                        <Copy size={18} />
                      )}
                    </button>
                    <a
                      href={`https://wa.me/${parentContact.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 bg-emerald-500 hover:bg-emerald-400 py-4 rounded-2xl font-black uppercase text-[9px] tracking-widest flex items-center justify-center gap-2 transition-colors"
                    >
                      <MessageCircle size={16} fill="currentColor" /> WHATSAPP
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
