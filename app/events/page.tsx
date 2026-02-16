"use client";
// ↑ Karena kita pakai useState, useEffect (interaksi client)

import { useState, useEffect } from "react";
// ↑ useState = simpan data sementara
// ↑ useEffect = jalankan kode saat halaman pertama kali dibuka

import { supabase } from "../lib/supabase";
// ↑ Koneksi ke Supabase

import Image from "next/image";
import Link from "next/link";

// === TIPE DATA EVENT ===
// Mendefinisikan bentuk/struktur data event (TypeScript)
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

// === DAFTAR KATEGORI ===
const categories = ["All", "Concerts", "Sports", "Theater", "Festivals"];

export default function EventsPage() {
  // === VARIABEL STATE ===
  const [events, setEvents] = useState<Event[]>([]);
  // ↑ Menyimpan daftar event dari database (awalnya array kosong [])

  const [loading, setLoading] = useState(true);
  // ↑ Status loading — true saat pertama buka halaman

  const [search, setSearch] = useState("");
  // ↑ Menyimpan kata kunci pencarian

  const [activeCategory, setActiveCategory] = useState("All");
  // ↑ Kategori yang sedang dipilih (awalnya "All")

  // === useEffect: AMBIL DATA SAAT HALAMAN DIBUKA ===
  // useEffect jalan OTOMATIS saat halaman pertama kali di-render
  // dan jalan LAGI setiap kali search atau activeCategory berubah
  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);

      // Mulai query: ambil semua data dari tabel "events"
      let query = supabase.from("events").select("*");

      // Kalau ada pencarian, filter berdasarkan judul
      if (search) {
        query = query.ilike("title", `%${search}%`);
        // ↑ ilike = case-insensitive search
        // ↑ %search% = cari kata yang MENGANDUNG search
        // Contoh: search="rock" → cocok dengan "Rock Festival", "Indie Rock Night"
      }

      // Kalau kategori bukan "All", filter berdasarkan kategori
      if (activeCategory !== "All") {
        query = query.eq("category", activeCategory.toLowerCase());
        // ↑ eq = exact match (harus sama persis)
        // ↑ toLowerCase() karena di database tersimpan huruf kecil
      }

      // Urutkan berdasarkan tanggal event (yang terdekat duluan)
      query = query.order("event_date", { ascending: true });

      // Jalankan query dan ambil hasilnya
      const { data, error } = await query;

      if (error) {
        console.error("Error fetching events:", error);
      } else {
        setEvents(data || []);
        // ↑ Simpan data ke state. Kalau null, pakai array kosong []
      }

      setLoading(false);
    }

    fetchEvents();
  }, [search, activeCategory]);
  // ↑ [search, activeCategory] = "dependency array"
  // Artinya: jalankan ulang fetchEvents setiap kali search atau activeCategory berubah

  // === FUNGSI FORMAT TANGGAL ===
  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    // ↑ Contoh output: "Sabtu, 15 Maret 2026"
  }

  // === TAMPILAN ===
  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8"
         style={{ background: "#0a0a14" }}>
      <div className="max-w-7xl mx-auto">

        {/* === HEADER === */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Jelajahi Event</h1>
          <p className="text-gray-400 text-lg">Temukan event menarik di sekitar Anda</p>
        </div>

        {/* === SEARCH BAR === */}
        <div className="max-w-xl mx-auto mb-8">
          <div className="relative">
            {/* Ikon search */}
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
                 fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round"
                    d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari event..."
              className="w-full pl-12 pr-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}
            />
          </div>
        </div>

        {/* === FILTER KATEGORI === */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
                activeCategory === cat
                  ? "bg-blue-600 text-white"           // Kategori aktif = biru
                  : "text-gray-400 hover:text-white"    // Kategori tidak aktif = abu-abu
              }`}
              style={activeCategory !== cat ? {
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.1)"
              } : {}}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* === LOADING STATE === */}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-400 mt-4">Memuat event...</p>
          </div>
        )}

        {/* === EMPTY STATE (tidak ada event) === */}
        {!loading && events.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">Belum ada event yang tersedia</p>
            <p className="text-gray-500 mt-2">Coba ubah filter atau kata kunci pencarian</p>
          </div>
        )}

        {/* === GRID EVENT CARDS === */}
        {!loading && events.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.slug}`}
                className="group rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                {/* Gambar Event */}
                <div className="relative h-48 overflow-hidden">
                  {event.image_url ? (
                    <Image
                      src={event.image_url}
                      alt={event.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                      <span className="text-white text-4xl">🎪</span>
                    </div>
                  )}
                  {/* Badge Kategori */}
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium text-white capitalize"
                        style={{ background: "rgba(59,91,255,0.8)" }}>
                    {event.category}
                  </span>
                </div>

                {/* Info Event */}
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
                    {event.title}
                  </h3>

                  {/* Lokasi */}
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0 1 15 0Z" />
                    </svg>
                    {event.venue_name || "Lokasi belum ditentukan"}
                  </div>

                  {/* Tanggal */}
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                    </svg>
                    {event.event_date ? formatDate(event.event_date) : "Tanggal belum ditentukan"}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
