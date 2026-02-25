"use client";

import { useState } from "react";
import { Plus, X, Package, Hash, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { createInventoryItem } from "@/app/actions/inventory";

interface AddInventoryFABProps {
  locationId: string;
  currentUserId: string;
}

export default function AddInventoryFAB({ locationId, currentUserId }: AddInventoryFABProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 bg-fuchsia-600 text-white p-2 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all z-40 border border-white/10"
      >
        <Plus size={24} strokeWidth={3} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              className="relative bottom-24 bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl"
            >
              {/* Header */}
              <div className="bg-fuchsia-500 p-6 text-white">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold uppercase tracking-tight">Barang Baru</h2>
                  <button onClick={() => setIsOpen(false)} className="bg-white/10 p-1 rounded-full">
                    <X size={18} />
                  </button>
                </div>
                <p className="text-slate-50 text-[10px] uppercase font-bold mt-1 tracking-widest">
                  Daftarkan aset/stok ke lokasi ini
                </p>
              </div>

              {/* Form */}
              <form
                action={async (formData) => {
                  formData.append("locationId", locationId);
                  formData.append("currentUserId", currentUserId);

                  toast.promise(createInventoryItem(formData), {
                    loading: "Mendaftarkan barang...",
                    success: (res) => {
                      if (res.success) {
                        setIsOpen(false);
                        return res.message;
                      }
                      throw new Error(res.message);
                    },
                    error: (err) => err.message,
                  });
                }}
                className="p-6 space-y-4 bg-white"
              >
                {/* Input Nama Barang */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2">
                    <Package size={12} /> Nama Barang
                  </label>
                  <input
                    name="name"
                    required
                    placeholder="Contoh: Buku Modul Level 1"
                    className="w-full p-3 bg-slate-50 rounded-xl border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-slate-900 outline-none text-sm font-semibold transition-all"
                  />
                </div>

                {/* Input Stok Awal */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2">
                    <Hash size={12} /> Stok Awal
                  </label>
                  <input
                    name="stock"
                    type="number"
                    required
                    defaultValue={0}
                    className="w-full p-3 bg-slate-50 rounded-xl border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-slate-900 outline-none text-sm font-bold"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-cyan-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg active:scale-95 transition-all mt-2"
                >
                  Simpan Barang
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}