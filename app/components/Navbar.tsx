"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-[#0a0a14]/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
              <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2L3 7v11h14V7l-7-5z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-white">
              Event<span className="text-accent">Ticketing</span>
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#" className="text-sm font-medium text-zinc-400 transition-colors hover:text-white">
              Events
            </Link>
            <Link href="#" className="text-sm font-medium text-zinc-400 transition-colors hover:text-white">
              Venues
            </Link>
            <Link href="#" className="text-sm font-medium text-zinc-400 transition-colors hover:text-white">
              About
            </Link>
            <Link href="#" className="text-sm font-medium text-zinc-400 transition-colors hover:text-white">
              Support
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="#"
              className="text-sm font-medium text-zinc-300 transition-colors hover:text-white"
            >
              Log In
            </Link>
            <Link
              href="#"
              className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-accent-hover hover:shadow-lg hover:shadow-accent/25"
            >
              Sign Up
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex md:hidden items-center justify-center rounded-md p-2 text-zinc-400 hover:text-white"
          >
            <span className="sr-only">Menu</span>
            {isOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-white/5 bg-[#0a0a14]">
          <div className="space-y-1 px-4 pb-4 pt-3">
            <Link href="#" className="block rounded-lg px-3 py-2 text-base font-medium text-zinc-400 hover:bg-white/5 hover:text-white">
              Events
            </Link>
            <Link href="#" className="block rounded-lg px-3 py-2 text-base font-medium text-zinc-400 hover:bg-white/5 hover:text-white">
              Venues
            </Link>
            <Link href="#" className="block rounded-lg px-3 py-2 text-base font-medium text-zinc-400 hover:bg-white/5 hover:text-white">
              About
            </Link>
            <Link href="#" className="block rounded-lg px-3 py-2 text-base font-medium text-zinc-400 hover:bg-white/5 hover:text-white">
              Support
            </Link>
            <div className="flex gap-3 pt-3">
              <Link href="#" className="flex-1 rounded-full border border-white/10 px-4 py-2 text-center text-sm font-medium text-white">
                Log In
              </Link>
              <Link href="#" className="flex-1 rounded-full bg-accent px-4 py-2 text-center text-sm font-semibold text-white">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
