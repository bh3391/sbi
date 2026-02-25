// components/InventoryList.tsx
"use client"
import { updateStock } from "@/app/actions/inventory";
import { toast } from "sonner";
import { Plus, Minus, Package, History } from "lucide-react";
import { useState } from "react";
import InventoryLogDrawer from "@/components/dashboard/InventoryLogDrawer";

export default function InventoryList({ items, currentUserId }: any) {

  const [selectedItem, setSelectedItem] = useState<any>(null);
  

  const handleAdjust = async (id: string, type: "IN" | "OUT", name: string) => {
  // 1. Prompt pertama: Jumlah
        const qty = prompt(`Masukkan jumlah ${type === "IN" ? 'masuk' : 'keluar'} untuk ${name}:`);
        
        // Validasi: Jika batal (cancel) atau bukan angka, hentikan proses
        if (qty === null || qty === "" || isNaN(parseInt(qty))) return;

        // 2. Prompt kedua: Alasan (Hanya muncul setelah jumlah valid diisi)
        const reason = prompt("Keterangan/Alasan (opsional):") || "";

        // 3. Siapkan Data
        const formData = new FormData();
        formData.append("inventoryId", id);
        formData.append("quantity", qty);
        formData.append("type", type);
        formData.append("notes", reason);
        formData.append("currentUserId", currentUserId);

        // 4. Eksekusi
        toast.promise(updateStock(formData), {
            loading: "Memproses stok...",
            success: (res) => {
            if (res.success) return res.message;
            throw new Error(res.message);
            },
            error: (err) => err.message,
        });
        };

  return (
    <div className="divide-y divide-slate-100 bg-fuchsia-50 rounded-xl shadow border border-slate-100 overflow-hidden">
      {items.map((item: any) => (
        <div key={item.id} className="p-2 flex items-center justify-between active:bg-cyan-50 transition-colors"
        onClick={() => setSelectedItem(item)}>
          <div className="flex items-center gap-2">
            <div className="bg-fuchsia-100 p-1 rounded-lg text-fuchsia-600">
              <Package size={16} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800 leading-tight">{item.name}</h3>
              <p className="text-[9px] text-slate-400 uppercase font-bold flex items-center gap-1">
                  <History size={10} /> Tap untuk riwayat
                </p>
              <p className="text-[8px] text-slate-400 italic font-medium leading-none">
                update by: {item.logs[0]?.createdBy?.name || "System"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <div className="text-right">
              <span className={`text-base font-black ${item.stock < 5 ? 'text-red-500' : 'text-slate-700'}`}>
                {item.stock}
              </span>
              <p className="text-[7px] text-slate-400 uppercase font-bold tracking-tighter">Unit</p>
            </div>
            <div className="flex gap-0.5">
              <button 
                onClick={() => handleAdjust(item.id, "OUT", item.name)}
                className="p-1.5 bg-slate-100 text-slate-600 rounded-md active:scale-95 transition-transform"
                aria-label="Kurangi stok"
              >
                <Minus size={13} />
              </button>
              <button 
                onClick={() => handleAdjust(item.id, "IN", item.name)}
                className="p-1.5 bg-fuchsia-600 text-white rounded-md active:scale-95 transition-transform shadow-md shadow-fuchsia-200"
                aria-label="Tambah stok"
              >
                <Plus size={13} />
              </button>
            </div>
          </div>
        </div>
      ))}
      <InventoryLogDrawer 
        item={selectedItem} 
        onClose={() => setSelectedItem(null)} 
      />
    </div>
  );
}