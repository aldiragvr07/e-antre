"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
// ↑ Tipe data User dari Supabase (untuk TypeScript)

export default function DashboardPage() {
  // === STATE ===
  const [user, setUser] = useState<User | null>(null);
  // ↑ Data user yang sedang login (null = belum login / loading)

  const [loading, setLoading] = useState(true);

  const [fullName, setFullName] = useState("");
  const [editingProfile, setEditingProfile] = useState(false);
  // ↑ Toggle mode edit profil

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Data pesanan/tiket
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Tab aktif: "tickets" atau "profile"
  const [activeTab, setActiveTab] = useState("tickets");

  const router = useRouter();

  // === CEK APAKAH USER SUDAH LOGIN ===
  useEffect(() => {
    async function checkUser() {
      // Ambil data user yang sedang login
      const { data: { user } } = await supabase.auth.getUser();
      // ↑ getUser() = cek siapa yang sedang login

      if (!user) {
        // Kalau belum login → redirect ke halaman login
        router.push("/login");
        return;
      }

      setUser(user);
      setFullName(user.user_metadata?.full_name || "");
      // ↑ user_metadata = data tambahan yang disimpan saat signUp
      // (full_name yang kita kirim di options.data)

      setLoading(false);

      // Ambil pesanan user
      fetchOrders(user.id);
    }

    checkUser();
  }, [router]);

  // === AMBIL PESANAN USER ===
  async function fetchOrders(userId: string) {
    setOrdersLoading(true);

    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        events ( title, slug, image_url, event_date, venue_name ),
        ticket_tiers ( name, price )
      `)
      // ↑ SELECT dengan relasi! Mengambil data dari tabel orders
      //   PLUS data event dan ticket_tier yang terkait
      //   Ini seperti SQL JOIN tapi lebih simpel
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!error) {
      setOrders(data || []);
    }

    setOrdersLoading(false);
  }

  // === FUNGSI UPDATE PROFIL ===
  async function handleUpdateProfile() {
    if (!user) return;

    setSaving(true);
    setMessage("");

    // Update data user di Supabase Auth
    const { error } = await supabase.auth.updateUser({
      data: { full_name: fullName },
    });

    setSaving(false);

    if (error) {
      setMessage("Gagal menyimpan: " + error.message);
    } else {
      setMessage("Profil berhasil diperbarui!");
      setEditingProfile(false);
    }
  }

  // === FUNGSI LOGOUT ===
  async function handleLogout() {
    await supabase.auth.signOut();
    // ↑ Hapus session user
    router.push("/");
    // ↑ Redirect ke halaman utama
  }

  // === FORMAT TANGGAL ===
  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("id-ID", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  // === FORMAT HARGA ===
  function formatPrice(price: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  }

  // === WARNA STATUS ORDER ===
  function getStatusColor(status: string) {
    switch (status) {
      case "paid": return { bg: "rgba(34,197,94,0.15)", text: "text-green-300", border: "rgba(34,197,94,0.3)" };
      case "pending": return { bg: "rgba(234,179,8,0.15)", text: "text-yellow-300", border: "rgba(234,179,8,0.3)" };
      case "cancelled": return { bg: "rgba(239,68,68,0.15)", text: "text-red-300", border: "rgba(239,68,68,0.3)" };
      case "refunded": return { bg: "rgba(168,85,247,0.15)", text: "text-purple-300", border: "rgba(168,85,247,0.3)" };
      default: return { bg: "rgba(255,255,255,0.1)", text: "text-gray-300", border: "rgba(255,255,255,0.2)" };
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

  // === TAMPILAN UTAMA ===
  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8" style={{ background: "#0a0a14" }}>
      <div className="max-w-4xl mx-auto">

        {/* === HEADER PROFIL === */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
              {(user?.user_metadata?.full_name || user?.email || "U").charAt(0).toUpperCase()}
              {/* ↑ Ambil huruf pertama dari nama/email sebagai avatar */}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                {user?.user_metadata?.full_name || "User"}
              </h1>
              <p className="text-gray-400 text-sm">{user?.email}</p>
            </div>
          </div>

          {/* Tombol Logout */}
          <button
            onClick={handleLogout}
            className="px-5 py-2 rounded-xl text-sm font-medium text-red-400 transition-all cursor-pointer hover:text-red-300"
            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}
          >
            Logout
          </button>
        </div>

        {/* === TABS === */}
        <div className="flex gap-1 mb-8 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.05)" }}>
          <button
            onClick={() => setActiveTab("tickets")}
            className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              activeTab === "tickets"
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            🎫 Tiket Saya
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              activeTab === "profile"
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            👤 Profil
          </button>
        </div>

        {/* === TAB: TIKET SAYA === */}
        {activeTab === "tickets" && (
          <div>
            {ordersLoading ? (
              <div className="text-center py-16">
                <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-400 mt-4">Memuat tiket...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16 rounded-2xl"
                   style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <span className="text-5xl mb-4 block">🎫</span>
                <h3 className="text-xl font-semibold text-white mb-2">Belum Ada Tiket</h3>
                <p className="text-gray-400 mb-6">Anda belum membeli tiket event apapun</p>
                <Link href="/events"
                      className="inline-block px-6 py-3 rounded-xl text-white font-semibold"
                      style={{ background: "#3b5bff" }}>
                  Jelajahi Event
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  const statusColor = getStatusColor(order.status);
                  return (
                    <div key={order.id} className="rounded-xl p-5 transition-all"
                         style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                      <div className="flex flex-col sm:flex-row gap-4">
                        {/* Info Event */}
                        <div className="flex-1">
                          <Link href={`/events/${order.events?.slug}`}
                                className="text-lg font-semibold text-white hover:text-blue-400 transition-colors">
                            {order.events?.title || "Event"}
                          </Link>
                          <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-400">
                            <span>📅 {order.events?.event_date ? formatDate(order.events.event_date) : "TBA"}</span>
                            <span>📍 {order.events?.venue_name || "TBA"}</span>
                          </div>
                          <div className="mt-2 text-sm text-gray-400">
                            <span>🎫 {order.ticket_tiers?.name} × {order.quantity}</span>
                          </div>
                        </div>

                        {/* Harga & Status */}
                        <div className="text-right">
                          <p className="text-white font-bold text-lg">{formatPrice(order.total_price)}</p>
                          <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium capitalize ${statusColor.text}`}
                                style={{ background: statusColor.bg, border: `1px solid ${statusColor.border}` }}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* === TAB: PROFIL === */}
        {activeTab === "profile" && (
          <div className="rounded-2xl p-8"
               style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>

            {/* Pesan sukses/error */}
            {message && (
              <div className={`mb-6 p-3 rounded-lg text-sm ${
                message.includes("berhasil") ? "text-green-300" : "text-red-300"
              }`} style={{
                background: message.includes("berhasil") ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                border: `1px solid ${message.includes("berhasil") ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`
              }}>
                {message}
              </div>
            )}

            <div className="space-y-6">
              {/* Email (tidak bisa diubah) */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="w-full px-4 py-3 rounded-xl text-gray-500 cursor-not-allowed"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
                />
                <p className="text-gray-500 text-xs mt-1">Email tidak dapat diubah</p>
              </div>

              {/* Nama Lengkap */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nama Lengkap</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={!editingProfile}
                  placeholder="Masukkan nama lengkap"
                  className={`w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none transition-all ${
                    editingProfile ? "focus:ring-2 focus:ring-blue-500" : "cursor-not-allowed opacity-60"
                  }`}
                  style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}
                />
              </div>

              {/* Member Sejak */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Member Sejak</label>
                <p className="text-gray-400">
                  {user?.created_at ? formatDate(user.created_at) : "-"}
                </p>
              </div>

              {/* Tombol Edit/Simpan */}
              <div className="flex gap-3 pt-4">
                {editingProfile ? (
                  <>
                    <button
                      onClick={handleUpdateProfile}
                      disabled={saving}
                      className="px-6 py-3 rounded-xl text-white font-semibold transition-all cursor-pointer disabled:opacity-50"
                      style={{ background: "#3b5bff" }}
                    >
                      {saving ? "Menyimpan..." : "Simpan"}
                    </button>
                    <button
                      onClick={() => {
                        setEditingProfile(false);
                        setFullName(user?.user_metadata?.full_name || "");
                        // ↑ Reset nama ke nilai awal jika batal edit
                      }}
                      className="px-6 py-3 rounded-xl text-gray-400 font-medium transition-all cursor-pointer"
                      style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}
                    >
                      Batal
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setEditingProfile(true)}
                    className="px-6 py-3 rounded-xl text-white font-semibold transition-all cursor-pointer"
                    style={{ background: "#3b5bff" }}
                  >
                    Edit Profil
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
