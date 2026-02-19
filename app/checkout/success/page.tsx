"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
// ↑ Mengambil parameter dari URL
// Contoh: /checkout/success?event=Solaris&tier=VIP&qty=2&total=1500000

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();

  // Ambil data dari URL parameters
  const eventName = searchParams.get("event") || "Event";
  const tierName = searchParams.get("tier") || "Tiket";
  const qty = searchParams.get("qty") || "1";
  const total = searchParams.get("total") || "0";
  const discount = searchParams.get("discount") || "0";

  // Format harga
  function formatPrice(price: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
         style={{ background: "linear-gradient(135deg, #0a0a14 0%, #1a1a2e 50%, #0a0a14 100%)" }}>

      <div className="w-full max-w-md text-center">

        {/* Ikon Sukses */}
        <div className="mb-8">
          <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center"
               style={{ background: "rgba(34,197,94,0.15)", border: "2px solid rgba(34,197,94,0.4)" }}>
            <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </div>
        </div>

        {/* Judul */}
        <h1 className="text-3xl font-bold text-white mb-2">Pembelian Berhasil! 🎉</h1>
        <p className="text-gray-400 mb-8">Tiket Anda sudah tersimpan</p>

        {/* Ringkasan Order */}
        <div className="rounded-2xl p-6 mb-8 text-left"
             style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>

          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Event</span>
              <span className="text-white font-medium text-sm text-right max-w-[200px]">{decodeURIComponent(eventName)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Kategori Tiket</span>
              <span className="text-white font-medium text-sm">{decodeURIComponent(tierName)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Jumlah</span>
              <span className="text-white font-medium text-sm">{qty} tiket</span>
            </div>
            {Number(discount) > 0 && (
              <div className="flex justify-between">
                <span className="text-green-400 text-sm">Diskon Voucher</span>
                <span className="text-green-400 font-medium text-sm">-{formatPrice(Number(discount))}</span>
              </div>
            )}
            <div className="pt-3 border-t border-white/10 flex justify-between">
              <span className="text-white font-semibold">Total Bayar</span>
              <span className="text-blue-400 font-bold text-lg">{formatPrice(Number(total))}</span>
            </div>
          </div>
        </div>

        {/* Tombol Navigasi */}
        <div className="space-y-3">
          <Link href="/dashboard"
                className="block w-full py-3 rounded-xl text-white font-semibold transition-all text-center"
                style={{ background: "#3b5bff" }}>
            Lihat Tiket Saya
          </Link>
          <Link href="/events"
                className="block w-full py-3 rounded-xl text-gray-400 font-medium transition-all text-center hover:text-white"
                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}>
            Jelajahi Event Lain
          </Link>
        </div>
      </div>
    </div>
  );
}
