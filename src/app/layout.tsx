import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import NextTopLoader from 'nextjs-toploader';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sistem Aplikasi Bimbel",
  description: "Aplikasi manajemen bimbingan belajar dengan fitur absensi, jadwal, dan sesi bimbingan.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextTopLoader
          color="#a5f3fc" // cyan-200
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #a5f3fc,0 0 5px #d946ef" // Efek glow cyan-fuchsia
          template='<div class="bar" role="bar" style="background: linear-gradient(to right, #a5f3fc, #d946ef);"><div class="peg"></div></div>'
        />
        {children}
      </body>
    </html>
  );
}
