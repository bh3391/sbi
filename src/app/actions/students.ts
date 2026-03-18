"use server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { sendFonneNotification } from "@/lib/fonnte";
import { auth } from "@/lib/auth";
import { StudentStatus } from "@prisma/client";

export async function getAllStudents() {
  try {
    const students = await prisma.student.findMany({
      include: {
        location: {
          select: {
            name: true, // Mengambil nama lokasi/cabang
          }
        },
        _count: {
          select: { attendances: true }
        }
      },
      orderBy: {
        fullName: 'asc',
      },
    });

    // Kita transform data agar lebih mudah dibaca oleh komponen UI
    return students.map(s => ({
      ...s,
      locationName: s.location?.name || "No Location",
      totalAttendances: s._count.attendances
    }));
  } catch (error) {
    console.error("Error fetching students:", error);
    return [];
  }
}

export async function createStudent(formData: any, addonIds: string[] = []) {
  const session = await auth();
  const currentUserId = session?.user?.id;
  const REG_FEE = 150000; 

  try {
    const fullName = formData.get("fullName") as string;
    const nickname = formData.get("nickname") as string;
    const parentName = formData.get("parentName") as string;
    const parentContact = formData.get("parentContact") as string;
    const locationId = formData.get("locationId") as string;
    const pkgId = formData.get("packageId") as string;
    const method = (formData.get("method") as string) || "TRANSFER";

    // Parse JSON arrays dari hidden inputs
    const addonIdsRaw = formData.get("addonIds") as string;
    const addonIds: string[] = addonIdsRaw ? JSON.parse(addonIdsRaw) : [];

    const subjectIdsRaw = formData.get("subjectIds") as string;
    const subjectIds: string[] = subjectIdsRaw ? JSON.parse(subjectIdsRaw) : [];

    // --- 2. VALIDASI & KALKULASI ---
    if (!pkgId) throw new Error("ID Paket tidak ditemukan");

    const pkg = await prisma.package.findUnique({ where: { id: pkgId } });
    if (!pkg) throw new Error("Paket tidak ditemukan");

    const selectedAddons = await prisma.addon.findMany({
      where: { id: { in: addonIds } }
    });

    const addonsTotalPrice = selectedAddons.reduce((sum, a) => sum + Number(a.price || 0), 0);
    const addonsTotalSesi = selectedAddons.reduce((sum, a) => sum + Number(a.sesiCredit || 0), 0);

    const totalInitialAmount = Number(pkg.price) + REG_FEE + addonsTotalPrice;

    // --- 3. TRANSAKSI DATABASE ---
    const transactionResult = await prisma.$transaction(async (tx) => {
      // Logika: Sesi otomatis aktif HANYA jika CASH
      const isCash = method === "CASH";
      const initialSesiUtama = isCash ? pkg.sesiCredit : 0;
      const initialSesiAddon = isCash ? addonsTotalSesi : 0;
      const paymentStatus = isCash ? "SUCCESS" : "PENDING";

      const student = await tx.student.create({
        data: {
          fullName,
          nickname,
          parentName,
          parentContact,
          locationId,
          packageId: pkgId,
          status: "NEWSTUDENT",
          remainingSesi: initialSesiUtama,
          addOnSesi: initialSesiAddon,
          // Relasi Many-to-Many
          subjects: {
            connect: subjectIds.map((id) => ({ id })),
          },
          addons: {
            connect: addonIds.map((id) => ({ id })),
          },
        },
      });

      await tx.payment.create({
        data: {
          students: { connect: { id: student.id } },
          amount: totalInitialAmount,
          status: paymentStatus,
          category: "REGISTRATION",
          method: method,
          notes: `REGIST: ${pkg.name.toUpperCase()}${
            selectedAddons.length > 0 
              ? ' + ADDONS: ' + selectedAddons.map(a => a.name).join(', ') 
              : ''
          }`,
          createdById: currentUserId || null,
        }
      });

      return { student, totalAmount: totalInitialAmount, addonsList: selectedAddons };
    });

    // --- NOTIFIKASI WHATSAPP ---
    if (transactionResult) {
      const { student, totalAmount, addonsList } = transactionResult;
      
      // Susun rincian Add-on untuk teks WA
      const addonText = addonsList.length > 0 
        ? addonsList.map(a => `• Add-on ${a.name} : Rp ${a.price.toLocaleString('id-ID')}\n`).join('')
        : "";

      if (student.parentContact) {
        const parentMsg = 
          `Halo Ayah/Bunda *${student.parentName}*,\n\n` +
          `Pendaftaran Ananda *${student.fullName}* berhasil kami catat. ✨\n\n` +
          `*DETAIL PEMBAYARAN:*\n` +
          `--------------------------------\n` +
          `• Biaya Registrasi : Rp ${REG_FEE.toLocaleString('id-ID')}\n` +
          `• Paket ${pkg.name} : Rp ${pkg.price.toLocaleString('id-ID')}\n` +
          `${addonText}` +
          `--------------------------------\n` +
          `*TOTAL TRANSFER : Rp ${totalAmount.toLocaleString('id-ID')}*\n` +
          `--------------------------------\n\n` +
          `*TRANSFER KE REKENING:*\n` +
          `🏦 *BCA - 1234567890*\n` +
          `👤 *A/N ADMIN BIMBEL*\n\n` +
          `Mohon kirimkan *Bukti Transfer* untuk aktivasi akun Ananda. Terima kasih! 🙏`;

        await sendFonneNotification(student.parentContact, parentMsg);
      }
    }

    revalidatePath("/admin/data-siswa");
    return { success: true };

  } catch (error) {
    console.error("Registration Error:", error);
    return { success: false, message: "Gagal mendaftarkan siswa" };
  }
}

