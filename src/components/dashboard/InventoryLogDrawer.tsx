"use client"
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowUpRight, ArrowDownLeft, Clock, User } from "lucide-react";

export default function InventoryLogDrawer({ item, onClose }: any) {
  if (!item) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end justify-center">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        />

        {/* Drawer Content */}
        <motion.div 
          initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="relative top-10 bg-white/80 w-full max-w-md rounded-t-[32px] shadow-2xl overflow-hidden flex flex-col min-h-screen"
        >
          {/* Handle bar for visual */}
          <div className="w-12 h-1.5 bg-fuchsia-500 rounded-full mx-auto mt-3 mb-1" />

          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-black text-slate-800">{item.name}</h2>
                <p className="text-xs text-slate-500">Riwayat Perubahan Stok</p>
              </div>
              <button onClick={onClose} className="bg-fuchsia-500 p-2 rounded-full text-white"><X size={20}/></button>
            </div>

            {/* Scrollable Log List */}
            <div className="space-y-2 overflow-y-auto pr-2 custom-scrollbar">
              {item.logs?.length > 0 ? (
                item.logs.map((log: any) => (
                  <div key={log.id} className="flex gap-4 items-start border-b border-slate-50 pb-2">
                    <div className={`p-2 rounded-lg ${log.type === 'IN' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                      {log.type === 'IN' ? <ArrowUpRight size={18}/> : <ArrowDownLeft size={18}/>}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-sm text-slate-700">
                          {log.type === 'IN' ? 'Stok Masuk' : 'Stok Keluar'}
                        </span>
                        <span className={`font-black ${log.type === 'IN' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {log.type === 'IN' ? '+' : '-'}{log.quantity}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                        <span className="flex items-center gap-1"><User size={10}/> {log.createdBy?.name || 'System'}</span>
                        <span className="flex items-center gap-1"><Clock size={10}/> {new Date(log.createdAt).toLocaleString('id-ID')}</span>
                      </div>
                      {log.notes && (
                        <p className="mt-2 text-[11px] bg-slate-50 p-2 rounded-lg text-slate-600 italic">
                          "{log.notes}"
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-slate-400 py-10 text-sm italic">Belum ada riwayat transaksi.</p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}