// src/app/actions/locations.ts
"use server"

import prisma  from "@/lib/prisma";

/**
 * Mengambil semua data lokasi/cabang dari database
 * Digunakan untuk dropdown pada form pendaftaran dan manajemen staff
 */
export async function getAllLocations() {
  try {
    const locations = await prisma.location.findMany({
      select: {
        id: true,
        name: true,
        address: true, // Opsional, jika Anda membutuhkannya
      },
      orderBy: {
        name: 'asc', // Mengurutkan nama cabang dari A-Z
      },
    });

    return locations;
  } catch (error) {
    console.error("Error fetching locations:", error);
    // Mengembalikan array kosong jika terjadi error agar aplikasi tidak crash
    return [];
  }
}