"use client";

import { useState, useMemo } from "react";
import { Search, Plus, Inbox, RefreshCcw, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ParentInvoiceCard } from "@/components/dashboard/ParentInvoiceCard";
import DashboardHeader from "@/components/dashboard/header";
import { toast } from "sonner";

export default function InvoiceClientPage({
  initialData,
}: {
  initialData: any[];
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [search, setSearch] = useState("");

  const handleGenerate = async () => {
    // Konfirmasi krusial karena ini melibatkan 600+ data & pemotongan saldo
    const confirmGenerate = confirm(
      "Apakah Anda yakin ingin generate invoice & kirim WA ke seluruh orang tua? \n\nProses ini akan berjalan di background server agar tidak terputus.",
    );
    if (!confirmGenerate) return;

    setIsGenerating(true);
    setIsStarted(false);

    try {
      // Menggunakan Fetch ke Route Handler API (Background Process)
      const res = await fetch("/api/invoice/generate", {
        method: "POST",
      });

      const data = await res.json();

      if (data.success) {
        setIsStarted(true);
        toast.success(data.message, {
          duration: 8000,
          description: "Server sedang memproses pengiriman satu per satu.",
        });

        // Kembalikan status tombol setelah 5 detik agar UI tetap interaktif
        setTimeout(() => {
          setIsGenerating(false);
          setIsStarted(false);
        }, 5000);
      } else {
        toast.error(data.message || "Gagal menghubungi server.");
        setIsGenerating(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan sistem saat mencoba menghubungi API.");
      setIsGenerating(false);
    }
  };

  // Memoized filter untuk performa tinggi (Skala 600+ data)
  const filteredData = useMemo(() => {
    if (!search) return initialData;
    const s = search.toLowerCase();
    return initialData.filter(
      (d) =>
        d.parentName.toLowerCase().includes(s) ||
        d.items.some((item: any) =>
          item.student.fullName.toLowerCase().includes(s),
        ),
    );
  }, [initialData, search]);

  return (
    <div className="min-h-screen bg-cyan-50 pb-40">
      <DashboardHeader userId="admin" title="Invoices" />

      {/* SEARCH BAR - Sticky Minimalist */}
      <div className="sticky top-0 z-30 bg-cyan-50/80 backdrop-blur-xl border-b border-cyan-200 p-4 transition-all">
        <div className="relative max-w-2xl mx-auto">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400"
            size={16}
          />
          <input
            type="text"
            placeholder="Cari nama orang tua atau siswa..."
            className="w-full pl-11 pr-4 py-4 bg-white border border-cyan-100 rounded-[24px] text-[11px] uppercase tracking-wider outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-300 transition-all shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-fuchsia-500 uppercase tracking-widest"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="p-2 max-w-2xl mx-auto mt-4">
        <AnimatePresence mode="popLayout">
          {filteredData.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center py-32 text-center"
            >
              <div className="w-20 h-20 bg-white shadow-xl shadow-cyan-900/5 rounded-[32px] flex items-center justify-center mb-6">
                <Inbox size={32} className="text-cyan-200" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                Data Tidak Ditemukan
              </p>
              <p className="text-[9px] text-slate-300 mt-2 italic font-medium">
                Coba gunakan kata kunci lain
              </p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {filteredData.map((data, i) => (
                <motion.div
                  key={`${data.parentName}-${i}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <ParentInvoiceCard parentData={data} />
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* FLOATING ACTION BUTTON (FAB) */}
      <div className="fixed bottom-24 left-0 right-0 flex justify-center px-6 pointer-events-none z-50">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleGenerate}
          disabled={isGenerating}
          className={`
            pointer-events-auto
            w-full max-w-[320px] py-5 rounded-[28px] shadow-2xl flex items-center justify-center gap-3 transition-all duration-500
            ${
              isGenerating
                ? isStarted
                  ? "bg-emerald-500 text-white shadow-emerald-200"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-slate-900 text-white active:bg-cyan-600 shadow-slate-900/20"
            }
          `}
        >
          {isGenerating ? (
            <>
              {isStarted ? (
                <>
                  <CheckCircle2 size={18} className="animate-bounce" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                    Process Started
                  </span>
                </>
              ) : (
                <>
                  <RefreshCcw className="animate-spin" size={18} />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                    Contacting Server...
                  </span>
                </>
              )}
            </>
          ) : (
            <>
              <div className="bg-white/20 p-1.5 rounded-xl">
                <Plus size={18} strokeWidth={4} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                Generate Monthly Invoices
              </span>
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}
