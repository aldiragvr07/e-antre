"use client";

import { useState } from "react";

export default function Hero() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <section className="relative flex min-h-[600px] items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=1920&q=80')`,
        }}
      />
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a14]/70 via-[#0a0a14]/60 to-[#0a0a14]" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
        {/* Badge */}
        <div className="mb-6 inline-block animate-fade-in-up">
          <span className="rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-accent">
            Live the Moment
          </span>
        </div>

        {/* Heading */}
        <h1 className="mb-4 text-4xl font-extrabold leading-tight text-white animate-fade-in-up animation-delay-100 sm:text-5xl md:text-6xl">
          Your Ticket to{" "}
          <span className="bg-gradient-to-r from-accent via-blue-400 to-purple-400 bg-clip-text text-transparent">
            Pure Excitement
          </span>
        </h1>

        {/* Subheading */}
        <p className="mx-auto mb-10 max-w-2xl text-base text-zinc-400 animate-fade-in-up animation-delay-200 sm:text-lg">
          Join thousands of fans at the world&apos;s most anticipated concerts, sports
          matches, and theatrical performances.
        </p>

        {/* Search Bar */}
        <div className="mx-auto flex max-w-2xl flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-2 backdrop-blur-md animate-fade-in-up animation-delay-300 sm:flex-row sm:rounded-full">
          {/* Search Input */}
          <div className="flex flex-1 items-center gap-2 rounded-full bg-white/5 px-4 py-3">
            <svg className="h-5 w-5 text-zinc-500" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input
              type="text"
              placeholder="Search events, artists, or venues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm text-white placeholder-zinc-500 outline-none"
            />
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 rounded-full bg-white/5 px-4 py-3">
            <svg className="h-5 w-5 text-zinc-500" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            </svg>
            <span className="text-sm text-zinc-300 whitespace-nowrap">New York, NY</span>
          </div>

          {/* Search Button */}
          <button className="rounded-full bg-accent px-7 py-3 text-sm font-semibold text-white transition-all hover:bg-accent-hover hover:shadow-lg hover:shadow-accent/30">
            Search
          </button>
        </div>
      </div>
    </section>
  );
}
