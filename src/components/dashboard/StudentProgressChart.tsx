"use client";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from "recharts";

export default function StudentProgressChart({ attendances }: { attendances: any[] }) {
  // 1. Map skor huruf ke angka
  const scoreMap: Record<string, number> = {
    "A+": 4.3, "A": 4.0, "A-": 3.7,
    "B+": 3.3, "B": 3.0, "B-": 2.7,
    "C+": 2.3, "C": 2.0, "D": 1.0,
    "E": 0
  };

  // 2. Olah data (ambil 7-10 pertemuan terakhir saja)
  const data = [...attendances].reverse().map((atd) => ({
    tanggal: new Date(atd.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
    skorAngka: scoreMap[atd.score] || 0,
    skorHuruf: atd.score,
    materi: atd.materi || "Materi Umum"
  }));

  return (
    <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Grafik Perkembangan</h3>
          <p className="text-[9px] text-fuchsia-500 font-bold italic">Berdasarkan skor pertemuan terakhir</p>
        </div>
      </div>

      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%" aspect={2}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d946ef" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#d946ef" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="tanggal" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 9, fontWeight: 'bold', fill: '#94a3b8' }} 
            />
            <YAxis hide domain={[0, 4.5]} />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-xl border border-white/10">
                      <p className="text-[10px] font-black uppercase opacity-60 mb-1">{payload[0].payload.tanggal}</p>
                      <p className="text-sm font-black text-fuchsia-400">Nilai: {payload[0].payload.skorHuruf}</p>
                      <p className="text-[9px] font-medium leading-tight mt-1">{payload[0].payload.materi}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area 
              type="monotone" 
              dataKey="skorAngka" 
              stroke="#d946ef" 
              strokeWidth={4}
              fillOpacity={1} 
              fill="url(#colorScore)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      {/* Legend Skor */}
      <div className="mt-4 flex justify-between px-2">
        <div className="text-center">
            <p className="text-[8px] font-black text-slate-400 uppercase">Terendah</p>
            <p className="text-[10px] font-black text-slate-700 uppercase">C / D</p>
        </div>
        <div className="text-center">
            <p className="text-[8px] font-black text-slate-400 uppercase">Target</p>
            <p className="text-[10px] font-black text-fuchsia-600 uppercase italic">Grade A</p>
        </div>
      </div>
    </div>
  );
}