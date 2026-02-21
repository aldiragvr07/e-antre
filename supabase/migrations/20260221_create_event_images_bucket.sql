n-- Buat Storage Bucket untuk gambar event
-- Jalankan SQL ini di Supabase SQL Editor

-- 1. Buat bucket "event-images" (public agar bisa diakses tanpa auth)
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-images', 'event-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Policy: Siapapun boleh melihat gambar (public read)
CREATE POLICY "Public read event images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'event-images');

-- 3. Policy: User yang login boleh upload gambar
CREATE POLICY "Authenticated users can upload event images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'event-images');

-- 4. Policy: User yang login boleh update gambar
CREATE POLICY "Authenticated users can update event images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'event-images');

-- 5. Policy: User yang login boleh hapus gambar
CREATE POLICY "Authenticated users can delete event images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'event-images');
