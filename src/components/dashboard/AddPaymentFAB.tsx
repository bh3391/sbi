"use client";
import {
  Plus,
  X,
  Wallet,
  Calendar,
  User,
  FileText,
  Search,
  Banknote,
  Landmark,
} from "lucide-react";
import { useState, useMemo } from "react";
import { createManualPayment } from "@/app/actions/payments";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface Student {
  id: string;
  fullName: string;
  package?: {
    id: string;
    name: string;
    price: number;
  } | null;
  location?: {
    name: string;
  };
}

interface AddPaymentProps {
  locationId: string;
  students: Student[];
  currentUserId: string;
}

export default function AddPaymentFAB({
  locationId,
  students,
  currentUserId,
}: AddPaymentProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState(
    students[0]?.id || "",
  );
  const [amount, setAmount] = useState<number | string>("");
  const [category, setCategory] = useState("REGISTRATION");
  const [method, setMethod] = useState("TRANSFER"); // State untuk metode

  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  const filteredStudents = useMemo(() => {
    return students.filter((s) =>
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [students, searchTerm]);

  const getPackagePrice = (studentId: string) => {
    const student = students.find((s) => s.id === studentId);
    return student?.package?.price || 0;
  };

  const handleCategoryChange = (val: string) => {
    setCategory(val);
    if (val === "RENEWAL") {
      const price = getPackagePrice(selectedStudentId);
      setAmount(price);
    }
  };

  const handleStudentChange = (id: string) => {
    setSelectedStudentId(id);
    if (category === "RENEWAL") {
      const price = getPackagePrice(id);
      setAmount(price);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 bg-fuchsia-600 text-white p-1.5 rounded-full shadow-lg hover:scale-105 transition-all active:scale-95 z-40 border border-white/10 w-9 h-9 flex items-center justify-center"
      >
        <Plus size={18} strokeWidth={2.5} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />

            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative bg-white w-full mb-20 max-w-lg rounded-2xl overflow-hidden shadow-xl"
            >
              <div className="bg-gradient-to-r from-cyan-600 to-cyan-700 p-5 text-white relative">
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute right-3 top-3 bg-white/20 p-0.5 rounded-full hover:bg-white/40"
                >
                  <X size={14} />
                </button>
                <h2 className="text-sm font-black uppercase tracking-wider">
                  Input Pembayaran
                </h2>
                <p className="text-[9px] opacity-80">
                  Pilih metode CASH untuk aktivasi sesi instan
                </p>
              </div>

              <form
                action={async (formData) => {
                  formData.append("locationId", locationId);
                  formData.append("currentUserId", currentUserId);
                  formData.append("method", method); // Masukkan state method ke formData

                  toast.promise(createManualPayment(formData), {
                    loading: "Menyimpan data...",
                    success: (res) => {
                      if (res.success) {
                        setIsOpen(false);
                        setSearchTerm("");
                        setAmount("");
                        return "Pembayaran tercatat!";
                      }
                      throw new Error(res.message);
                    },
                    error: (err) => err.message,
                  });
                }}
                className="p-4 space-y-4 bg-slate-50"
              >
                {/* Search & Select Student */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold uppercase text-slate-400 ml-1 flex items-center gap-1">
                    <User size={10} /> Cari & Pilih Siswa
                  </label>
                  <div className="relative group">
                    <Search
                      className="absolute left-3 top-2.5 text-slate-300 group-focus-within:text-cyan-500 transition-colors"
                      size={12}
                    />
                    <input
                      type="text"
                      placeholder="Ketik nama untuk memfilter..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full p-2.5 pl-9 text-[11px] bg-white border-none rounded-t-xl ring-1 ring-slate-200 focus:ring-2 focus:ring-cyan-500 outline-none"
                    />
                    <select
                      name="studentId"
                      value={selectedStudentId}
                      onChange={(e) => handleStudentChange(e.target.value)}
                      className="w-full p-2.5 text-[11px] bg-white border-none rounded-b-xl ring-1 ring-slate-200 focus:ring-2 focus:ring-cyan-500 outline-none appearance-none border-t border-slate-100 font-medium"
                    >
                      {filteredStudents.length > 0 ? (
                        filteredStudents.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.fullName}
                          </option>
                        ))
                      ) : (
                        <option disabled>Siswa tidak ditemukan</option>
                      )}
                    </select>
                  </div>
                </div>

                {/* Method Selector (Segmented Control) */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold uppercase text-slate-400 ml-1">
                    Metode Pembayaran
                  </label>
                  <div className="grid grid-cols-2 p-1 bg-slate-200 rounded-xl gap-1">
                    <button
                      type="button"
                      onClick={() => setMethod("TRANSFER")}
                      className={`flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-bold transition-all ${method === "TRANSFER" ? "bg-white text-cyan-600 shadow-sm" : "text-slate-500 hover:bg-white/50"}`}
                    >
                      <Landmark size={12} /> TRANSFER
                    </button>
                    <button
                      type="button"
                      onClick={() => setMethod("CASH")}
                      className={`flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-bold transition-all ${method === "CASH" ? "bg-white text-green-600 shadow-sm" : "text-slate-500 hover:bg-white/50"}`}
                    >
                      <Banknote size={12} /> CASH
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-slate-400 ml-1">
                      Kategori
                    </label>
                    <select
                      name="category"
                      value={category}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      className="w-full p-2.5 bg-white rounded-xl ring-1 ring-slate-200 focus:ring-2 focus:ring-cyan-500 outline-none text-xs font-bold text-cyan-700"
                    >
                      <option value="REGISTRATION">REGISTRATION</option>
                      <option value="RENEWAL">RENEWAL</option>
                      <option value="REACTIVATION">REACTIVATION</option>
                      <option value="DEPOSIT">DEPOSIT</option>
                      <option value="OTHER">OTHER</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-slate-400 ml-1 flex items-center gap-1">
                      <Wallet size={10} /> Nominal
                    </label>
                    <input
                      name="amount"
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0"
                      className="w-full p-2.5 bg-white rounded-xl ring-1 ring-slate-200 focus:ring-2 focus:ring-fuchsia-500 outline-none font-bold text-fuchsia-600 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-slate-400 ml-1 flex items-center gap-1">
                      <Calendar size={10} /> Untuk Bulan
                    </label>
                    <select
                      name="month"
                      defaultValue={new Date().getMonth() + 1}
                      className="w-full p-2.5 bg-white rounded-xl ring-1 ring-slate-200 text-[11px] outline-none"
                    >
                      {months.map((m, i) => (
                        <option key={m} value={i + 1}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-slate-400 ml-1">
                      Tahun
                    </label>
                    <input
                      name="year"
                      type="number"
                      defaultValue={new Date().getFullYear()}
                      className="w-full p-2.5 bg-white rounded-xl ring-1 ring-slate-200 text-[11px] outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-slate-400 ml-1 flex items-center gap-1">
                    <FileText size={10} /> Keterangan Tambahan
                  </label>
                  <textarea
                    name="notes"
                    rows={2}
                    placeholder="Misal: Lunas via transfer bank..."
                    className="w-full p-2.5 bg-white rounded-xl ring-1 ring-slate-200 outline-none text-[11px]"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-fuchsia-600 to-fuchsia-700 text-white py-3 rounded-xl font-black uppercase tracking-widest shadow-lg active:scale-95 hover:brightness-110 transition-all text-[10px]"
                  >
                    Simpan & Kirim Notifikasi
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
