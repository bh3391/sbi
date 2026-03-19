import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/entrance-guru",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // Kita simpan role sebagai string murni
        token.role = (user as any).role;
      }
      return token;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = nextUrl;

      // Proteksi rute utama (hanya cek login)
      const isDashboardRoute =
        pathname.startsWith("/admin") || pathname.startsWith("/guru");

      if (isDashboardRoute) {
        if (isLoggedIn) return true; // Biarkan masuk, validasi role dilakukan di Layout.tsx
        return false; // Redirect ke /entrance-guru
      }

      // Jika sudah login dan mencoba akses login page lagi
      if (isLoggedIn && pathname === "/entrance-guru") {
        const role = (auth.user as any)?.role;
        return Response.redirect(
          new URL(role === "ADMIN" ? "/admin" : "/guru", nextUrl),
        );
      }

      return true;
    },
  },
  providers: [], // Kosongkan di sini, isi di auth.ts
} satisfies NextAuthConfig;
