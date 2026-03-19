import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import LoginForm from "@/components/dashboard/LoginForm";

export default async function LoginPage() {
  const session = await auth();

  // JIKA SUDAH LOGIN: Langsung redirect berdasarkan role
  if (session) {
    const role = (session.user as any).role;
    if (role === "ADMIN") {
      redirect("/admin");
    } else {
      redirect("/guru");
    }
  }

  // JIKA BELUM LOGIN: Tampilkan form login
  return <LoginForm />;
}
