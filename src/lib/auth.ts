import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  // Menggunakan strategi JWT. Pastikan AUTH_SECRET di .env benar-benar kuat.
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        // Validasi user dan password
        if (!user || !user.password) return null;

        const isMatch = await bcrypt.compare(
          credentials.password as string,
          user.password,
        );

        if (!isMatch) return null;

        // LOG untuk memastikan data dari DB keluar sebelum masuk ke JWT

        // Mengembalikan objek user.
        // Sangat penting: Cast user.role menjadi String untuk menghindari masalah serialisasi Enum.
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: String(user.role),
        };
      },
    }),
  ],
  callbacks: {
    // 1. JWT Callback: Menyimpan role ke dalam token (berjalan di server)
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }

      // Handle update session secara manual jika diperlukan (optional)
      if (trigger === "update" && session) {
        return { ...token, ...session.user };
      }

      return token;
    },

    // 2. Session Callback: Mengirim data dari token ke Client/Browser
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        // @ts-ignore
        session.user.role = token.role as string;
      }
      return session;
    },
  },
});
