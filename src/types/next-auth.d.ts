import { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role?: string // Kita tambahkan role di sini
    } & DefaultSession["user"]
  }

  interface User {
    role?: string // Kita tambahkan role di sini juga
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string
  }
}