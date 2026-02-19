"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../../lib/supabase";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

const categories = ["concerts", "sports", "theater", "festivals"];

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

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

  // Ambil data event yang mau diedit
  useEffect(() => {
    async function fetchEvent() {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .single();

      if (error || !data) {
        router.push("/admin/events");
        return;
      }

      setTitle(data.title || "");
      setSlug(data.slug || "");
      setDescription(data.description || "");
      setCategory(data.category || "concerts");
      setImageUrl(data.image_url || "");
      setVenueName(data.venue_name || "");
      setVenueAddress(data.venue_address || "");
      // Format datetime-local
      if (data.event_date) {
        const d = new Date(data.event_date);
        setEventDate(d.toISOString().slice(0, 16));
      }
      setLoading(false);
    }

    fetchEvent();
  }, [eventId, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const { error } = await supabase
      .from("events")
      .update({
        title,
        slug,
        description,
        category,
        image_url: imageUrl || null,
        venue_name: venueName || null,
        venue_address: venueAddress || null,
        event_date: eventDate || null,
      })
      .eq("id", eventId);

    setSaving(false);

    if (error) {
      setError("Gagal menyimpan: " + error.message);
    } else {
      router.push("/admin/events");
    }
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

      {error && (
        <div className="mb-6 p-3 rounded-lg text-sm text-red-300"
             style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)" }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl p-6 space-y-5"
             style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Judul Event *</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required
                   className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                   style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Slug (URL)</label>
            <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)}
                   className="w-full px-4 py-3 rounded-xl text-gray-400 outline-none"
                   style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Kategori *</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}>
              {categories.map((cat) => (
                <option key={cat} value={cat} className="bg-gray-900">{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Deskripsi</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4}
                      className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Image URL</label>
            <input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
                   className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500"
                   style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }} />
          </div>
        </div>

        <div className="rounded-xl p-6 space-y-5"
             style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <h3 className="text-lg font-semibold text-white">Informasi Venue</h3>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Nama Venue</label>
            <input type="text" value={venueName} onChange={(e) => setVenueName(e.target.value)}
                   className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500"
                   style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Alamat Venue</label>
            <input type="text" value={venueAddress} onChange={(e) => setVenueAddress(e.target.value)}
                   className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500"
                   style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Tanggal & Waktu</label>
            <input type="datetime-local" value={eventDate} onChange={(e) => setEventDate(e.target.value)}
                   className="w-full px-4 py-3 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500"
                   style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }} />
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saving}
                  className="px-8 py-3 rounded-xl text-white font-semibold cursor-pointer disabled:opacity-50"
                  style={{ background: saving ? "#555" : "#3b5bff" }}>
            {saving ? "Menyimpan..." : "Update Event"}
          </button>
          <Link href="/admin/events"
                className="px-6 py-3 rounded-xl text-gray-400 font-medium"
                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}>
            Batal
          </Link>
        </div>
      </form>
    </div>
  );
}
