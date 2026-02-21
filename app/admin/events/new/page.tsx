"use client";

import { useState } from "react";
import { supabase } from "../../../lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const categories = ["concerts", "sports", "theater", "festivals"];

export default function NewEventPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("concerts");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [venueName, setVenueName] = useState("");
  const [venueAddress, setVenueAddress] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploadProgress, setUploadProgress] = useState("");

  // Auto-generate slug dari title
  function generateSlug(text: string) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  }

  function handleTitleChange(value: string) {
    setTitle(value);
    setSlug(generateSlug(value));
  }

  // Handle file selection
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi ukuran (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran file maksimal 5MB");
      return;
    }

    // Validasi tipe file
    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar (JPG, PNG, WebP)");
      return;
    }

    setImageFile(file);
    setError("");

    // Buat preview
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  // Upload gambar ke Supabase Storage
  async function uploadImage(file: File): Promise<string | null> {
    const fileExt = file.name.split(".").pop();
    const fileName = `${slug}-${Date.now()}.${fileExt}`;

    setUploadProgress("Mengupload gambar...");

    const { error: uploadError } = await supabase.storage
      .from("event-images")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      setError("Gagal upload gambar: " + uploadError.message);
      setUploadProgress("");
      return null;
    }

    // Ambil public URL
    const { data } = supabase.storage
      .from("event-images")
      .getPublicUrl(fileName);

    setUploadProgress("");
    return data.publicUrl;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    // Upload gambar jika ada
    let imageUrl: string | null = null;
    if (imageFile) {
      imageUrl = await uploadImage(imageFile);
      if (!imageUrl && imageFile) {
        setSaving(false);
        return; // Upload gagal
      }
    }

    const { error } = await supabase.from("events").insert({
      title,
      slug,
      description,
      category,
      image_url: imageUrl,
      venue_name: venueName || null,
      venue_address: venueAddress || null,
      event_date: eventDate || null,
    });

    setSaving(false);

    if (error) {
      setError("Gagal menyimpan: " + error.message);
    } else {
      router.push("/admin/events");
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/events" className="text-gray-400 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-white">Tambah Event Baru</h1>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-3 rounded-lg text-sm text-red-300"
             style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)" }}>
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl p-6 space-y-5"
             style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>

          {/* Judul */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Judul Event *</label>
            <input type="text" value={title} onChange={(e) => handleTitleChange(e.target.value)}
                   required placeholder="Nama event"
                   className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                   style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }} />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Slug (URL)</label>
            <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)}
                   placeholder="url-friendly-name"
                   className="w-full px-4 py-3 rounded-xl text-gray-400 placeholder-gray-500 outline-none"
                   style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }} />
            <p className="text-gray-500 text-xs mt-1">URL: /events/{slug || "..."}</p>
          </div>

          {/* Kategori */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Kategori *</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}>
              {categories.map((cat) => (
                <option key={cat} value={cat} className="bg-gray-900">{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
              ))}
            </select>
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Deskripsi</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                      rows={4} placeholder="Deskripsi event..."
                      className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                      style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }} />
          </div>

          {/* Upload Gambar */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Gambar Event</label>
            <div className="relative">
              {imagePreview ? (
                <div className="relative rounded-xl overflow-hidden mb-3"
                     style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
                  <Image src={imagePreview} alt="Preview" width={600} height={300}
                         className="w-full h-48 object-cover" />
                  <button type="button"
                          onClick={() => { setImageFile(null); setImagePreview(null); }}
                          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500/80 text-white flex items-center justify-center hover:bg-red-600 transition-colors cursor-pointer">
                    ✕
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-40 rounded-xl cursor-pointer transition-all hover:border-blue-500/50"
                       style={{ background: "rgba(255,255,255,0.04)", border: "2px dashed rgba(255,255,255,0.15)" }}>
                  <svg className="w-10 h-10 text-gray-500 mb-2" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                  <p className="text-sm text-gray-400">Klik untuk upload gambar</p>
                  <p className="text-xs text-gray-500 mt-1">JPG, PNG, WebP (maks. 5MB)</p>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              )}
              {uploadProgress && (
                <p className="text-sm text-blue-400 mt-2">{uploadProgress}</p>
              )}
            </div>
          </div>
        </div>

        {/* Venue Info */}
        <div className="rounded-xl p-6 space-y-5"
             style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <h3 className="text-lg font-semibold text-white">Informasi Venue</h3>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Nama Venue</label>
            <input type="text" value={venueName} onChange={(e) => setVenueName(e.target.value)}
                   placeholder="Gelora Bung Karno"
                   className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                   style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Alamat Venue</label>
            <input type="text" value={venueAddress} onChange={(e) => setVenueAddress(e.target.value)}
                   placeholder="Jl. Pintu Satu Senayan, Jakarta"
                   className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                   style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Tanggal & Waktu Event</label>
            <input type="datetime-local" value={eventDate} onChange={(e) => setEventDate(e.target.value)}
                   className="w-full px-4 py-3 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                   style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }} />
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <button type="submit" disabled={saving}
                  className="px-8 py-3 rounded-xl text-white font-semibold transition-all cursor-pointer disabled:opacity-50"
                  style={{ background: saving ? "#555" : "#3b5bff" }}>
            {saving ? "Menyimpan..." : "Simpan Event"}
          </button>
          <Link href="/admin/events"
                className="px-6 py-3 rounded-xl text-gray-400 font-medium transition-all"
                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}>
            Batal
          </Link>
        </div>
      </form>
    </div>
  );
}
