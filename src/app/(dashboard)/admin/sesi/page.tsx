exports// app/guru/profile/page.tsx
import prisma  from "@/lib/prisma";
import { auth } from "@/lib/auth";
import GeneratorQR from "@/components/dashboard/GeneratorQr";
import Header from "@/components/dashboard/header";

export default async function ProfilePage() {
  const session = await auth();
  const user = await prisma.user.findUnique({
    where: { id: session?.user?.id },
    select: { name: true, qrCodeId: true, email: true, id: true }
  });

  if (!user || !user.qrCodeId) return <div>Data tidak tersedia</div>;

  return (
    <section className="bg-cyan-50 min-h-screen">
        <Header title="QR Kode" />
    <div className="p-1 items-center  justify-center max-w-md mx-auto">
      <GeneratorQR user={{
    name: user.name ?? "Tanpa Nama", 
    qrCodeId: user.qrCodeId ?? "" ,
    email: user.email ?? "",
    id: user.id ?? ""
  }} />
    </div>
    </section>
  );
}