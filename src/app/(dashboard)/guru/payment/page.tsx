// src/app/admin/payment/page.tsx
import  prisma  from "@/lib/prisma";
import Link from "next/link";
import { MapPin, ChevronRight, Banknote } from "lucide-react";
import DashboardHeader from "@/components/dashboard/header";

export default async function SelectLocationPaymentPage() {
  // Ambil semua lokasi dari database
  const locations = await prisma.location.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { students: true } // Menghitung jumlah siswa per lokasi
      }
    }
  });
  

  return (
    <div className=" max-w-5xl mt-3mx-auto">
      <DashboardHeader title="Payments" />

      <div className="grid grid-cols-2  mt-2 gap-4 p-1">
        {locations.map((loc) => (
          <Link 
            key={loc.id} 
            href={`/admin/payment/${loc.id}`}
            className="group relative bg-gradient-to-br from-cyan-200 to-fuchsia-100 p-2 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-cyan-200 transition-all active:scale-[0.98]"
          >
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-fuchsia-500 p-3 rounded-2xl group-hover:bg-cyan-50 transition-colors">
                  <MapPin className="w-4 h-4 text-white group-hover:text-cyan-600" />
                </div>
                <ChevronRight className="w-5 h-5 text-slate-200 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
              </div>

              <div>
                <h3 className="text-md font-bold text-slate-800 group-hover:text-cyan-700 transition-colors">
                  {loc.name}
                </h3>
                
              </div>

              <div className="mt-2 pt-2 border-t border-slate-50 flex items-center justify-between">
                <span className="text-[8px] font-bold text-cyan-700 uppercase">Total Siswa</span>
                <span className="text-sm font-black text-slate-800 bg-fuchsia-100 px-3 py-1 rounded-full group-hover:bg-cyan-600 group-hover:text-white transition-colors">
                  {loc._count.students}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {locations.length === 0 && (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
          <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">
            Belum ada data lokasi tersedia.
          </p>
        </div>
      )}
    </div>
  );
}