"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";

// === DAFTAR EMAIL ADMIN ===
// Tambahkan email Anda di sini supaya bisa akses admin
const ADMIN_EMAILS = [
  "scouttt213@gmail.com",
  // ↑ Ganti/tambah email Anda di sini
];

// === MENU SIDEBAR ===
const menuItems = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" />
      </svg>
    ),
  },
  {
    label: "Events",
    href: "/admin/events",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
      </svg>
    ),
  },
  {
    label: "Orders",
    href: "/admin/orders",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
      </svg>
    ),
  },
  {
    label: "Vouchers",
    href: "/admin/vouchers",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z" />
      </svg>
    ),
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      // Cek apakah email user ada di daftar admin
      if (!ADMIN_EMAILS.includes(user.email || "")) {
        router.push("/");
        return;
      }

      setUser(user);
      setLoading(false);
    }

    checkAdmin();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0a14" }}>
        <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ background: "#0a0a14" }}>

      {/* === SIDEBAR DESKTOP === */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 border-r border-white/5 pt-20"
             style={{ background: "rgba(255,255,255,0.02)" }}>
        {/* Logo */}
        <div className="px-6 mb-8">
          <h2 className="text-lg font-bold text-white">
            E-<span className="text-blue-400">ANTRE</span>
            <span className="text-xs text-gray-500 ml-2">Admin</span>
          </h2>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 px-3 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-blue-600/20 text-blue-400"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User info */}
        <div className="px-4 py-4 border-t border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
              {(user?.email || "A").charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{user?.user_metadata?.full_name || "Admin"}</p>
              <p className="text-gray-500 text-xs truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* === MOBILE HEADER === */}
      <div className="lg:hidden fixed top-16 left-0 right-0 z-40 border-b border-white/5 px-4 py-3 flex items-center justify-between"
           style={{ background: "#0a0a14" }}>
        <h2 className="text-sm font-bold text-white">Admin Panel</h2>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 cursor-pointer">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
      </div>

      {/* === MOBILE SIDEBAR OVERLAY === */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 p-4 pt-20 space-y-1"
               style={{ background: "#0a0a14", borderRight: "1px solid rgba(255,255,255,0.1)" }}>
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        isActive ? "bg-blue-600/20 text-blue-400" : "text-gray-400 hover:text-white hover:bg-white/5"
                      }`}>
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* === MAIN CONTENT === */}
      <main className="flex-1 pt-20 lg:pt-20 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto mt-4 lg:mt-0">
          {children}
        </div>
      </main>
    </div>
  );
}
