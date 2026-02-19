"use client";
// ↑ Karena pakai useState, useEffect

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
// ↑ ../../ karena file ini ada di app/events/[slug]/ (2 level di dalam app/)

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
// ↑ useParams = mengambil parameter dari URL
// ↑ useRouter = untuk redirect ke halaman checkout

// === TIPE DATA ===
type Event = {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  image_url: string;
  venue_name: string;
  venue_address: string;
  event_date: string;
};

type TicketTier = {
  id: string;
  name: string;
  description: string;
  price: number;
  quota: number;
  sold: number;
};

type Performer = {
  id: string;
  name: string;
  image_url: string;
  role: string;
};

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();

  const [event, setEvent] = useState<Event | null>(null);
  const [tickets, setTickets] = useState<TicketTier[]>([]);
  const [performers, setPerformers] = useState<Performer[]>([]);
  const [loading, setLoading] = useState(true);

  // === BARU: State untuk pemilihan tiket ===
  const [selectedTier, setSelectedTier] = useState<TicketTier | null>(null);
  // ↑ Tier tiket yang dipilih user

  const [quantity, setQuantity] = useState(1);
  // ↑ Jumlah tiket yang mau dibeli

  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  // === AMBIL DATA EVENT ===
  useEffect(() => {
    async function fetchEventDetail() {
      setLoading(true);

      const { data: eventData, error: eventError } = await supabase
        .from("events")
        .select("*")
        .eq("slug", params.slug)
        .single();

      if (eventError || !eventData) {
        console.error("Event not found:", eventError);
        setLoading(false);
        return;
      }

      setEvent(eventData);

      const { data: ticketData } = await supabase
        .from("ticket_tiers")
        .select("*")
        .eq("event_id", eventData.id)
        .order("price", { ascending: true });

      setTickets(ticketData || []);

      const { data: performerData } = await supabase
        .from("performers")
        .select("*")
        .eq("event_id", eventData.id);

      setPerformers(performerData || []);
      setLoading(false);
    }

    if (params.slug) {
      fetchEventDetail();
    }
  }, [params.slug]);

  // === FORMAT FUNCTIONS ===
  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("id-ID", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });
  }

  function formatTime(dateString: string) {
    return new Date(dateString).toLocaleTimeString("id-ID", {
      hour: "2-digit", minute: "2-digit",
    });
  }

  function formatPrice(price: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency", currency: "IDR", minimumFractionDigits: 0,
    }).format(price);
  }

  // === BARU: FUNGSI CHECKOUT ===
  async function handleCheckout() {
    if (!selectedTier || !event) return;

    setCheckoutError("");
    setCheckoutLoading(true);

    // 1. Cek apakah user sudah login
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      // Belum login → redirect ke login, setelah login akan kembali ke sini
      router.push("/login");
      return;
    }

    // 2. Cek ketersediaan tiket
    const available = selectedTier.quota - selectedTier.sold;
    if (quantity > available) {
      setCheckoutError(`Hanya tersisa ${available} tiket`);
      setCheckoutLoading(false);
      return;
    }

    // 3. Simpan order ke database
    const totalPrice = selectedTier.price * quantity;

    const { error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        event_id: event.id,
        ticket_tier_id: selectedTier.id,
        quantity: quantity,
        total_price: totalPrice,
        status: "paid",
        // ↑ Simulasi: langsung "paid". Nanti bisa diubah ke "pending" + payment gateway
      });

    if (orderError) {
      setCheckoutError("Gagal membuat order: " + orderError.message);
      setCheckoutLoading(false);
      return;
    }

    // 4. Update jumlah tiket terjual
    const { error: updateError } = await supabase
      .from("ticket_tiers")
      .update({ sold: selectedTier.sold + quantity })
      .eq("id", selectedTier.id);

    if (updateError) {
      console.error("Gagal update sold count:", updateError);
    }

    setCheckoutLoading(false);

    // 5. Redirect ke halaman sukses
    router.push(`/checkout/success?event=${event.title}&tier=${selectedTier.name}&qty=${quantity}&total=${totalPrice}`);
  }

  // === LOADING STATE ===
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0a14" }}>
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 mt-4">Memuat detail event...</p>
        </div>
      </div>
    );
  }

  // === EVENT TIDAK DITEMUKAN ===
  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0a14" }}>
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Event Tidak Ditemukan</h1>
          <p className="text-gray-400 mb-6">Event yang Anda cari tidak ada atau sudah dihapus.</p>
          <Link href="/events" className="px-6 py-3 rounded-xl text-white font-semibold"
                style={{ background: "#3b5bff" }}>
            Kembali ke Events
          </Link>
        </div>
      </div>
    );
  }

  // === TAMPILAN UTAMA ===
  return (
    <div className="min-h-screen" style={{ background: "#0a0a14" }}>

      {/* === HERO SECTION === */}
      <div className="relative h-[400px] md:h-[500px]">
        {event.image_url ? (
          <Image src={event.image_url} alt={event.title} fill className="object-cover" priority />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a14] via-[#0a0a14]/60 to-transparent" />

        <div className="absolute top-24 left-4 sm:left-8 z-10">
          <Link href="/events" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Kembali
          </Link>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8">
          <div className="max-w-7xl mx-auto">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium text-white capitalize mb-4"
                  style={{ background: "rgba(59,91,255,0.8)" }}>
              {event.category}
            </span>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-3">{event.title}</h1>
            <div className="flex flex-wrap gap-4 text-gray-300 text-sm">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                </svg>
                {event.event_date ? formatDate(event.event_date) : "TBA"}
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                {event.event_date ? formatTime(event.event_date) : "TBA"}
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0 1 15 0Z" />
                </svg>
                {event.venue_name || "TBA"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* === KONTEN UTAMA === */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* === KOLOM KIRI === */}
          <div className="lg:col-span-2 space-y-10">
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Tentang Event</h2>
              <p className="text-gray-400 leading-relaxed">
                {event.description || "Deskripsi belum tersedia."}
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Lokasi</h2>
              <div className="rounded-xl p-6"
                   style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-blue-400 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0 1 15 0Z" />
                  </svg>
                  <div>
                    <p className="text-white font-semibold">{event.venue_name || "Belum ditentukan"}</p>
                    <p className="text-gray-400 text-sm mt-1">{event.venue_address || ""}</p>
                  </div>
                </div>
              </div>
            </div>

            {performers.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">Performers</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {performers.map((performer) => (
                    <div key={performer.id} className="flex items-center gap-4 rounded-xl p-4"
                         style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                      {performer.image_url ? (
                        <Image src={performer.image_url} alt={performer.name} width={56} height={56} className="rounded-full object-cover" />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
                          {performer.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="text-white font-semibold">{performer.name}</p>
                        <p className="text-gray-400 text-sm capitalize">{performer.role || "Performer"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* === KOLOM KANAN (Tiket) — DIPERBARUI DENGAN CHECKOUT === */}
          <div>
            <div className="sticky top-24 rounded-2xl p-6"
                 style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <h2 className="text-xl font-bold text-white mb-6">Pilih Tiket</h2>

              {/* Error checkout */}
              {checkoutError && (
                <div className="mb-4 p-3 rounded-lg text-sm text-red-300"
                     style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)" }}>
                  {checkoutError}
                </div>
              )}

              {tickets.length === 0 ? (
                <p className="text-gray-400 text-sm">Tiket belum tersedia untuk event ini.</p>
              ) : (
                <div className="space-y-4">
                  {tickets.map((tier) => {
                    const available = tier.quota - tier.sold;
                    const isSoldOut = available <= 0;
                    const isSelected = selectedTier?.id === tier.id;
                    // ↑ BARU: cek apakah tier ini yang dipilih

                    return (
                      <div
                        key={tier.id}
                        onClick={() => {
                          if (!isSoldOut) {
                            setSelectedTier(tier);
                            setQuantity(1); // Reset jumlah saat ganti tier
                            setCheckoutError("");
                          }
                        }}
                        // ↑ BARU: klik tier untuk memilihnya
                        className={`rounded-xl p-4 transition-all ${!isSoldOut ? "cursor-pointer" : ""}`}
                        style={{
                          background: isSelected ? "rgba(59,91,255,0.15)" : isSoldOut ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.08)",
                          border: isSelected ? "2px solid rgba(59,91,255,0.6)" : isSoldOut ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(255,255,255,0.15)",
                          opacity: isSoldOut ? 0.5 : 1,
                        }}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            {/* BARU: Radio button visual */}
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                              isSelected ? "border-blue-500" : "border-gray-500"
                            }`}>
                              {isSelected && <div className="w-2 h-2 rounded-full bg-blue-500"></div>}
                            </div>
                            <h3 className="text-white font-semibold">{tier.name}</h3>
                          </div>
                          <span className="text-blue-400 font-bold">{formatPrice(tier.price)}</span>
                        </div>
                        {tier.description && (
                          <p className="text-gray-400 text-sm mb-2 ml-6">{tier.description}</p>
                        )}
                        <p className="text-xs text-gray-500 ml-6">
                          {isSoldOut ? "Sold Out" : `${available} tiket tersisa`}
                        </p>
                      </div>
                    );
                  })}

                  {/* BARU: QUANTITY SELECTOR — muncul setelah pilih tier */}
                  {selectedTier && (
                    <div className="pt-4 border-t border-white/10 space-y-4">
                      {/* Pilih Jumlah */}
                      <div>
                        <label className="block text-sm text-gray-300 mb-2">Jumlah Tiket</label>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="w-10 h-10 rounded-lg text-white font-bold flex items-center justify-center cursor-pointer"
                            style={{ background: "rgba(255,255,255,0.1)" }}
                          >
                            −
                          </button>
                          <span className="text-white text-lg font-semibold w-8 text-center">{quantity}</span>
                          <button
                            onClick={() => setQuantity(Math.min(selectedTier.quota - selectedTier.sold, quantity + 1, 5))}
                            // ↑ Max 5 tiket per order, atau sisa tiket (mana yang lebih kecil)
                            className="w-10 h-10 rounded-lg text-white font-bold flex items-center justify-center cursor-pointer"
                            style={{ background: "rgba(255,255,255,0.1)" }}
                          >
                            +
                          </button>
                          <span className="text-gray-500 text-xs">(maks 5)</span>
                        </div>
                      </div>

                      {/* Ringkasan Harga */}
                      <div className="rounded-lg p-3" style={{ background: "rgba(255,255,255,0.05)" }}>
                        <div className="flex justify-between text-sm text-gray-400 mb-1">
                          <span>{selectedTier.name} × {quantity}</span>
                          <span>{formatPrice(selectedTier.price * quantity)}</span>
                        </div>
                        <div className="flex justify-between text-white font-bold pt-2 border-t border-white/10">
                          <span>Total</span>
                          <span>{formatPrice(selectedTier.price * quantity)}</span>
                        </div>
                      </div>

                      {/* Tombol Checkout */}
                      <button
                        onClick={handleCheckout}
                        disabled={checkoutLoading}
                        className="w-full py-3 rounded-xl text-white font-semibold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ background: checkoutLoading ? "#555" : "#3b5bff" }}
                      >
                        {checkoutLoading ? "Memproses..." : "Beli Sekarang"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
