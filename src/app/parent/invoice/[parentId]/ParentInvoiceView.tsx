"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Receipt,
  Wallet,
  Calendar,
  User,
  CheckCircle2,
  ChevronRight,
  History,
  MapPin,
  ArrowLeft,
  MessageSquare,
} from "lucide-react";

import ReceiptDrawerParent from "@/components/dashboard/ReceiptDrawerParent";

export default function ParentInvoiceView({ data }: { data: any }) {
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  // Ambil deposit dari data (Pastikan dari server sudah mengirimkan field ini)
  const currentDeposit = data.depositBalance || 0;

  const unpaidInvoices = data.allInvoices.filter(
    (inv: any) => inv.status === "UNPAID",
  );
  const paidInvoices = data.allInvoices.filter(
    (inv: any) => inv.status === "PAID",
  );

  const groupedPaidInvoices = paidInvoices.reduce((acc: any, inv: any) => {
    const dateKey = new Date(inv.updatedAt).toISOString().split("T")[0];
    if (!acc[dateKey]) {
      acc[dateKey] = {
        date: dateKey,
        items: [],
        totalGroupAmount: 0, // Ini akan menampung total dari kolom amount
        method: inv.method || "CASH",
      };
    }
    acc[dateKey].items.push(inv);

    // GANTI DISINI: Gunakan inv.amount
    acc[dateKey].totalGroupAmount += Number(inv.amount || 0);

    return acc;
  }, {});

  const sortedGroupedInvoices = Object.values(groupedPaidInvoices).sort(
    (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return (
    <div className="min-h-screen max-w-md mx-auto bg-[#F8FAFC] pb-24 font-sans">
      {/* Header Section - Dark Premium */}
      <div className="bg-slate-900 text-white pt-16 pb-32 px-8 rounded-b-[60px] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[100px] rounded-full -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 blur-[60px] rounded-full -ml-10 -mb-10" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/10 rounded-full flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-100">
                Portal Keluarga
              </p>
            </div>

            {/* BADGE DEPOSIT DI ATAS */}
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-500/20 rounded-full">
              <Wallet size={10} className="text-emerald-400" />
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                Rp {currentDeposit.toLocaleString()}
              </p>
            </div>
          </div>

          <h1 className="text-3xl font-black uppercase tracking-tighter leading-[0.85] mb-4">
            {data.name}
          </h1>

          <div className="flex flex-wrap gap-4 items-center opacity-70">
            <div className="flex items-center gap-1.5">
              <MapPin size={12} className="text-cyan-400" />
              <p className="text-[10px] font-bold uppercase tracking-wider">
                {data.location || "Cabang Utama"}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar size={12} className="text-cyan-400" />
              <p className="text-[10px] font-bold uppercase tracking-wider">
                {new Date().toLocaleDateString("id-ID", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="px-6 -mt-16 space-y-6 relative z-20">
        {/* CARD BARU: SALDO DEPOSIT (Gaya Glassmorphism/Gradient) */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-[35px] shadow-lg shadow-emerald-200/50 text-white flex justify-between items-center"
        >
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-80 mb-1">
              Saldo Deposit Tersedia
            </p>
            <h2 className="text-2xl font-black tracking-tight">
              Rp {currentDeposit.toLocaleString()}
            </h2>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
            <Wallet size={24} />
          </div>
        </motion.div>

        {/* Card: Total Tagihan Outstanding */}
        {unpaidInvoices.length > 0 && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white p-8 rounded-[40px] shadow-xl shadow-slate-200/60 border border-slate-50"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
                  Tagihan Berjalan
                </p>
                <h2 className="text-3xl font-black text-slate-900 tracking-tighter">
                  Rp {data.unpaidTotal.toLocaleString()}
                </h2>
              </div>
              <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center animate-bounce-slow">
                <Receipt size={20} />
              </div>
            </div>

            <div className="space-y-3">
              {unpaidInvoices.map((inv: any) => (
                <div
                  key={inv.id}
                  className="flex justify-between items-center bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white text-slate-400 rounded-xl flex items-center justify-center shadow-sm">
                      <User size={14} strokeWidth={3} />
                    </div>
                    <p className="text-[11px] font-black text-slate-700 uppercase tracking-tight">
                      {inv.student.fullName}
                    </p>
                  </div>
                  <p className="text-xs font-black text-slate-900">
                    Rp {inv.totalToPay.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Section: Riwayat Pembayaran */}
        <section className="pt-4">
          <div className="flex items-center justify-between mb-5 px-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-slate-200 rounded-lg flex items-center justify-center">
                <History size={12} className="text-slate-600" />
              </div>
              <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
                Riwayat Kuitansi
              </h3>
            </div>
            <p className="text-[10px] font-bold text-slate-300 uppercase">
              {sortedGroupedInvoices.length} Transaksi
            </p>
          </div>

          <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
            {sortedGroupedInvoices.length === 0 ? (
              <div className="py-20 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Receipt size={24} className="text-slate-200" />
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Belum ada pembayaran lunas
                </p>
              </div>
            ) : (
              sortedGroupedInvoices.map((group: any, index: number) => (
                <motion.button
                  key={group.date}
                  whileTap={{ backgroundColor: "#F8FAFC" }}
                  onClick={() =>
                    setSelectedInvoice({
                      isGroup: true,
                      date: group.date,
                      items: group.items,
                      // Pastikan menggunakan totalGroupAmount dari hasil reduce di atas
                      amount: Number(group.totalGroupAmount),
                      // Kirimkan method agar kuitansi bisa menampilkan "Potong Deposit"
                      method: group.method,
                      category: "Pembayaran Gabungan",
                    })
                  }
                  className={`w-full p-6 flex items-center justify-between transition-colors text-left ${
                    index !== sortedGroupedInvoices.length - 1
                      ? "border-b border-slate-50"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-slate-50 text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 rounded-2xl flex items-center justify-center transition-colors">
                      <Receipt size={22} strokeWidth={2.5} />
                    </div>
                    <div>
                      <p className="text-[12px] font-black text-slate-800 uppercase tracking-tight leading-none mb-1.5 truncate max-w-[150px]">
                        {group.items
                          .map((it: any) => it.student.fullName)
                          .join(", ")}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md uppercase tracking-widest">
                          LUNAS
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                          {new Date(group.date).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-[13px] font-black text-slate-900 tracking-tight leading-none">
                        Rp {group.totalGroupAmount.toLocaleString()}
                      </p>
                      <ChevronRight
                        size={14}
                        className="text-slate-300 ml-auto mt-1"
                      />
                    </div>
                  </div>
                </motion.button>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Floating Action: Support */}
      <div className="fixed bottom-8 right-6 z-50">
        <a
          href={`https://wa.me/628123456789`}
          className="bg-slate-900 text-white p-4 rounded-full shadow-2xl shadow-slate-900/40 flex items-center justify-center hover:bg-emerald-500 transition-colors"
        >
          <MessageSquare size={24} fill="currentColor" />
        </a>
      </div>

      <AnimatePresence>
        {selectedInvoice && (
          <ReceiptDrawerParent
            payment={selectedInvoice}
            studentName={
              selectedInvoice.isGroup
                ? selectedInvoice.items
                    .map((it: any) => it.student.fullName)
                    .join(", ")
                : selectedInvoice.student.fullName
            }
            onClose={() => setSelectedInvoice(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
