"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import Link from "next/link";

// === TIPE STATISTIK ===
type Stats = {
  totalEvents: number;
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
};

type RecentOrder = {
  id: string;
  quantity: number;
  total_price: number;
  status: string;
  created_at: string;
  events: { title: string } | null;
  ticket_tiers: { name: string } | null;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ totalEvents: 0, totalOrders: 0, totalRevenue: 0, totalUsers: 0 });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      // Ambil semua data secara paralel (lebih cepat)
      const [eventsRes, ordersRes] = await Promise.all([
        supabase.from("events").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("*", { count: "exact" }),
      ]);

      // Hitung total revenue dari semua order yang paid
      const paidOrders = (ordersRes.data || []).filter((o: any) => o.status === "paid");
      const totalRevenue = paidOrders.reduce((sum: number, o: any) => sum + (o.total_price || 0), 0);

      setStats({
        totalEvents: eventsRes.count || 0,
        totalOrders: ordersRes.count || 0,
        totalRevenue,
        totalUsers: 0, // Supabase Auth users tidak bisa di-query dari client
      });

      // Ambil 5 order terbaru
      const { data: recent } = await supabase
        .from("orders")
        .select("*, events(title), ticket_tiers(name)")
        .order("created_at", { ascending: false })
        .limit(5);

      setRecentOrders(recent || []);
      setLoading(false);
    }

    fetchStats();
  }, []);

  function formatPrice(price: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency", currency: "IDR", minimumFractionDigits: 0,
    }).format(price);
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
  }

  function getStatusColor(status: string) {
    switch (status) {
      case "paid": return "text-green-400 bg-green-400/10";
      case "pending": return "text-yellow-400 bg-yellow-400/10";
      case "cancelled": return "text-red-400 bg-red-400/10";
      default: return "text-gray-400 bg-gray-400/10";
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // === STAT CARDS DATA ===
  const statCards = [
    { label: "Total Events", value: stats.totalEvents, icon: "📅", color: "from-blue-600 to-blue-400" },
    { label: "Total Orders", value: stats.totalOrders, icon: "🛒", color: "from-purple-600 to-purple-400" },
    { label: "Total Revenue", value: formatPrice(stats.totalRevenue), icon: "💰", color: "from-green-600 to-green-400" },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">Overview statistik E-ANTRE</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {statCards.map((stat) => (
          <div key={stat.label} className="rounded-xl p-5"
               style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{stat.icon}</span>
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} opacity-20`}></div>
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-gray-400 text-sm mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 mb-10">
        <Link href="/admin/events/new"
              className="px-5 py-2.5 rounded-xl text-white text-sm font-medium"
              style={{ background: "#3b5bff" }}>
          + Tambah Event Baru
        </Link>
        <Link href="/admin/events"
              className="px-5 py-2.5 rounded-xl text-gray-300 text-sm font-medium"
              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}>
          Kelola Events
        </Link>
        <Link href="/admin/orders"
              className="px-5 py-2.5 rounded-xl text-gray-300 text-sm font-medium"
              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}>
          Lihat Orders
        </Link>
      </div>

      {/* Recent Orders */}
      <div className="rounded-xl overflow-hidden"
           style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
        <div className="px-6 py-4 border-b border-white/5">
          <h2 className="text-lg font-semibold text-white">Order Terbaru</h2>
        </div>

        {recentOrders.length === 0 ? (
          <div className="px-6 py-10 text-center text-gray-400">Belum ada order</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase">
                  <th className="px-6 py-3">Event</th>
                  <th className="px-6 py-3">Tiket</th>
                  <th className="px-6 py-3">Qty</th>
                  <th className="px-6 py-3">Total</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Tanggal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="text-sm">
                    <td className="px-6 py-4 text-white font-medium">{order.events?.title || "-"}</td>
                    <td className="px-6 py-4 text-gray-400">{order.ticket_tiers?.name || "-"}</td>
                    <td className="px-6 py-4 text-gray-400">{order.quantity}</td>
                    <td className="px-6 py-4 text-white font-medium">{formatPrice(order.total_price)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">{formatDate(order.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
