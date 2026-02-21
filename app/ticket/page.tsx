"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import QRCode from "qrcode";

type OrderData = {
  id: string;
  quantity: number;
  total_price: number;
  status: string;
  created_at: string;
  discount_amount: number;
  events: {
    title: string;
    slug: string;
    image_url: string;
    event_date: string;
    venue_name: string;
    venue_address: string;
  };
  ticket_tiers: {
    name: string;
    price: number;
  };
};

export default function ETicketPage() {
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrUrl, setQrUrl] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");

  useEffect(() => {
    async function fetchOrder() {
      if (!orderId) { router.push("/dashboard"); return; }

      // Cek login
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      // Ambil data order
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          events ( title, slug, image_url, event_date, venue_name, venue_address ),
          ticket_tiers ( name, price )
        `)
        .eq("id", orderId)
        .eq("user_id", user.id)
        .single();

      if (error || !data) { router.push("/dashboard"); return; }

      setOrder(data);

      // Generate QR Code
      // QR berisi informasi tiket yang bisa di-scan untuk validasi
      const qrData = JSON.stringify({
        orderId: data.id,
        event: data.events?.title,
        tier: data.ticket_tiers?.name,
        qty: data.quantity,
        status: data.status,
      });

      const qrDataUrl = await QRCode.toDataURL(qrData, {
        width: 280,
        margin: 2,
        color: {
          dark: "#ffffff",
          light: "#00000000", // transparent background
        },
      });
      setQrUrl(qrDataUrl);

      setLoading(false);
    }

    fetchOrder();
  }, [orderId, router]);

  // === DOWNLOAD E-TICKET SEBAGAI GAMBAR ===
  async function handleDownload() {
    if (!order || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = 600;
    const H = 900;
    canvas.width = W;
    canvas.height = H;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, H);
    gradient.addColorStop(0, "#0a0a14");
    gradient.addColorStop(0.5, "#1a1a2e");
    gradient.addColorStop(1, "#0a0a14");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);

    // Border
    ctx.strokeStyle = "rgba(59, 91, 255, 0.3)";
    ctx.lineWidth = 2;
    ctx.roundRect(20, 20, W - 40, H - 40, 20);
    ctx.stroke();

    // Header
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 28px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("E-ANTRE", W / 2, 75);

    ctx.fillStyle = "#6b7280";
    ctx.font = "14px Arial, sans-serif";
    ctx.fillText("E-TICKET", W / 2, 100);

    // Garis pemisah
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(50, 120);
    ctx.lineTo(W - 50, 120);
    ctx.stroke();

    // Event Info
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 22px Arial, sans-serif";
    ctx.textAlign = "center";

    // Wrap title text
    const title = order.events?.title || "Event";
    if (title.length > 30) {
      const mid = Math.ceil(title.length / 2);
      const spaceIndex = title.indexOf(" ", mid - 5);
      const line1 = title.substring(0, spaceIndex > 0 ? spaceIndex : mid);
      const line2 = title.substring(spaceIndex > 0 ? spaceIndex + 1 : mid);
      ctx.fillText(line1, W / 2, 160);
      ctx.fillText(line2, W / 2, 190);
    } else {
      ctx.fillText(title, W / 2, 170);
    }

    // Details
    ctx.font = "16px Arial, sans-serif";
    ctx.fillStyle = "#9ca3af";
    const detailY = title.length > 30 ? 230 : 210;

    ctx.textAlign = "left";
    const labelX = 70;
    const valueX = 230;

    const details = [
      ["Tanggal", order.events?.event_date ? formatDate(order.events.event_date) : "TBA"],
      ["Venue", order.events?.venue_name || "TBA"],
      ["Tiket", order.ticket_tiers?.name || "-"],
      ["Jumlah", `${order.quantity} tiket`],
      ["Total", formatPrice(order.total_price)],
      ["Status", order.status?.toUpperCase() || "-"],
    ];

    details.forEach(([label, value], i) => {
      const y = detailY + i * 35;
      ctx.fillStyle = "#6b7280";
      ctx.font = "14px Arial, sans-serif";
      ctx.fillText(label, labelX, y);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 14px Arial, sans-serif";
      ctx.fillText(value, valueX, y);
    });

    // Garis pemisah sebelum QR
    const qrSectionY = detailY + details.length * 35 + 20;
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.beginPath();
    ctx.moveTo(50, qrSectionY);
    ctx.lineTo(W - 50, qrSectionY);
    ctx.stroke();

    // QR Code
    if (qrUrl) {
      const qrImg = new Image();
      qrImg.src = qrUrl;
      await new Promise((resolve) => { qrImg.onload = resolve; });

      const qrSize = 200;
      const qrX = (W - qrSize) / 2;
      const qrY = qrSectionY + 30;

      // QR background
      ctx.fillStyle = "rgba(255,255,255,0.05)";
      ctx.beginPath();
      ctx.roundRect(qrX - 20, qrY - 15, qrSize + 40, qrSize + 50, 15);
      ctx.fill();

      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

      ctx.fillStyle = "#6b7280";
      ctx.font = "11px Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Scan QR code untuk validasi tiket", W / 2, qrY + qrSize + 25);
    }

    // Order ID di bawah
    ctx.fillStyle = "#4b5563";
    ctx.font = "11px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`Order ID: ${order.id.slice(0, 8)}...`, W / 2, H - 50);

    // Download
    const link = document.createElement("a");
    link.download = `e-ticket-${order.id.slice(0, 8)}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  // === HELPER FUNCTIONS ===
  function formatDate(dateString: string) {
    const utcDate = dateString.endsWith("Z") ? dateString : dateString + "Z";
    return new Date(utcDate).toLocaleDateString("id-ID", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
      hour: "2-digit", minute: "2-digit",
      timeZone: "Asia/Jakarta",
    });
  }

  function formatPrice(price: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency", currency: "IDR", minimumFractionDigits: 0,
    }).format(price);
  }

  function getStatusColor(status: string) {
    switch (status) {
      case "paid": return { bg: "rgba(34,197,94,0.15)", text: "text-green-400", border: "rgba(34,197,94,0.3)" };
      case "pending": return { bg: "rgba(234,179,8,0.15)", text: "text-yellow-400", border: "rgba(234,179,8,0.3)" };
      case "cancelled": return { bg: "rgba(239,68,68,0.15)", text: "text-red-400", border: "rgba(239,68,68,0.3)" };
      default: return { bg: "rgba(255,255,255,0.1)", text: "text-gray-400", border: "rgba(255,255,255,0.2)" };
    }
  }

  // === LOADING STATE ===
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0a14" }}>
        <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!order) return null;

  const statusColor = getStatusColor(order.status);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4" style={{ background: "#0a0a14" }}>
      <div className="max-w-lg mx-auto">

        {/* Back Button */}
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Kembali ke Dashboard
        </Link>

        {/* E-Ticket Card */}
        <div className="rounded-2xl overflow-hidden"
             style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>

          {/* Header */}
          <div className="px-6 pt-6 pb-4 text-center"
               style={{ background: "linear-gradient(135deg, rgba(59,91,255,0.15) 0%, rgba(139,92,246,0.1) 100%)" }}>
            <h2 className="text-sm text-blue-400 font-medium tracking-widest uppercase">E-Ticket</h2>
            <h1 className="text-2xl font-bold text-white mt-1">
              {order.events?.title || "Event"}
            </h1>
          </div>

          {/* Zigzag divider */}
          <div className="relative h-4 flex items-center">
            <div className="absolute left-0 w-4 h-4 rounded-full" style={{ background: "#0a0a14", marginLeft: "-8px" }}></div>
            <div className="flex-1 border-t border-dashed border-white/10 mx-4"></div>
            <div className="absolute right-0 w-4 h-4 rounded-full" style={{ background: "#0a0a14", marginRight: "-8px" }}></div>
          </div>

          {/* Info Section */}
          <div className="px-6 py-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Tanggal</p>
                <p className="text-sm text-white mt-1">
                  {order.events?.event_date ? formatDate(order.events.event_date) : "TBA"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Venue</p>
                <p className="text-sm text-white mt-1">{order.events?.venue_name || "TBA"}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Kategori Tiket</p>
                <p className="text-sm text-white mt-1 font-medium">{order.ticket_tiers?.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Jumlah</p>
                <p className="text-sm text-white mt-1">{order.quantity} tiket</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Total</p>
                <p className="text-lg text-blue-400 mt-1 font-bold">{formatPrice(order.total_price)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Status</p>
                <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium capitalize ${statusColor.text}`}
                      style={{ background: statusColor.bg, border: `1px solid ${statusColor.border}` }}>
                  {order.status}
                </span>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Tanggal Pembelian</p>
              <p className="text-sm text-white mt-1">{formatDate(order.created_at)}</p>
            </div>

            {Number(order.discount_amount) > 0 && (
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Diskon Voucher</p>
                <p className="text-sm text-green-400 mt-1">-{formatPrice(Number(order.discount_amount))}</p>
              </div>
            )}
          </div>

          {/* Zigzag divider */}
          <div className="relative h-4 flex items-center">
            <div className="absolute left-0 w-4 h-4 rounded-full" style={{ background: "#0a0a14", marginLeft: "-8px" }}></div>
            <div className="flex-1 border-t border-dashed border-white/10 mx-4"></div>
            <div className="absolute right-0 w-4 h-4 rounded-full" style={{ background: "#0a0a14", marginRight: "-8px" }}></div>
          </div>

          {/* QR Code Section */}
          <div className="px-6 py-6 text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-4">Scan untuk validasi</p>
            {qrUrl && (
              <div className="inline-block p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.05)" }}>
                <img src={qrUrl} alt="QR Code E-Ticket" className="w-48 h-48 mx-auto" />
              </div>
            )}
            <p className="text-xs text-gray-500 mt-3">
              Order ID: <span className="font-mono text-gray-400">{order.id.slice(0, 8)}...</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 space-y-3">
          <button onClick={handleDownload}
                  className="w-full py-3 rounded-xl text-white font-semibold cursor-pointer flex items-center justify-center gap-2"
                  style={{ background: "#3b5bff" }}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Download E-Ticket
          </button>

          <Link href="/dashboard"
                className="block w-full py-3 rounded-xl text-gray-400 font-medium text-center cursor-pointer"
                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}>
            Kembali ke Dashboard
          </Link>
        </div>

        {/* Hidden canvas for generating downloadable image */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
