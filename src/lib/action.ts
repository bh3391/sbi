"use server"

import { signIn } from "@/lib/auth"
import { AuthError } from "next-auth"
import  prisma  from "@/lib/prisma" // Pastikan prisma diimport

export async function authenticate(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    // 1. Cari user di database untuk cek role sebelum signIn
    const user = await prisma.user.findUnique({
      where: { email },
      select: { role: true }
    });

    if (!user) return "Akun tidak ditemukan.";

    // 2. Tentukan tujuan redirect berdasarkan role
    // Asumsi Role di DB adalah "ADMIN" dan "TEACHER"
    const targetPath = user.role === "ADMIN" ? "/admin" : "/guru";

    // 3. Jalankan signIn dengan redirectTo dinamis
    await signIn("credentials", {
      email,
      password,
      redirectTo: targetPath,
    });

  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Email atau Password salah."
        default:
          return "Terjadi kesalahan pada sistem."
      }
    }
    // WAJIB dilempar agar proses redirect internal NextAuth tidak terhenti
    throw error;
  }
}