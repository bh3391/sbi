import { handlers } from "@/lib/auth" // Pastikan path ini sesuai dengan lokasi file auth.ts Anda

// Next.js App Router mewajibkan kita mengekspor method GET dan POST
export const { GET, POST } = handlers