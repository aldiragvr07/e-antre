"use client";
// ↑ Wajib! Karena halaman ini butuh interaksi user (ketik, klik)

import { useState } from "react";
// ↑ useState = menyimpan data sementara di halaman (email, password, dll.)

import { supabase } from "../lib/supabase";
// ↑ Import koneksi Supabase yang kita buat tadi

import { useRouter } from "next/navigation";
// ↑ useRouter = untuk pindah halaman (redirect setelah berhasil daftar)

import Link from "next/link";
// ↑ Link = untuk buat link ke halaman lain (misal ke halaman login)

export default function RegisterPage() {
  // === VARIABEL STATE ===
  // Setiap useState menyimpan 1 data + 1 fungsi pengubah
  const [fullName, setFullName] = useState("");   // Nama lengkap
  const [email, setEmail] = useState("");         // Email
  const [password, setPassword] = useState("");   // Password
  const [error, setError] = useState("");         // Pesan error (kalau gagal)
  const [loading, setLoading] = useState(false);  // Status loading (true = sedang proses)

  const router = useRouter();
  // ↑ Membuat "alat navigasi" untuk pindah halaman

  // === FUNGSI REGISTER ===
  // Jalan ketika tombol "Daftar" diklik
  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    // ↑ Mencegah halaman refresh saat form di-submit

    setError("");     // Reset error
    setLoading(true); // Tampilkan loading

    // Daftarkan user ke Supabase
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          // ↑ Data tambahan yang disimpan di profil user
        },
      },
    });

    setLoading(false); // Matikan loading

    if (error) {
      // Kalau gagal, tampilkan pesan error
      setError(error.message);
    } else {
      // Kalau berhasil, pindah ke halaman login
      router.push("/login?registered=true");
    }
  }

  // === TAMPILAN (JSX) ===
  return (
    <div className="min-h-screen flex items-center justify-center px-4"
         style={{ background: "linear-gradient(135deg, #0a0a14 0%, #1a1a2e 50%, #0a0a14 100%)" }}>
      
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-white">
            E-ANTRE
          </Link>
          <h1 className="text-3xl font-bold text-white mt-6">Buat Akun</h1>
          <p className="text-gray-400 mt-2">Daftar untuk mulai membeli tiket event</p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl p-8"
             style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
          
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm text-red-300"
                 style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)" }}>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-5">
            {/* Input Nama */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                // ↑ Setiap user ketik, simpan nilainya ke variabel fullName
                required
                placeholder="Masukkan nama lengkap"
                className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}
              />
            </div>

            {/* Input Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="contoh@email.com"
                className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}
              />
            </div>

            {/* Input Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Minimal 6 karakter"
                className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}
              />
            </div>

            {/* Tombol Daftar */}
            <button
              type="submit"
              disabled={loading}
              // ↑ Tombol tidak bisa diklik saat loading
              className="w-full py-3 rounded-xl text-white font-semibold transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: loading ? "#555" : "#3b5bff" }}
            >
              {loading ? "Mendaftar..." : "Daftar"}
              {/* ↑ Teks berubah saat loading */}
            </button>
          </form>

          {/* Link ke Login */}
          <p className="text-center text-gray-400 mt-6 text-sm">
            Sudah punya akun?{" "}
            <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
