import React from "react";
import { auth } from "@/lib/auth";
import Link from "next/link";
import DashboardHeader from "@/components/dashboard/header";
import { Users, MapPin, Calendar, Clock, ArrowRight, HatGlasses, CurrencyIcon } from "lucide-react";

export default async function GuruDashboard() {
  const session = await auth();

  const menus = [
    {
      title: "Absensi Siswa",
      desc: "Input kehadiran",
      icon: <Users size={20} strokeWidth={2.5} />,
      color: "from-cyan-500 to-blue-600",
      link: "/admin/absensi-siswa"
    },
    {
      title: "Absensi Guru",
      desc: "Check-in lokasi",
      icon: <MapPin size={20} strokeWidth={2.5} />,
      color: "from-emerald-500 to-teal-600",
      link: "/admin/absensi"
    },
    {
      title: "Jadwal",
      desc: "Calendar view",
      icon: <Calendar size={20} strokeWidth={2.5} />,
      color: "from-orange-400 to-pink-500",
      link: "/admin/jadwal"
    },
    {
      title: "Sesi Saya",
      desc: "List bimbingan",
      icon: <Clock size={20} strokeWidth={2.5} />,
      color: "from-violet-500 to-purple-600",
      link: "/admin/sesi"
    },
    {
      title: "Data Siswa",
      desc: "List siswa",
      icon: <Users size={20} strokeWidth={2.5} />,
      color: "from-rose-500 to-pink-600",
      link: "/admin/data-siswa"
    },
    {
      title: "Data Guru",
      desc: "List Guru",
      icon: <HatGlasses size={20} strokeWidth={2.5} />,
      color: "from-indigo-500 to-pink-200",
      link: "/admin/data-guru"
    },
    {
      title: "Payment",
      desc: "List Pembayaran",
      icon: <CurrencyIcon size={20} strokeWidth={2.5} />,
      color: "from-amber-500 to-yellow-200",
      link: "/admin/payment"
    },
  ];

  return (
    <div className="space-y-6 px-1 bg-cyan-50">
      {/* Header Section - Micro Typography */}
      <DashboardHeader title="Beranda" />
      
      <div className="flex items-center justify-between px-1">
        <div>
          <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] mb-0.5">
            Teacher Dashboard
          </p>
          <h1 className="text-xl font-black text-slate-800 tracking-tighter">
            Hi, <span className="text-cyan-600">{session?.user?.name?.split(' ')[0] || "Guru"}!</span>
          </h1>
        </div>
        <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center border border-slate-100">
           <span className="text-lg">✨</span>
        </div>
      </div>

      {/* Grid Menu - Ultra Compact Cards */}
      <div className="grid grid-cols-2 gap-3">
        {menus.map((menu, i) => (
          <Link
            href={menu.link}
            key={i}
            className="group relative flex flex-col p-4 bg-white bg-gradient-to-br from-cyan-100 via-white to-fuchsia-100 border border-slate-100 rounded-2xl shadow-sm hover:border-cyan-200 transition-all active:scale-95 overflow-hidden"
          >
            {/* Soft Background Gradient Decor */}
            <div className={`absolute -right-2 -top-2 h-12 w-12 bg-gradient-to-br ${menu.color} opacity-[0.03] rounded-full blur-lg group-hover:opacity-10 transition-opacity`} />
            
            <div className={`h-9 w-9 rounded-lg bg-gradient-to-br ${menu.color} flex items-center justify-center shadow-md shadow-slate-200 mb-3 text-white`}>
                {menu.icon}
            </div>
            
            <h3 className="font-black text-slate-800 text-[11px] uppercase tracking-tight mb-0.5">
                {menu.title}
            </h3>
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wide">
                {menu.desc}
            </p>
          </Link>
        ))}
      </div>

      {/* Mini Activity Card - Cyan Accent */}
      </div>
  );
}