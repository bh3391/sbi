"use client";

import { useState, useEffect } from "react";
import { BellOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { saveSubscription } from "@/app/actions/push-notif";

export default function PushNotificationHeader({ userId }: { userId: string }) {
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      checkSubscription();
    } else {
      setLoading(false);
    }
  }, []);

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        const sub = await registration.pushManager.getSubscription();
        setSubscription(sub);
      }
    } catch (error) {
      console.error("Gagal mengecek subskripsi:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePush = async () => {
    if (Notification.permission === "denied") {
      toast.error("Akses Ditolak", {
        description: "Silakan buka pengaturan browser dan izinkan Notifikasi.",
        duration: 5000,
      });
      return;
    }

    try {
      setLoading(true);
      const permission = await Notification.requestPermission();
      if (permission !== "granted") throw new Error("Izin tidak diberikan.");

      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      });
      const readyRegistration = await navigator.serviceWorker.ready;

      const sub = await readyRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      });

      const subJSON = sub.toJSON();
      const formattedSub = {
        endpoint: subJSON.endpoint,
        keys: {
          auth: subJSON.keys?.auth,
          p256dh: subJSON.keys?.p256dh,
        },
      };

      await saveSubscription(formattedSub, userId);
      setSubscription(sub);
      toast.success(
        "Notifikasi Aktif! Anda akan menerima info pendaftaran baru.",
      );
    } catch (error: any) {
      toast.error(error.message || "Gagal mengaktifkan notifikasi.");
    } finally {
      setLoading(false);
    }
  };

  // 1. Jika browser tidak support, jangan tampilkan apa-apa
  // 2. Jika SUDAH subscribe (notif aktif), sembunyikan icon (Return null)
  if (!isSupported || subscription) return null;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleTogglePush}
        disabled={loading}
        className="relative p-2 rounded-full bg-red-50 text-red-500 border border-red-100 active:scale-90 transition-all hover:bg-red-100 animate-pulse"
        title="Aktifkan Notifikasi Admin"
      >
        {loading ? (
          <Loader2 size={18} className="animate-spin text-red-400" />
        ) : (
          <BellOff size={20} strokeWidth={2.5} />
        )}
      </button>
    </div>
  );
}
