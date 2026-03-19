// src/middleware.ts
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

// Inisialisasi Auth khusus untuk Middleware
export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/admin/:path*", "/guru/:path*"],
};
