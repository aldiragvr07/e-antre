"use client";

import Image from "next/image";
import { useState } from "react";

export default function Newsletter() {
  const [email, setEmail] = useState("");

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0d1354] to-[#1a1066]">
        <div className="flex flex-col items-center md:flex-row">
          {/* Text Content */}
          <div className="flex-1 p-8 sm:p-12">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Never miss a show.
            </h2>
            <p className="mt-3 max-w-md text-sm text-zinc-400 leading-relaxed">
              Subscribe to our newsletter and get exclusive access to presales,
              artist updates, and limited-time offers.
            </p>

            {/* Email Input */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-white placeholder-zinc-500 outline-none transition-colors focus:border-accent"
              />
              <button className="rounded-full border-2 border-white px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-white hover:text-[#0d1354]">
                Subscribe
              </button>
            </div>
          </div>

          {/* Images */}
          <div className="hidden md:flex items-end gap-3 pr-8 pb-0">
            <div className="relative h-64 w-44 overflow-hidden rounded-t-2xl">
              <Image
                src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&q=80"
                alt="Concert performer"
                fill
                className="object-cover"
                sizes="176px"
              />
            </div>
            <div className="relative h-72 w-44 overflow-hidden rounded-t-2xl">
              <Image
                src="https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=400&q=80"
                alt="Festival lights"
                fill
                className="object-cover"
                sizes="176px"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
