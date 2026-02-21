"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabase";

type OrderData = {
  id: string;
  quantity: number;
  total_price: number;
  discount_amount: number;
  status: string;
  events: { title: string } | null;
  ticket_tiers: { name: string } | null;
};

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  // Format harga
  function formatPrice(price: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  }

  // Fetch order data
  useEffect(() => {
    async function fetchOrder() {
      if (!orderId) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("orders")
        .select("*, events(title), ticket_tiers(name)")
        .eq("id", orderId)
        .single();

      if (data) setOrder(data);
      setLoading(false);
    }

    fetchOrder();
  }, [orderId]);

  // Cek status pembayaran secara berkala jika masih pending
  useEffect(() => {
    if (!order || order.status !== "pending") return;

    setChecking(true);
    const interval = setInterval(async () => {
      const { data } = await supabase
        .from("orders")
        .select("status")
        .eq("id", order.id)
        .single();

      if (data && data.status === "paid") {
        setOrder({ ...order, status: "paid" });
        setChecking(false);
        clearInterval(interval);
      }
    }, 5000); // Cek setiap 5 detik

    return () => clearInterval(interval);
  }, [order]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0a14" }}>
        <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const isPaid = order?.status === "paid";
  const isPending = order?.status === "pending";

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
         style={{ background: "linear-gradient(135deg, #0a0a14 0%, #1a1a2e 50%, #0a0a14 100%)" }}>

      <div className="w-full max-w-md text-center">

        {/* Ikon Status */}
        <div className="mb-8">
          {isPaid ? (
            <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center"
                 style={{ background: "rgba(34,197,94,0.15)", border: "2px solid rgba(34,197,94,0.4)" }}>
              <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            </div>
          ) : isPending ? (
            <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center"
                 style={{ background: "rgba(234,179,8,0.15)", border: "2px solid rgba(234,179,8,0.4)" }}>
              <svg className="w-10 h-10 text-yellow-400 animate-pulse" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
          ) : (
            <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center"
                 style={{ background: "rgba(239,68,68,0.15)", border: "2px solid rgba(239,68,68,0.4)" }}>
              <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
            </div>
          )}
        </div>

        {/* Judul berdasarkan status */}
        {isPaid ? (
          <>
            <h1 className="text-3xl font-bold text-white mb-2">Pembayaran Berhasil! 🎉</h1>
            <p className="text-gray-400 mb-8">Tiket Anda sudah tersimpan</p>
          </>
        ) : isPending ? (
          <>
            <h1 className="text-3xl font-bold text-white mb-2">Menunggu Pembayaran</h1>
            <p className="text-gray-400 mb-8">
              {checking ? "Mengecek status pembayaran..." : "Silakan selesaikan pembayaran Anda"}
            </p>
            {checking && (
              <div className="flex items-center justify-center gap-2 mb-6">
                <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-yellow-400 text-sm">Menunggu konfirmasi pembayaran...</span>
              </div>
            )}
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-white mb-2">Order Tidak Ditemukan</h1>
            <p className="text-gray-400 mb-8">Silakan cek kembali pesanan Anda</p>
          </>
        )}

        {/* Ringkasan Order */}
        {order && (
          <div className="rounded-2xl p-6 mb-8 text-left"
               style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">Event</span>
                <span className="text-white font-medium text-sm text-right max-w-[200px]">
                  {order.events?.title || "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">Kategori Tiket</span>
                <span className="text-white font-medium text-sm">{order.ticket_tiers?.name || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">Jumlah</span>
                <span className="text-white font-medium text-sm">{order.quantity} tiket</span>
              </div>
              {Number(order.discount_amount) > 0 && (
                <div className="flex justify-between">
                  <span className="text-green-400 text-sm">Diskon Voucher</span>
                  <span className="text-green-400 font-medium text-sm">-{formatPrice(Number(order.discount_amount))}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Status</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                  isPaid ? "text-green-400 bg-green-400/10" : "text-yellow-400 bg-yellow-400/10"
                }`}>
                  {order.status === "paid" ? "Lunas" : "Menunggu Bayar"}
                </span>
              </div>
              <div className="pt-3 border-t border-white/10 flex justify-between">
                <span className="text-white font-semibold">Total Bayar</span>
                <span className="text-blue-400 font-bold text-lg">{formatPrice(Number(order.total_price))}</span>
              </div>
            </div>
          </div>
        )}

        {/* Tombol Navigasi */}
        <div className="space-y-3">
          {isPaid && (
            <Link href={`/ticket?id=${order?.id}`}
                  className="block w-full py-3 rounded-xl text-white font-semibold transition-all text-center"
                  style={{ background: "#3b5bff" }}>
              🎫 Lihat E-Ticket
            </Link>
          )}
          <Link href="/dashboard"
                className="block w-full py-3 rounded-xl text-white font-semibold transition-all text-center"
                style={{ background: isPaid ? "rgba(255,255,255,0.08)" : "#3b5bff",
                         border: isPaid ? "1px solid rgba(255,255,255,0.1)" : "none" }}>
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
