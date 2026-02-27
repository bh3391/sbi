import prisma from "@/lib/prisma";
import Link from "next/link";
import { Building2, ChevronRight, MapPin } from "lucide-react";
import DashboardHeader from "@/components/dashboard/header";

export default async function SelectLocationPage() {
  const locations = await prisma.location.findMany({
    include: { _count: { select: { rooms: true } } },
    orderBy: { name: "asc" }
  });

  return (
    <main className="p-2 bg-cyan-50 min-h-screen">
      <DashboardHeader title="Pilih Lokasi" />

      <div className="grid grid-cols-1 mt-4 gap-2">
        {locations.map((loc) => (
          <Link key={loc.id} href={`/admin/jadwal/${loc.id}`}>
            <div className="bg-gradient-to-br from-cyan-50 to-slate-50 p-2 rounded-2xl border border-cyan-300 flex items-center justify-between group hover:border-fuchsia-400 hover:shadow-xl hover:shadow-fuchsia-50 transition-all active:scale-[0.98]">
              <div className="flex items-center gap-5">
                <div className="h-8 w-8 bg-fuchsia-500 rounded-[1.5rem] flex items-center justify-center text-white group-hover:bg-fuchsia-600 transition-colors shadow-lg">
                  <Building2 size={12} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm leading-none">{loc.name}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <MapPin size={10} className="text-slate-800" />
                    <p className="text-[6px] italic text-slate-400 uppercase">{loc.address || "Alamat belum diatur"}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-900">{loc._count.rooms}</p>
                  <p className="text-[8px] font-bold text-slate-400 uppercase">Kelas</p>
                </div>
                <ChevronRight size={20} className="text-slate-800 group-hover:text-fuchsia-500 transition-colors" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}