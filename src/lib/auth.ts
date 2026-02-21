// src/auth.ts
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET,
  providers: [
    Credentials({
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        // Pastikan user ada dan password cocok
        if (!user || !user.password) return null;
        const isPasswordValid = await bcrypt.compare(credentials.password as string, user.password);
        if (!isPasswordValid) return null;

        // PENTING: Kembalikan object ini agar ditangkap oleh callback jwt
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role, // Pastikan field ini ada di DB
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id ?? "";
        token.role = (user as any).role; // Mengambil dari return authorize di atas
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
    // Hubungkan authorized dari config
    authorized: authConfig.callbacks?.authorized,
  },
});