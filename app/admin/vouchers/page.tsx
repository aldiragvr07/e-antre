"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

type Voucher = {
  id: string;
  code: string;
  discount_percent: number;
  max_usage: number;
  used_count: number;
  is_active: boolean;
  valid_from: string;
  valid_until: string | null;
  created_at: string;
};

export default function AdminVouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Form state untuk tambah voucher baru
  const [showForm, setShowForm] = useState(false);
  const [code, setCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(10);
  const [maxUsage, setMaxUsage] = useState(100);
  const [validUntil, setValidUntil] = useState("");

  useEffect(() => {
    fetchVouchers();
  }, []);

  async function fetchVouchers() {
    setLoading(true);
    const { data } = await supabase
      .from("vouchers")
      .select("*")
      .order("created_at", { ascending: false });

    setVouchers(data || []);
    setLoading(false);
  }

  // === TAMBAH VOUCHER BARU ===
  async function handleAddVoucher(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSuccessMsg("");
    setSaving(true);

    const { error } = await supabase.from("vouchers").insert({
      code: code.toUpperCase().trim(),
      discount_percent: discountPercent,
      max_usage: maxUsage,
      used_count: 0,
      is_active: true,
      valid_until: validUntil || null,
    });

    setSaving(false);

    if (error) {
      if (error.message.includes("duplicate")) {
        setError("Kode voucher sudah ada! Gunakan kode lain.");
      } else {
        setError("Gagal menambahkan voucher: " + error.message);
      }
    } else {
      setSuccessMsg("Voucher berhasil ditambahkan!");
      setCode(""); setDiscountPercent(10); setMaxUsage(100); setValidUntil("");
      setShowForm(false);
      fetchVouchers();
    }
  }

  // === TOGGLE AKTIF/NONAKTIF ===
  async function toggleActive(id: string, currentStatus: boolean) {
    const { error } = await supabase
      .from("vouchers")
      .update({ is_active: !currentStatus })
      .eq("id", id);

    if (!error) {
      setVouchers(vouchers.map((v) =>
        v.id === id ? { ...v, is_active: !currentStatus } : v
      ));
    }
  }

  // === HAPUS VOUCHER ===
  async function handleDelete(id: string, code: string) {
    if (!confirm(`Yakin ingin menghapus voucher "${code}"?`)) return;

    const { error } = await supabase.from("vouchers").delete().eq("id", id);
    if (!error) {
      setVouchers(vouchers.filter((v) => v.id !== id));
    }
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
          <h1 className="text-2xl font-bold text-white">Kelola Voucher</h1>
          <p className="text-gray-400 mt-1">{vouchers.length} voucher terdaftar</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
                className="px-5 py-2.5 rounded-xl text-white text-sm font-medium cursor-pointer"
                style={{ background: "#3b5bff" }}>
          {showForm ? "Tutup Form" : "+ Tambah Voucher"}
        </button>
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

      {/* Form Tambah Voucher */}
      {showForm && (
        <form onSubmit={handleAddVoucher} className="rounded-xl p-6 mb-8 space-y-4"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <h3 className="text-lg font-semibold text-white">Buat Voucher Baru</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Kode Voucher *</label>
              <input type="text" value={code} onChange={(e) => setCode(e.target.value)}
                     required placeholder="misal: DISKON20"
                     className="w-full px-4 py-3 rounded-xl text-white uppercase placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500"
                     style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }} />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Diskon (%) *</label>
              <input type="number" value={discountPercent}
                     onChange={(e) => setDiscountPercent(Number(e.target.value))}
                     min={1} max={100} required
                     className="w-full px-4 py-3 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500"
                     style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Maks Penggunaan *</label>
              <input type="number" value={maxUsage}
                     onChange={(e) => setMaxUsage(Number(e.target.value))}
                     min={1} required
                     className="w-full px-4 py-3 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500"
                     style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }} />
              <p className="text-xs text-gray-500 mt-1">Berapa kali voucher ini bisa digunakan total</p>
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Berlaku Sampai</label>
              <input type="date" value={validUntil}
                     onChange={(e) => setValidUntil(e.target.value)}
                     className="w-full px-4 py-3 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500"
                     style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }} />
              <p className="text-xs text-gray-500 mt-1">Kosongkan jika tanpa batas waktu</p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
                    className="px-6 py-2.5 rounded-xl text-white font-semibold cursor-pointer disabled:opacity-50"
                    style={{ background: saving ? "#555" : "#3b5bff" }}>
              {saving ? "Menyimpan..." : "Buat Voucher"}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
                    className="px-6 py-2.5 rounded-xl text-gray-400 font-medium cursor-pointer"
                    style={{ background: "rgba(255,255,255,0.08)" }}>
              Batal
            </button>
          </div>
        </form>
      )}

      {/* Tabel Voucher */}
      {vouchers.length === 0 ? (
        <div className="text-center py-16 rounded-xl"
             style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <p className="text-gray-400">Belum ada voucher. Klik "+ Tambah Voucher" untuk membuat.</p>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden"
             style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase border-b border-white/5">
                  <th className="px-6 py-3">Kode</th>
                  <th className="px-6 py-3">Diskon</th>
                  <th className="px-6 py-3">Penggunaan</th>
                  <th className="px-6 py-3">Berlaku Sampai</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {vouchers.map((voucher) => {
                  const isExpired = voucher.valid_until && new Date(voucher.valid_until) < new Date();
                  const isUsedUp = voucher.used_count >= voucher.max_usage;

                  return (
                    <tr key={voucher.id} className="text-sm hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono font-bold text-white px-2 py-1 rounded"
                              style={{ background: "rgba(59,91,255,0.15)" }}>
                          {voucher.code}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-green-400 font-semibold">{voucher.discount_percent}%</td>
                      <td className="px-6 py-4 text-gray-400">
                        {voucher.used_count} / {voucher.max_usage}
                        {isUsedUp && <span className="text-red-400 text-xs ml-2">(habis)</span>}
                      </td>
                      <td className="px-6 py-4 text-gray-400">
                        {voucher.valid_until ? (
                          <span className={isExpired ? "text-red-400" : ""}>
                            {formatDate(voucher.valid_until)}
                            {isExpired && " (expired)"}
                          </span>
                        ) : (
                          <span className="text-gray-500">Tanpa batas</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button onClick={() => toggleActive(voucher.id, voucher.is_active)}
                                className="cursor-pointer">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            voucher.is_active
                              ? "text-green-400 bg-green-400/10"
                              : "text-gray-400 bg-gray-400/10"
                          }`}>
                            {voucher.is_active ? "Aktif" : "Nonaktif"}
                          </span>
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => handleDelete(voucher.id, voucher.code)}
                                className="text-xs text-red-400 hover:text-red-300 cursor-pointer">
                          Hapus
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
