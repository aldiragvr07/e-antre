"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import Link from "next/link";

type Event = {
  id: string;
  title: string;
  slug: string;
  category: string;
  event_date: string;
  venue_name: string;
  created_at: string;
};

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    setLoading(true);
    const { data } = await supabase
      .from("events")
      .select("*")
      .order("created_at", { ascending: false });

    setEvents(data || []);
    setLoading(false);
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Yakin ingin menghapus event "${title}"?\n\nIni juga akan menghapus tiket dan performer terkait.`)) {
      return;
    }

    setDeleting(id);

    // Hapus data terkait dulu (foreign keys)
    await supabase.from("performers").delete().eq("event_id", id);
    await supabase.from("ticket_tiers").delete().eq("event_id", id);
    await supabase.from("orders").delete().eq("event_id", id);

    // Lalu hapus event
    const { error } = await supabase.from("events").delete().eq("id", id);

    if (error) {
      alert("Gagal menghapus: " + error.message);
    } else {
      setEvents(events.filter((e) => e.id !== id));
    }

    setDeleting(null);
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric", month: "short", year: "numeric",
    });
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Kelola Events</h1>
          <p className="text-gray-400 mt-1">{events.length} event terdaftar</p>
        </div>
        <Link href="/admin/events/new"
              className="px-5 py-2.5 rounded-xl text-white text-sm font-medium text-center"
              style={{ background: "#3b5bff" }}>
          + Tambah Event Baru
        </Link>
      </div>

      {/* Table */}
      {events.length === 0 ? (
        <div className="text-center py-16 rounded-xl"
             style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <p className="text-gray-400">Belum ada event. Buat event pertama Anda!</p>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden"
             style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase border-b border-white/5">
                  <th className="px-6 py-3">Event</th>
                  <th className="px-6 py-3">Kategori</th>
                  <th className="px-6 py-3">Venue</th>
                  <th className="px-6 py-3">Tanggal Event</th>
                  <th className="px-6 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {events.map((event) => (
                  <tr key={event.id} className="text-sm hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <Link href={`/events/${event.slug}`} className="text-white font-medium hover:text-blue-400 transition-colors">
                        {event.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium capitalize text-blue-300 bg-blue-400/10">
                        {event.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400">{event.venue_name || "-"}</td>
                    <td className="px-6 py-4 text-gray-400">
                      {event.event_date ? formatDate(event.event_date) : "-"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/events/${event.id}`}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium text-blue-400 transition-colors hover:bg-blue-400/10">
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(event.id, event.title)}
                          disabled={deleting === event.id}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 transition-colors hover:bg-red-400/10 cursor-pointer disabled:opacity-50"
                        >
                          {deleting === event.id ? "..." : "Hapus"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
