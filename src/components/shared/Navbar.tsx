import { auth } from "@/lib/auth";
import NavbarClient from "./NavbarPublic";

export default async function Navbar() {
  const session = await auth();
  
  // Tips: Anda bisa memfilter data yang tidak perlu dikirim ke client
  // demi keamanan, tapi untuk navbar biasanya butuh name, image, dan role.
  const userData = session?.user ? {
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
    role: (session.user as any).role, // Pastikan role ikut terkirim
  } : null;

  

  return <NavbarClient user={userData} />;
}