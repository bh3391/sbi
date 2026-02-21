// src/middleware.ts (atau proxy.ts)
import { auth } from "@/lib/auth";
 
export default auth((req) => {
  // Biarkan semua lewat dulu untuk testing
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};