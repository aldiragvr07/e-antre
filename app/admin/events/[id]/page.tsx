"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

const categories = ["concerts", "sports", "theater", "festivals"];

type TicketTier = {
  id?: string;
  name: string;
  description: string;
  price: number;
  quota: number;
  sold: number;
  isNew?: boolean; // Flag untuk tier yang belum disimpan
};

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

  // Event fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("concerts");
  const [imageUrl, setImageUrl] = useState("");
  const [venueName, setVenueName] = useState("");
  const [venueAddress, setVenueAddress] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Ticket tiers
  const [tickets, setTickets] = useState<TicketTier[]>([]);
  const [savingTickets, setSavingTickets] = useState(false);

  // Ambil data event + tiket
  useEffect(() => {
    async function fetchEvent() {
      const { data, error } = await supabase
        .from("events").select("*").eq("id", eventId).single();

      if (error || !data) { router.push("/admin/events"); return; }

      setTitle(data.title || "");
      setSlug(data.slug || "");
      setDescription(data.description || "");
      setCategory(data.category || "concerts");
      setImageUrl(data.image_url || "");
      setVenueName(data.venue_name || "");
      setVenueAddress(data.venue_address || "");
      if (data.event_date) {
        setEventDate(new Date(data.event_date).toISOString().slice(0, 16));
      }

      // Ambil ticket tiers
      const { data: ticketData } = await supabase
        .from("ticket_tiers").select("*").eq("event_id", eventId).order("price", { ascending: true });

      setTickets(ticketData || []);
      setLoading(false);
    }
    fetchEvent();
  }, [eventId, router]);

  // === SIMPAN EVENT ===
  async function handleSubmitEvent(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSuccessMsg("");
    setSaving(true);

    const { error } = await supabase.from("events").update({
      title, slug, description, category,
      image_url: imageUrl || null,
      venue_name: venueName || null,
      venue_address: venueAddress || null,
      event_date: eventDate || null,
    }).eq("id", eventId);

    setSaving(false);
    if (error) setError("Gagal menyimpan: " + error.message);
    else setSuccessMsg("Event berhasil diperbarui!");
  }

  // === TICKET TIER FUNCTIONS ===
  function addNewTier() {
    setTickets([...tickets, { name: "", description: "", price: 0, quota: 100, sold: 0, isNew: true }]);
  }

  function updateTier(index: number, field: string, value: string | number) {
    const updated = [...tickets];
    (updated[index] as any)[field] = value;
    setTickets(updated);
  }

  function removeTier(index: number) {
    setTickets(tickets.filter((_, i) => i !== index));
  }

  async function handleSaveTickets() {
    setSavingTickets(true);
    setError(""); setSuccessMsg("");

    // Hapus semua tier lama, lalu insert ulang
    await supabase.from("ticket_tiers").delete().eq("event_id", eventId);

    if (tickets.length > 0) {
      const toInsert = tickets.map((t) => ({
        event_id: eventId,
        name: t.name,
        description: t.description,
        price: Number(t.price),
        quota: Number(t.quota),
        sold: Number(t.sold),
      }));

      const { error } = await supabase.from("ticket_tiers").insert(toInsert);
      if (error) {
        setError("Gagal menyimpan tiket: " + error.message);
        setSavingTickets(false);
        return;
      }
    }

    // Refresh data
    const { data } = await supabase
      .from("ticket_tiers").select("*").eq("event_id", eventId).order("price", { ascending: true });
    setTickets(data || []);

    setSuccessMsg("Tiket berhasil disimpan!");
    setSavingTickets(false);
  }

  async function handleDeleteTier(index: number, tierId?: string) {
    if (!confirm("Yakin ingin menghapus tier tiket ini?")) return;

    if (tierId) {
      await supabase.from("ticket_tiers").delete().eq("id", tierId);
    }
    removeTier(index);
  }

  function formatPrice(price: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency", currency: "IDR", minimumFractionDigits: 0,
    }).format(price);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/events" className="text-gray-400 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-white">Edit Event</h1>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-6 p-3 rounded-lg text-sm text-red-300"
             style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)" }}>
          {error}
        </div>
      )}
      {successMsg && (
        <div className="mb-6 p-3 rounded-lg text-sm text-green-300"
             style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)" }}>
          {successMsg}
        </div>
      )}

      {/* ==================== */}
      {/* SECTION 1: EVENT INFO */}
      {/* ==================== */}
      <form onSubmit={handleSubmitEvent} className="space-y-6 mb-12">
        <div className="rounded-xl p-6 space-y-5"
             style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <h3 className="text-lg font-semibold text-white">📅 Informasi Event</h3>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Judul Event *</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required
                   className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500"
                   style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Slug (URL)</label>
            <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)}
                   className="w-full px-4 py-3 rounded-xl text-gray-400 outline-none"
                   style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Kategori</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl text-white outline-none"
                      style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}>
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-gray-900">{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Tanggal & Waktu</label>
              <input type="datetime-local" value={eventDate} onChange={(e) => setEventDate(e.target.value)}
                     className="w-full px-4 py-3 rounded-xl text-white outline-none"
                     style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Deskripsi</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
                      className="w-full px-4 py-3 rounded-xl text-white outline-none resize-none"
                      style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Image URL</label>
            <input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
                   className="w-full px-4 py-3 rounded-xl text-white outline-none"
                   style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Nama Venue</label>
              <input type="text" value={venueName} onChange={(e) => setVenueName(e.target.value)}
                     className="w-full px-4 py-3 rounded-xl text-white outline-none"
                     style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Alamat Venue</label>
              <input type="text" value={venueAddress} onChange={(e) => setVenueAddress(e.target.value)}
                     className="w-full px-4 py-3 rounded-xl text-white outline-none"
                     style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }} />
            </div>
          </div>
        </div>

        <button type="submit" disabled={saving}
                className="px-8 py-3 rounded-xl text-white font-semibold cursor-pointer disabled:opacity-50"
                style={{ background: saving ? "#555" : "#3b5bff" }}>
          {saving ? "Menyimpan..." : "Update Event"}
        </button>
      </form>

      {/* ======================== */}
      {/* SECTION 2: TICKET TIERS  */}
      {/* ======================== */}
      <div className="rounded-xl p-6"
           style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">🎫 Tier Tiket</h3>
          <button onClick={addNewTier}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-blue-400 cursor-pointer hover:bg-blue-400/10 transition-colors">
            + Tambah Tier
          </button>
        </div>

        {tickets.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm">Belum ada tier tiket. Klik "+ Tambah Tier" untuk menambahkan.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((tier, index) => (
              <div key={tier.id || `new-${index}`} className="rounded-xl p-4"
                   style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Nama Tier *</label>
                    <input type="text" value={tier.name}
                           onChange={(e) => updateTier(index, "name", e.target.value)}
                           placeholder="misal: General Admission, VIP, VVIP"
                           className="w-full px-3 py-2 rounded-lg text-white text-sm outline-none"
                           style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Deskripsi</label>
                    <input type="text" value={tier.description}
                           onChange={(e) => updateTier(index, "description", e.target.value)}
                           placeholder="misal: Akses ke area umum"
                           className="w-full px-3 py-2 rounded-lg text-white text-sm outline-none"
                           style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }} />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Harga (Rp)</label>
                    <input type="number" value={tier.price} min={0}
                           onChange={(e) => updateTier(index, "price", Number(e.target.value))}
                           className="w-full px-3 py-2 rounded-lg text-white text-sm outline-none"
                           style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Kuota</label>
                    <input type="number" value={tier.quota} min={1}
                           onChange={(e) => updateTier(index, "quota", Number(e.target.value))}
                           className="w-full px-3 py-2 rounded-lg text-white text-sm outline-none"
                           style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Terjual</label>
                    <input type="number" value={tier.sold} min={0}
                           onChange={(e) => updateTier(index, "sold", Number(e.target.value))}
                           className="w-full px-3 py-2 rounded-lg text-gray-400 text-sm outline-none"
                           style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }} />
                  </div>
                </div>

                {/* Preview harga */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                  <span className="text-xs text-gray-500">
                    {formatPrice(tier.price)} · {tier.quota - tier.sold} tersisa
                  </span>
                  <button onClick={() => handleDeleteTier(index, tier.id)}
                          className="text-xs text-red-400 hover:text-red-300 cursor-pointer">
                    Hapus tier
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Save Tickets Button */}
        <div className="mt-6">
          <button onClick={handleSaveTickets} disabled={savingTickets}
                  className="px-6 py-2.5 rounded-xl text-white text-sm font-semibold cursor-pointer disabled:opacity-50"
                  style={{ background: savingTickets ? "#555" : "#3b5bff" }}>
            {savingTickets ? "Menyimpan..." : "Simpan Tiket"}
          </button>
        </div>
      </div>
    </div>
  );
}
