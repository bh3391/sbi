import prisma from "@/lib/prisma";
import Link from "next/link";
import { Building2, ChevronRight, MapPin } from "lucide-react";

export default async function SelectLocationPage() {
  const locations = await prisma.location.findMany({
    include: { _count: { select: { rooms: true } } },
    orderBy: { name: "asc" }
  });

  return (
    <main className="p-6 bg-[#F8FAFC] min-h-screen">
      <header className="mb-8">
        <h1 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">Penjadwalan</h1>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Pilih Lokasi Operasional</p>
      </header>

      <div className="grid gap-4">
        {locations.map((loc) => (
          <Link key={loc.id} href={`/admin/jadwal/${loc.id}`}>
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 flex items-center justify-between group hover:border-fuchsia-400 hover:shadow-xl hover:shadow-fuchsia-50 transition-all active:scale-[0.98]">
              <div className="flex items-center gap-5">
                <div className="h-14 w-14 bg-slate-900 rounded-[1.5rem] flex items-center justify-center text-white group-hover:bg-fuchsia-600 transition-colors shadow-lg">
                  <Building2 size={24} />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 uppercase italic leading-none">{loc.name}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <MapPin size={10} className="text-slate-300" />
                    <p className="text-[9px] font-bold text-slate-400 uppercase">{loc.address || "Alamat belum diatur"}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-900">{loc._count.rooms}</p>
                  <p className="text-[8px] font-bold text-slate-400 uppercase">Ruangan</p>
                </div>
                <ChevronRight size={20} className="text-slate-200 group-hover:text-fuchsia-500 transition-colors" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}