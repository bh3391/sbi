import  prisma  from "@/lib/prisma";
import { auth } from "@/lib/auth";
import InventoryList from "@/components/dashboard/InventoryList";
import AddInventoryFAB from "@/components/dashboard/AddInventoryFAB";
import LocationTabs from "@/components/dashboard/LocationTabs";
import DashboardHeader from "@/components/dashboard/header";

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ locationId?: string }>;
}) {
    const sParams = await searchParams;
    const locationIdFromUrl = sParams.locationId;
  const session = await auth();
  const currentUserId = session?.user?.id || "";

  // 1. Ambil semua lokasi untuk Tabs
  const locations = await prisma.location.findMany({
    select: { id: true, name: true },
  });

  // 2. Tentukan lokasi aktif (default ke lokasi pertama jika tidak ada di URL)
  const activeLocationId = locationIdFromUrl || locations[0]?.id;
  // 3. Ambil data inventory berdasarkan lokasi + Log terakhir
  const inventoryItems = await prisma.inventory.findMany({
    where: { locationId: activeLocationId },
    include: {
      logs: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { createdBy: { select: { name: true } } },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <main className="min-h-screen bg-cyan-50 pb-24">
      {/* Header Section */}
      <div className="bg-cyan-50 border-b border-slate-200  pb-2 sticky top-0 z-30">
        <DashboardHeader title="Inventaris Barang" />
        
        {/* Horizontal Scroll Tabs untuk Lokasi */}
        <LocationTabs 
          locations={locations} 
          activeLocationId={activeLocationId} 
        />
      </div>

      {/* Stats Singkat (Optional) */}
      <div className="p-4 grid grid-cols-2 gap-3">
        <div className="bg-cyan-500 p-3 rounded-2xl text-white">
          <p className="text-[10px] font-bold uppercase opacity-80">Total Item</p>
          <p className="text-2xl font-black">{inventoryItems.length}</p>
        </div>
        <div className="bg-fuchsia-400 p-3 rounded-2xl text-white">
          <p className="text-[10px] font-bold uppercase opacity-80">Stok Rendah</p>
          <p className="text-2xl font-black">
            {inventoryItems.filter(i => i.stock < 5).length}
          </p>
        </div>
      </div>

      {/* List Inventory */}
      <div className="px-4">
        {inventoryItems.length > 0 ? (
          <InventoryList 
            items={inventoryItems} 
            currentUserId={currentUserId} 
          />
        ) : (
          <div className="text-center py-20">
            <p className="text-slate-400 text-sm">Belum ada barang di lokasi ini.</p>
          </div>
        )}
      </div>

      {/* Floating Action Button untuk Tambah Barang Baru */}
      <AddInventoryFAB 
        locationId={activeLocationId} 
        currentUserId={currentUserId} 
      />
    </main>
  );
}