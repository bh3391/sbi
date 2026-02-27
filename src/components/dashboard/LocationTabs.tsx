// components/inventory/LocationTabs.tsx
"use client"
import Link from "next/link";

export default function LocationTabs({ locations, activeLocationId }: any) {
  return (
    <div className="flex gap-2 pt-2 overflow-x-auto no-scrollbar pb-2">
      {locations.map((loc: any) => (
        <Link
          key={loc.id}
          href={`?locationId=${loc.id}`}
          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
            activeLocationId === loc.id
              ? "bg-cyan-600 text-white shadow-md"
              : "bg-slate-50 text-slate-500 hover:bg-slate-200"
          }`}
        >
          {loc.name}
        </Link>
      ))}
    </div>
  );
}