export async function getFormDataReferences() {
  try {
    const [locations, packages, subjects,addOns] = await Promise.all([
      // Mengambil lokasi belajar
      prisma.location.findMany({ 
        select: { id: true, name: true },
        orderBy: { name: 'asc' }
      }),
      // Mengambil paket (Penting: Sertakan price dan sesiCredit untuk kalkulasi Payment)
      prisma.package.findMany({ 
        select: { 
          id: true, 
          name: true, 
          sesiCredit: true,
          price: true // Dibutuhkan untuk mengisi amount di tabel Payment
        },
        orderBy: { sesiCredit: 'asc' }
      }),
      // Mengambil mata pelajaran
      prisma.subject.findMany({ 
        select: { id: true, name: true },
        orderBy: { name: 'asc' }
      }),
      prisma.addon.findMany({
        select: { id: true, name: true, price: true, },
        orderBy: { name: 'asc' }
      })
    ]);

    return { 
      locations, 
      packages, 
      subjects,
      addOns,
      success: true 
    };
  } catch (error) {
    console.error("Error fetching form references:", error);
    return { 
      locations: [], 
      packages: [], 
      subjects: [],
      addOns:[], 
      success: false 
    };
  }
}

export async function updateStudent(id: string, formData: any) {

  const subjectIdsRaw = formData.get("subjectIds") as string;
  const subjectIds = subjectIdsRaw ? JSON.parse(subjectIdsRaw) : [];

  try {
    await prisma.student.update({
      where: { id },
      data: {
        fullName: formData.fullName,
        nickname: formData.nickname,
        parentName: formData.parentName,
        parentContact: formData.parentContact,
        locationId: formData.locationId,
        packageId: formData.packageId,
        subjects: {
            connect: subjectIds.map((id: string) => ({ id })),
          },
        status: formData.status, // Penting untuk bisa ubah status ke SUSPEND/ACTIVE
        remainingSesi: formData.remainingSesi, // Memungkinkan admin koreksi sesi
      },
    });

    revalidatePath("/admin/data-siswa");
    return { success: true, message: "Data siswa berhasil diperbarui" };
  } catch (error) {
    console.error("Update Student Error:", error);
    return { success: false, message: "Gagal memperbarui data siswa" };
  }
}

export async function updateStudentStatus(studentId: string, newStatus: string) {
  try {
    await prisma.student.update({
      where: { id: studentId },
      data: { status: newStatus as StudentStatus },
    });

    revalidatePath("/admin/data-siswa");
    return { success: true };
  } catch (error) {
    console.error("UPDATE_STATUS_ERROR:", error);
    return { success: false, message: "Gagal memperbarui status" };
  }
}

