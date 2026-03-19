"use client";
import { useState, useEffect } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { saveSubscription } from "@/app/actions/push-notif";

export default function PushNotificationManager({
  userId,
}: {
  userId: string;
}) {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      checkSubscription();
    } else {
      setLoading(false);
    }
  }, []);

  const checkSubscription = async () => {
    const registration = await navigator.serviceWorker.ready;
    const sub = await registration.pushManager.getSubscription();
    setSubscription(sub);
    setLoading(false);
  };

  const subscribeToPush = async () => {
    try {
      setLoading(true);
      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      });

      // Simpan ke DB via Server Action
      const subJSON = sub.toJSON();
      await saveSubscription(subJSON, userId);

      setSubscription(sub);
      toast.success("Notifikasi aktif!");
    } catch (error) {
      console.error("Failed to subscribe:", error);
      toast.error("Gagal mengaktifkan notifikasi. Pastikan izin diberikan.");
    } finally {
      setLoading(false);
    }
  };

  if (!isSupported) return null;

  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
      <div
        className={`p-3 rounded-xl ${subscription ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}
      >
        {subscription ? <Bell size={20} /> : <BellOff size={20} />}
      </div>

      <div className="flex-1">
        <h4 className="text-sm font-bold text-slate-800">
          {subscription ? "Notifikasi Aktif" : "Aktifkan Notifikasi"}
        </h4>
        <p className="text-[11px] text-slate-500">
          {subscription
            ? "Anda akan menerima info pendaftaran & pembayaran secara real-time."
            : "Izinkan browser untuk mengirimkan update data siswa terbaru."}
        </p>
      </div>

      <button
        onClick={subscribeToPush}
        disabled={loading || !!subscription}
        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
          subscription
            ? "bg-slate-100 text-slate-400 cursor-default"
            : "bg-cyan-600 text-white hover:bg-cyan-700 shadow-md shadow-cyan-100"
        }`}
      >
        {loading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : subscription ? (
          "Terhubung"
        ) : (
          "Aktifkan"
        )}
      </button>
    </div>
  );
}
