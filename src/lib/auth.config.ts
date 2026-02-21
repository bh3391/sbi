import { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/entrance-guru",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/guru") || nextUrl.pathname.startsWith("/admin");
      
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; 
      }
      if (isLoggedIn && nextUrl.pathname.startsWith("/entrance-guru")) {
        return Response.redirect(new URL("/guru", nextUrl));
      }
      return true;
    },
  },
  providers: [], // Kosongkan dulu, akan diisi di file auth.ts
} satisfies NextAuthConfig;