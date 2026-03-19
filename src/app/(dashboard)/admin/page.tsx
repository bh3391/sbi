import React from "react";
import { auth } from "@/lib/auth";
import Link from "next/link";
import DashboardHeader from "@/components/dashboard/header";
import {
  Users,
  MapPin,
  ChevronRight,
  Calendar,
  Clock,
  ArrowRight,
  HatGlasses,
  CurrencyIcon,
  ArchiveIcon,
  Settings2Icon,
  ChartAreaIcon,
} from "lucide-react";
import { redirect } from "next/navigation";

export default async function GuruDashboard() {
  const session = await auth();
  const userId = session?.user?.id || "";
  if (session?.user?.role !== "ADMIN") redirect("/guru");

  const menus = [
    {
      title: "Absen Siswa",
      desc: "Input kehadiran",
      icon: <Users size={20} strokeWidth={2.5} />,
      color: "from-cyan-500 to-blue-600",
      link: "/admin/absensi-siswa",
    },
    {
      title: "Absen Guru",
      desc: "Check-in lokasi",
      icon: <MapPin size={20} strokeWidth={2.5} />,
      color: "from-emerald-500 to-teal-600",
      link: "/admin/absensi",
    },
    {
      title: "Jadwal",
      desc: "Calendar view",
      icon: <Calendar size={20} strokeWidth={2.5} />,
      color: "from-orange-400 to-pink-500",
      link: "/admin/jadwal",
    },
    {
      title: "Sesi Saya",
      desc: "List bimbingan",
      icon: <Clock size={20} strokeWidth={2.5} />,
      color: "from-violet-500 to-purple-600",
      link: "/admin/sesi",
    },
    {
      title: "Data Siswa",
      desc: "List siswa",
      icon: <Users size={20} strokeWidth={2.5} />,
      color: "from-rose-500 to-pink-600",
      link: "/admin/data-siswa",
    },
    {
      title: "Data Guru",
      desc: "List Guru",
      icon: <HatGlasses size={20} strokeWidth={2.5} />,
      color: "from-indigo-500 to-pink-200",
      link: "/admin/data-guru",
    },
    {
      title: "Payment",
      desc: "List Pembayaran",
      icon: <CurrencyIcon size={20} strokeWidth={2.5} />,
      color: "from-amber-500 to-yellow-200",
      link: "/admin/payment",
    },
    {
      title: "Inventory",
      desc: "List Inventaris",
      icon: <ArchiveIcon size={20} strokeWidth={2.5} />,
      color: "from-sky-500 to-yellow-200",
      link: "/admin/inventory",
    },
    {
      title: "Invoice",
      desc: "Laporan & Statistik",
      icon: <ChartAreaIcon size={20} strokeWidth={2.5} />,
      color: "from-violet-500 to-sky-200",
      link: "/admin/invoice",
    },
    {
      title: "Management",
      desc: "Setup & Config",
      icon: <Settings2Icon size={20} strokeWidth={2.5} />,
      color: "from-amber-500 to-rose-200",
      link: "/admin/manager",
    },
  ];

  return (
    <div className="space-y-6 px-1 ">
      {/* Header Section - Micro Typography */}
      <DashboardHeader userId={userId} title="Beranda" />

      <div className="flex items-center justify-between px-1">
        <div>
          <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] mb-0.5">
            Teacher Dashboard
          </p>
          <h1 className="text-xl font-black text-slate-800 tracking-tighter">
            Hi,{" "}
            <span className="text-cyan-600">
              {session?.user?.name?.split(" ")[0] || "Guru"}!
            </span>
          </h1>
        </div>
        <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center border border-slate-100">
          <span className="text-lg">✨</span>
        </div>
      </div>

      {/* Grid Menu - Ultra Compact Cards */}
      <div className="grid grid-cols-3 gap-2 px-2">
        {menus.map((menu, i) => (
          <Link
            href={menu.link}
            key={i}
            className="group relative p-1 h-20 bg-white/80 backdrop-blur-xl border border-white/20 rounded-xl gap-1 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all active:scale-95 flex flex-col items-center justify-center overflow-hidden"
          >
            {/* Ikon kecil di pojok atas */}
            <div
              className={`pb-1 h-10 w-10 rounded-2xl bg-gradient-to-br ${menu.color} flex items-center justify-center text-white shadow-lg shadow-inherit/20`}
            >
              {React.cloneElement(menu.icon as React.ReactElement)}
            </div>

            {/* Teks di bawah ala Widget */}
            <div>
              <h3 className="font-bold text-slate-900 text-xs tracking-tight">
                {menu.title}
              </h3>
              <p className="text-[8px] font-medium text-slate-400">
                {menu.desc}
              </p>
            </div>

            {/* Subtle Arrow Decor */}
          </Link>
        ))}
      </div>

      {/* Mini Activity Card - Cyan Accent */}
    </div>
  );
}
