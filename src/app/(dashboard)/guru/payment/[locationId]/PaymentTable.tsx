"use client";

import { format } from "date-fns";
import { id } from "date-fns/locale";
import { CheckCircle2, Clock, Banknote, CreditCard, PackageOpen, AlertCircle } from "lucide-react";
import { handleConfirm } from "@/app/actions/payments";
import { div } from "framer-motion/client";

export default function PaymentTable({ initialData }: { initialData: any[] }) {
  // --- KONDISI JIKA TIDAK ADA DATA ---
  if (!initialData || initialData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 mt-6 bg-gradient-to-br from-cyan-50 to-fuchsia-50 rounded-2xl border border-dashed border-cyan-200">
        <div className="bg-white p-2 rounded-full shadow mb-2">
          <PackageOpen size={32} className="text-cyan-300" />
        </div>
        <h3 className="text-cyan-700 font-black uppercase tracking-tight text-sm">Belum Ada Pembayaran</h3>
        <p className="text-cyan-400 text-[10px] text-center mt-1">Silahkan klik tombol + di pojok kanan <br/> bawah untuk menginput data.</p>
      </div>
    );
  }

  return (
    <div className="w-full mt-2 max-w-3xl mx-auto px-1">
      <div className="space-y-2 pb-16">
        {initialData.map((payment) => (
          <div 
            key={payment.id} 
            className="bg-gradient-to-br from-white via-cyan-50 to-fuchsia-50 p-3 rounded-xl border border-cyan-100 shadow-sm relative overflow-hidden"
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
                  {payment.student.nickname}
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
                   <span className="text-[7px] text-slate-400 font-bold uppercase truncate max-w-[60px]">
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
                {payment.createdById === null ? (
                <p className="text-[7px] text-rose-500 font-bold uppercase tracking-widest mt-1"> created by system </p>
              ) : (
                <p className="text-[7px] text-amber-400 font-bold uppercase tracking-widest mt-1">
                  created by {payment.createdBy?.nickname || "Admin"}
                </p>
                
              )}
              </div>
              {payment.status === "PENDING" ? (
                <button 
                  onClick={async () => {
                    if(confirm("Konfirmasi pembayaran ini?")) {
                      await handleConfirm(payment.id);
                    }
                  }}
                  className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-md shadow-fuchsia-100 active:scale-95 transition-all"
                >
                  Confirm <CheckCircle2 size={11} />
                </button>
              ) : (
                <div className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded-xl  items-center gap-1 transition-all">
                <div className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded-xl flex items-center gap-1 transition-all">
                  <div className="bg-emerald-500 rounded-full p-0.5">
                    <CheckCircle2 size={8} className="text-white" />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest italic">Verified</span><br/>
                  
                </div>
                <p className="text-[7px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                  Dikonfirmasi oleh {payment.verifiedBy?.name || "Admin"}
                </p>
                </div>
                
              )}
            </div>
            {/* Aksesoris Desain: Garis samping fuchsia jika kategori registrasi */}
            {payment.category === "REGISTRATION" && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-fuchsia-500 to-cyan-400" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Sub-komponen Badge Status
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