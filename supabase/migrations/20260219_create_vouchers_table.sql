-- Tabel voucher untuk diskon tiket
-- Admin bisa membuat kode voucher dengan persentase diskon dan batas penggunaan

CREATE TABLE IF NOT EXISTS vouchers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,         -- Kode voucher (misal: DISKON20)
  discount_percent INTEGER NOT NULL CHECK (discount_percent BETWEEN 1 AND 100),
                                             -- Persentase diskon (1-100)
  max_usage INTEGER NOT NULL DEFAULT 1,      -- Berapa kali voucher bisa dipakai total
  used_count INTEGER NOT NULL DEFAULT 0,     -- Berapa kali sudah dipakai
  is_active BOOLEAN NOT NULL DEFAULT true,   -- Aktif atau tidak
  valid_from TIMESTAMPTZ DEFAULT now(),      -- Berlaku mulai
  valid_until TIMESTAMPTZ,                   -- Berlaku sampai (null = tanpa batas)
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tambahkan kolom voucher_id dan discount ke tabel orders (kalau belum ada)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS voucher_id UUID REFERENCES vouchers(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount NUMERIC DEFAULT 0;
