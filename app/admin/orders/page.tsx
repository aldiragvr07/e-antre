"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

type Order = {
  id: string;
  quantity: number;
  total_price: number;
  status: string;
  created_at: string;
  user_id: string;
  events: { title: string } | null;
  ticket_tiers: { name: string; price: number } | null;
};

const statusFilters = ["all", "paid", "pending", "cancelled", "refunded"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [activeFilter]);

  async function fetchOrders() {
    setLoading(true);

    let query = supabase
      .from("orders")
      .select("*, events(title), ticket_tiers(name, price)")
      .order("created_at", { ascending: false });

    if (activeFilter !== "all") {
      query = query.eq("status", activeFilter);
    }

    const { data } = await query;
    setOrders(data || []);
    setLoading(false);
  }

  async function handleStatusChange(orderId: string, newStatus: string) {
    setUpdatingId(orderId);

    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) {
      alert("Gagal update status: " + error.message);
    } else {
      setOrders(orders.map((o) => o.id === orderId ? { ...o, status: newStatus } : o));
    }

    setUpdatingId(null);
  }

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
      case "refunded": return "text-purple-400 bg-purple-400/10";
      default: return "text-gray-400 bg-gray-400/10";
    }
  }

  // Hitung total revenue dari order yang ditampilkan
  const totalRevenue = orders
    .filter((o) => o.status === "paid")
    .reduce((sum, o) => sum + o.total_price, 0);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Kelola Orders</h1>
        <p className="text-gray-400 mt-1">{orders.length} order ditemukan</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="rounded-xl p-4"
             style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <p className="text-gray-400 text-sm">Total Orders</p>
          <p className="text-2xl font-bold text-white mt-1">{orders.length}</p>
        </div>
        <div className="rounded-xl p-4"
             style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <p className="text-gray-400 text-sm">Revenue (Paid)</p>
          <p className="text-2xl font-bold text-green-400 mt-1">{formatPrice(totalRevenue)}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {statusFilters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer capitalize ${
              activeFilter === filter
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
            style={activeFilter !== filter ? {
              background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)"
            } : {}}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 rounded-xl"
             style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <p className="text-gray-400">Tidak ada order dengan filter ini</p>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden"
             style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase border-b border-white/5">
                  <th className="px-6 py-3">Event</th>
                  <th className="px-6 py-3">Tiket</th>
                  <th className="px-6 py-3">Qty</th>
                  <th className="px-6 py-3">Total</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Tanggal</th>
                  <th className="px-6 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.map((order) => (
                  <tr key={order.id} className="text-sm hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-white font-medium max-w-[200px] truncate">
                      {order.events?.title || "-"}
                    </td>
                    <td className="px-6 py-4 text-gray-400">{order.ticket_tiers?.name || "-"}</td>
                    <td className="px-6 py-4 text-gray-400">{order.quantity}</td>
                    <td className="px-6 py-4 text-white font-medium">{formatPrice(order.total_price)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">{formatDate(order.created_at)}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          disabled={updatingId === order.id}
                          className="text-xs rounded-lg px-2 py-1.5 text-gray-300 outline-none cursor-pointer disabled:opacity-50"
                          style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}
                        >
                          <option value="paid" className="bg-gray-900">Paid</option>
                          <option value="pending" className="bg-gray-900">Pending</option>
                          <option value="cancelled" className="bg-gray-900">Cancelled</option>
                          <option value="refunded" className="bg-gray-900">Refunded</option>
                        </select>
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
