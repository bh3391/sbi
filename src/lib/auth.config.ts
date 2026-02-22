import { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/entrance-guru",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
       // Biarkan semua akses dulu, nanti kita handle di middleware.ts
      const user = auth?.user as any;
      const isLoggedIn = !!user;
      const { pathname } = nextUrl;

      // Normalisasi role
      const role = user?.role?.toString().toUpperCase().trim();

      const isGuruRoute = pathname.startsWith("/guru");
      const isAdminRoute = pathname.startsWith("/admin");

      // Logika Proteksi
      if (isGuruRoute || isAdminRoute) {
        if (!isLoggedIn) return false;

        // JIKA ROLE UNDEFINED: Jangan dilempar dulu! 
        // Biarkan masuk ke halaman agar session stabil.
        if (!role) return true; 

        if (isAdminRoute && role !== "ADMIN") {
          return Response.redirect(new URL("/", nextUrl));
        }
        
        if (isGuruRoute && (role !== "TEACHER" && role !== "GURU" && role !== "ADMIN")) {
          return Response.redirect(new URL("/", nextUrl));
        }
        return true;
      }

      if (isLoggedIn && pathname === "/entrance-guru") {
        const target = role === "ADMIN" ? "/admin" : "/guru";
        return Response.redirect(new URL(target, nextUrl));
      }

      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;