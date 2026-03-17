"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { 
  CheckCircle2, Clock, PackageOpen, Search, 
  Filter, LayoutGrid, Zap 
} from "lucide-react";
import { handleConfirm } from "@/app/actions/payments";
import { toast } from "sonner";

export default function PaymentTable({ initialData }: { initialData: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL, PENDING, SUCCESS
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [displayLimit, setDisplayLimit] = useState(15)

  // --- LOGIKA FILTERING ---
  const filteredData = useMemo(() => {
    return initialData.filter((payment) => {
      const searchTarget = `${payment.student.fullName} ${payment.student.nickname} ${payment.category}`.toLowerCase();
      const matchSearch = searchTarget.includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === "ALL" ? true : payment.status === statusFilter;
      const matchCategory = categoryFilter === "ALL" ? true : payment.category === categoryFilter;

      return matchSearch && matchStatus && matchCategory;
    });
  }, [searchTerm, statusFilter, categoryFilter, initialData]);

  // --- KONDISI JIKA TIDAK ADA DATA AWAL ---
  if (!initialData || initialData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 mt-6 bg-gradient-to-br from-cyan-50 to-fuchsia-50 rounded-2xl border border-dashed border-cyan-200">
        <div className="bg-white p-2 rounded-full shadow mb-2">
          <PackageOpen size={32} className="text-cyan-300" />
        </div>
        <h3 className="text-cyan-700 font-black uppercase tracking-tight text-sm">Belum Ada Pembayaran</h3>
        <p className="text-cyan-400 text-[10px] text-center mt-1">Silahkan klik tombol + untuk menginput data.</p>
      </div>
    );
  }

  return (
    <div className="w-full mt-2 max-w-3xl mx-auto px-1 space-y-4">
      
      {/* --- PANEL FILTER & SEARCH --- */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md p-3 rounded-2xl border border-cyan-100 shadow-sm space-y-3">
        {/* Search Bar */}
        <div className="relative group">
          <Search className="absolute left-3 top-2.5 text-slate-300 group-focus-within:text-cyan-500 transition-colors" size={14} />
          <input 
            type="text"
            placeholder="Cari siswa atau kategori..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border-none rounded-xl py-2 pl-9 pr-4 text-[11px] font-medium focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
          />
        </div>

        {/* Quick Tabs Status */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {['ALL', 'PENDING', 'SUCCESS'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                statusFilter === s 
                ? "bg-cyan-600 text-white shadow-md shadow-cyan-100" 
                : "bg-slate-100 text-slate-400 hover:bg-slate-200"
              }`}
            >
              {s === 'ALL' ? <LayoutGrid size={10} className="inline mr-1"/> : null}
              {s}
            </button>
          ))}
          
          <div className="h-4 w-[1px] bg-slate-200 mx-1" />
          
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-fuchsia-50 text-fuchsia-600 text-[9px] font-black uppercase tracking-widest px-2 py-1.5 rounded-lg border-none outline-none"
          >
            <option value="ALL">ALL CATEGORY</option>
            <option value="REGISTRATION">REGISTRATION</option>
            <option value="RENEWAL">RENEWAL</option>
            <option value="DEPOSIT">DEPOSIT</option>
          </select>
        </div>
      </div>

      {/* --- LIST DATA --- */}
      <div className="space-y-2 pb-20">
        {filteredData.map((payment) => (
          <div 
            key={payment.id} 
            className="bg-gradient-to-br from-white via-cyan-50 to-fuchsia-50 p-3 rounded-xl border border-cyan-100 shadow-sm relative overflow-hidden group hover:border-cyan-300 transition-all"
          >
            {/* Header Card */}
            <div className="flex justify-between items-start mb-1">
              <div className="flex-1">
                <div className="flex items-center gap-1 mb-0.5">
                  <span className="bg-cyan-100 text-cyan-700 text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                    {payment.category}
                  </span>
                  <span className="bg-fuchsia-100 text-fuchsia-700 text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                    {payment.method}
                  </span>
                </div>
                <h3 className="text-xs font-black text-slate-800 tracking-tight leading-none mb-0.5">
                  {payment.student.nickname || payment.student.fullName}
                </h3>
                <div className="flex items-center gap-1 text-slate-400">
                  <Clock size={9} />
                  <p className="text-[9px] font-medium">
                    {format(new Date(payment.createdAt), "dd MMM yyyy • HH:mm", { locale: id })}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-0.5 items-end">
                 <StatusBadge status={payment.status} />
                 {payment.notes && (
                   <span className="text-[7px] text-slate-400 font-bold uppercase truncate max-w-[80px]">
                     {payment.notes}
                   </span>
                 )}
              </div>
            </div>

            {/* Footer Card */}
            <div className="flex items-center justify-between border-t border-cyan-100 pt-2 mt-1">
              <div>
                <p className="text-[8px] text-cyan-500 uppercase font-black tracking-[0.15em]">Nominal</p>
                <p className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-600 to-cyan-700">
                  Rp {payment.amount.toLocaleString("id-ID")}
                </p>
                <p className={`text-[7px] font-bold uppercase tracking-widest mt-1 ${payment.createdById ? 'text-amber-400' : 'text-rose-400'}`}>
                  created by {payment.createdBy?.nickname || "System"}
                </p>
              </div>

              {payment.status === "PENDING" ? (
                <button 
                  onClick={async () => {
                    if(confirm(`Konfirmasi pembayaran ${payment.student.fullName}?`)) {
                      const res = await handleConfirm(payment.id);
                      if(res.success) toast.success(res.message);
                    }
                  }}
                  className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-md shadow-fuchsia-100 active:scale-95 transition-all"
                >
                  Confirm <CheckCircle2 size={11} />
                </button>
              ) : (
                <div className="text-right">
                  <div className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded-xl flex items-center gap-1 justify-end">
                    <div className="bg-emerald-500 rounded-full p-0.5">
                      <CheckCircle2 size={8} className="text-white" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest italic">Verified</span>
                  </div>
                  <p className="text-[7px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                    By {payment.verifiedBy?.nickname || payment.verifiedBy?.name || "Admin"}
                  </p>
                </div>
              )}
            </div>
            
            {/* Design Accessory */}
            {payment.category === "REGISTRATION" && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-fuchsia-500 to-cyan-400" />
            )}
          </div>
        ))}

        {filteredData.length === 0 && (
          <div className="text-center py-12 opacity-40">
            <Zap size={24} className="mx-auto mb-2 text-slate-300" />
            <p className="text-[10px] font-black uppercase tracking-widest">Data tidak ditemukan</p>
          </div>
        )}
        {/* Tombol Load More */}
        {filteredData.length > displayLimit && (
          <button 
            onClick={() => setDisplayLimit(prev => prev + 15)}
            className="w-full py-3 text-[10px] font-black uppercase tracking-widest text-cyan-600 bg-cyan-50 rounded-xl border border-dashed border-cyan-200 active:scale-95 transition-all"
          >
            Tampilkan Lebih Banyak ({filteredData.length - displayLimit} lagi)
          </button>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    SUCCESS: "bg-emerald-100 text-emerald-700 border-emerald-200",
    PENDING: "bg-amber-100 text-amber-700 border-amber-200",
    UNPAID: "bg-rose-100 text-rose-700 border-rose-200",
  };
  const currentStyle = styles[status as keyof typeof styles] || "bg-slate-100 text-slate-500 border-slate-200";
  return (
    <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border ${currentStyle}`}>
      {status}
    </span>
  );
}