// src/utils/fonnte.ts
export async function sendFonneNotification(target: string, message: string) {
  try {
    const token = process.env.FONNTE_TOKEN;
    
    // Log untuk memastikan variabel terbaca
    console.log("Mengirim WA ke:", target);
    console.log("Menggunakan Token:", token ? "Token Terdeteksi" : "TOKEN KOSONG!");

    const response = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: {
        "Authorization": token || "", // Pastikan tidak undefined
      },
      body: new URLSearchParams({
        target: target,
        message: message,
        countryCode: "62",
      }),
    });

    const result = await response.json();
    return result;
  } catch (err: any) {
    // Log ini akan memberitahu kita APA yang salah (Network, DNS, atau Timeout)
    console.error("DETIL ERROR FETCH:", err.message);
    return { status: false, reason: err.message };
  }
}