export async function registerStudentPublic(formData: FormData) {
  const REG_FEE = 150000;

  try {
    // 1. Ambil Data Dasar dari FormData
    const fullName = formData.get("fullName") as string;
    const nickname = formData.get("nickname") as string;
    const parentName = formData.get("parentName") as string;
    const parentContact = formData.get("parentContact") as string;
    const locationId = formData.get("locationId") as string;
    const packageId = formData.get("packageId") as string;
    const addOnId = formData.get("addOnId") as string; // Sesuai nama di dropdown add-on nullable
    
    // Ambil array JSON dari hidden input
    const subjectIdsRaw = formData.get("subjectIds") as string;
    const subjectIds = subjectIdsRaw ? JSON.parse(subjectIdsRaw) : [];

    if (!packageId && !addOnId) {
      throw new Error("Silakan pilih minimal satu: Paket Belajar atau Program Add-on.");
    }

    let pkgPrice = 0;
    let pkgName = "";
    let pkgData = null;

    // 2. Jika ada Package Utama
    if (packageId) {
      pkgData = await prisma.package.findUnique({ where: { id: packageId } });
      if (!pkgData) throw new Error("Paket utama tidak ditemukan.");
      pkgPrice = Number(pkgData.price);
      pkgName = pkgData.name;
    }

    // 3. Jika ada Add-on
    let addonsTotalPrice = 0;
    let selectedAddonList: any[] = [];
    let addonsTotalSesi = 0;

      

    if (addOnId) {
      const addon = await prisma.addon.findUnique({ where: { id: addOnId } });
      if (addon) {
        addonsTotalPrice = Number(addon.price || 0);
        addonsTotalSesi = Number(addon.sesiCredit || 0);
        selectedAddonList.push(addon);
      }
    }

    const totalInitialAmount = pkgPrice + REG_FEE + addonsTotalPrice;

    // 4. Jalankan Transaksi Database
    const transactionResult = await prisma.$transaction(async (tx) => {
      // Untuk pendaftaran publik, default selalu TRANSFER & PENDING
      const paymentStatus = "PENDING";
      const initialSesiUtama = 0; // Mulai dari 0 sampai diverifikasi admin
      const initialSesiAddon = 0;

      // Create Student
      const student = await tx.student.create({
        data: {
          fullName,
          nickname,
          parentName,
          parentContact,
          locationId,
          packageId,
          status: "NEWSTUDENT",
          remainingSesi: initialSesiUtama,
          addOnSesi: initialSesiAddon,
          // Hubungkan mata pelajaran (Many-to-Many)
          subjects: {
            connect: subjectIds.map((id: string) => ({ id })),
          },
          // Hubungkan Add-on jika ada
          ...(addOnId && {
            addons: {
              connect: { id: addOnId },
            },
          }),
        },
      });

      // Create Payment Record
      await tx.payment.create({
        data: {
          students: { connect: { id: student.id } },
          amount: totalInitialAmount,
          status: paymentStatus,
          category: "REGISTRATION",
          method: "TRANSFER", // Default publik adalah transfer
          notes: `PENDAFTARAN PUBLIK: ${pkgName.toUpperCase()}${
            selectedAddonList.length > 0 ? " + " + selectedAddonList[0].name : ""
          }`,
          createdById: null, // Publik tidak memiliki User ID Admin
        },
      });

      return { student, totalAmount: totalInitialAmount, addonsList: selectedAddonList };
    });

    // 5. Kirim Notifikasi WhatsApp
    if (transactionResult) {
  const { student, totalAmount, addonsList } = transactionResult;
  const adminContact = "089670431969"; // Nomor Owner/Admin

  // Rincian Add-on (Reusable)
  const addonText = addonsList.length > 0
    ? `• Add-on ${addonsList[0].name} : Rp ${addonsList[0].price.toLocaleString("id-ID")}\n`
    : "";

  // 1. PESAN UNTUK ORANG TUA
  if (student.parentContact) {
    const parentMsg =
      `Halo Ayah/Bunda *${parentName}*,\n\n` +
      `Pendaftaran Ananda *${fullName}* berhasil kami catat. ✨\n\n` +
      `*DETAIL PEMBAYARAN:*\n` +
      `--------------------------------\n` +
      `• Biaya Registrasi : Rp ${REG_FEE.toLocaleString("id-ID")}\n` +
      `• Paket ${pkgName} : Rp ${pkgPrice.toLocaleString("id-ID")}\n` +
      `${addonText}` +
      `--------------------------------\n` +
      `*TOTAL TRANSFER : Rp ${totalAmount.toLocaleString("id-ID")}*\n` +
      `--------------------------------\n\n` +
      `*TRANSFER KE REKENING:*\n` +
      `🏦 *BCA - 1234567890*\n` +
      `👤 *A/N ADMIN BIMBEL*\n\n` +
      `Mohon kirimkan *Bukti Transfer* ke nomor ini untuk aktivasi akun Ananda. Terima kasih! 🙏`;

    await sendFonneNotification(student.parentContact, parentMsg);
  }

  // 2. PESAN UNTUK ADMIN/OWNER
  const adminMsg = 
    `📢 *NOTIFIKASI PENDAFTARAN BARU*\n\n` +
    `Seorang siswa telah mendaftar melalui form publik:\n\n` +
    `*DATA SISWA:*\n` +
    `• Nama: ${fullName} (${nickname})\n` +
    `• Orang Tua: ${parentName}\n` +
    `• WhatsApp: ${student.parentContact}\n` +
    `• Lokasi: ${student.locationId}\n\n` + // Anda bisa mengambil loc.name jika sudah di-query
    `*PAKET DI AMBIL:*\n` +
    `• Paket: ${pkgName}\n` +
    `${addonText}` +
    `• Total Tagihan: *Rp ${totalAmount.toLocaleString("id-ID")}*\n\n` +
    `_Segera cek dashboard admin untuk verifikasi pembayaran jika bukti transfer sudah dikirim._`;

  await sendFonneNotification(adminContact, adminMsg);
}

    revalidatePath("/admin/data-siswa"); // Agar admin melihat data baru
    return { success: true };

  } catch (error: any) {
    console.error("Public Registration Error:", error);
    return { 
      success: false, 
      message: error.message || "Gagal mendaftarkan siswa secara publik" 
    };
  }
}