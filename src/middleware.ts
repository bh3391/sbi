import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)",'/admin/:path*', '/api/admin/:path*'],
};



export async function middleware(req: NextRequest) {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  const token = await getToken({ req, secret });
  const { pathname } = req.nextUrl;

  // 1. Cek Login
  if (!token) {
    if (pathname.startsWith('/admin') || pathname.startsWith('/guru') || pathname.startsWith('/manager')) {
      return NextResponse.redirect(new URL('/entrance-guru', req.url));
    }
  }

  // 2. Proteksi Folder Berdasarkan Role
  if (pathname.startsWith('/admin') && token?.role !== 'ADMIN') {
    return NextResponse.rewrite(new URL('/forbidden', req.url));
  }

  if (pathname.startsWith('/guru') && token?.role !== 'TEACHER') {
    return NextResponse.rewrite(new URL('/forbidden', req.url));
  }

  if (pathname.startsWith('/manager') && token?.role !== 'MANAGER') {
    return NextResponse.rewrite(new URL('/forbidden', req.url));
  }

  return NextResponse.next();
}

