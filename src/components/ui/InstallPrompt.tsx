"use client";

import { useState, useEffect } from "react";
import { Smartphone, Download, X, Share, PlusSquare } from "lucide-react";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 1. Deteksi apakah sudah terinstal (PWA Mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
                         || (window.navigator as any).standalone === true;

    // 2. Deteksi Perangkat iOS
    const ua = window.navigator.userAgent;
    const isApple = /iPad|iPhone|iPod/.test(ua);
    setIsIOS(isApple);

    // 3. Logika untuk Android (Chrome/Edge)
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!isStandalone) setIsVisible(true);
    };

    // 4. Logika untuk iOS (Tampilkan manual jika belum standalone)
    if (isApple && !isStandalone) {
      setIsVisible(true);
    }

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallAndroid = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setIsVisible(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 z-[100] md:left-auto md:right-8 md:w-96 animate-in fade-in slide-in-from-bottom-10 duration-500">
      <div className="bg-gradient-to-br from-cyan-600 to-fuchsia-600 p-[1px] rounded-[24px] shadow-2xl">
        <div className="bg-white rounded-[23px] p-5 shadow-inner">
          <button 
            onClick={() => setIsVisible(false)}
            className="absolute top-4 right-4 text-slate-300 hover:text-slate-600 transition-colors"
          >
            <X size={18} />
          </button>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-cyan-100 p-3 rounded-2xl">
              <Smartphone className="text-cyan-600 w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-800">Aplikasi Bimbel</h3>
              <p className="text-[10px] text-slate-500 font-medium">Pasang di layar utama untuk akses instan.</p>
            </div>
          </div>

          {isIOS ? (
            // Tampilan Khusus iOS (Safari)
            <div className="bg-slate-50 rounded-2xl p-4 space-y-3 border border-slate-100">
              <p className="text-[10px] text-slate-600 font-bold uppercase tracking-tight text-center">Instruksi iPhone:</p>
              <div className="flex items-center gap-3 text-[11px] text-slate-700">
                <div className="bg-white p-1.5 rounded-lg shadow-sm border"><Share size={14} className="text-blue-500"/></div>
                <span>Klik ikon <b>'Share'</b> di bar bawah Safari</span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-700">
                <div className="bg-white p-1.5 rounded-lg shadow-sm border"><PlusSquare size={14} /></div>
                <span>Pilih <b>'Add to Home Screen'</b></span>
              </div>
            </div>
          ) : (
            // Tampilan Android (Tombol Langsung)
            <button
              onClick={handleInstallAndroid}
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-3.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-100"
            >
              <Download size={14} /> Pasang Sekarang
            </button>
          )}
        </div>
      </div>
    </div>
  );
}