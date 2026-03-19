"use server";
import webpush from "web-push";
import prisma from "@/lib/prisma"; // Sesuaikan dengan lokasi prisma anda

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

export async function sendPushNotification(payload: {
  title: string;
  body: string;
  url?: string;
}) {
  try {
    // 1. Ambil SEMUA subscription milik user yang punya role ADMIN atau MANAGEMENT
    const adminSubscriptions = await prisma.userSubscription.findMany({
      where: {
        user: {
          role: { in: ["ADMIN", "MANAGEMENT"] },
        },
      },
    });

    console.log(
      `Mengirim notif ke ${adminSubscriptions.length} perangkat admin...`,
    );

    if (adminSubscriptions.length === 0) return;

    const notifications = adminSubscriptions.map((sub) => {
      const pushConfig = {
        endpoint: sub.endpoint,
        keys: {
          auth: sub.auth,
          p256dh: sub.p256dh,
        },
      };

      return webpush
        .sendNotification(
          pushConfig,
          JSON.stringify({
            title: payload.title,
            body: payload.body,
            url: payload.url || "/admin/dashboard",
          }),
        )
        .catch(async (err) => {
          // Jika token sudah tidak valid (browser direset/uninstalled), hapus dari DB
          if (err.statusCode === 410 || err.statusCode === 404) {
            await prisma.userSubscription.delete({ where: { id: sub.id } });
          }
          console.error("Push Error for sub:", sub.id, err.message);
        });
    });

    await Promise.all(notifications);
  } catch (error) {
    console.error("Critical Push Notification Error:", error);
  }
}

// app/actions/push-notif.ts
export async function saveSubscription(sub: any, userId: string) {
  return await prisma.userSubscription.upsert({
    where: { endpoint: sub.endpoint },
    update: { userId: userId },
    create: {
      endpoint: sub.endpoint,
      auth: sub.keys.auth, // Pastikan ini string
      p256dh: sub.keys.p256dh, // Pastikan ini string
      userId: userId,
    },
  });
}

// app/actions/push-notif.ts

export async function sendTestPush(userId: string) {
  // Ambil semua subscription milik user ini
  const userSubs = await prisma.userSubscription.findMany({
    where: { userId: userId },
  });

  if (userSubs.length === 0) {
    throw new Error("Tidak ada perangkat yang terdaftar untuk user ini.");
  }

  const notifications = userSubs.map((sub) => {
    const pushConfig = {
      endpoint: sub.endpoint,
      keys: {
        auth: sub.auth,
        p256dh: sub.p256dh,
      },
    };

    return webpush
      .sendNotification(
        pushConfig,
        JSON.stringify({
          title: "Tes Notifikasi Berhasil! ✨",
          body: "Ini adalah pesan percobaan dari sistem Bimbel Anda.",
          url: "/admin/dashboard",
        }),
      )
      .catch(async (err) => {
        if (err.statusCode === 410 || err.statusCode === 404) {
          await prisma.userSubscription.delete({ where: { id: sub.id } });
        }
      });
  });

  await Promise.all(notifications);
  return { success: true };
}
