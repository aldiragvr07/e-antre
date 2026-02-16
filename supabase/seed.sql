-- Seed data: masukkan beberapa event dummy supaya halaman events tidak kosong

INSERT INTO events (title, slug, description, category, image_url, venue_name, venue_address, event_date)
VALUES
  (
    'Solaris Music Festival',
    'solaris-music-festival',
    'Festival musik terbesar tahun ini dengan lineup artis internasional!',
    'concerts',
    'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800',
    'Jakarta International Expo',
    'Jl. Adhiuciptya, Jakarta Utara',
    '2026-04-15 19:00:00'
  ),
  (
    'Rock in Jakarta 2026',
    'rock-in-jakarta-2026',
    'Konser rock dengan band-band legendaris dari seluruh dunia.',
    'concerts',
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
    'Gelora Bung Karno',
    'Jl. Pintu Satu Senayan, Jakarta Selatan',
    '2026-05-20 18:00:00'
  ),
  (
    'Liga Soccer Championship',
    'liga-soccer-championship',
    'Pertandingan final liga sepak bola nasional.',
    'sports',
    'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800',
    'Stadion Utama Gelora Bung Karno',
    'Jl. Pintu Satu Senayan, Jakarta Selatan',
    '2026-03-28 15:00:00'
  ),
  (
    'Badminton Indonesia Open',
    'badminton-indonesia-open',
    'Turnamen bulu tangkis internasional terbuka Indonesia.',
    'sports',
    'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800',
    'Istora Senayan',
    'Jl. Pintu Satu Senayan, Jakarta Selatan',
    '2026-06-10 09:00:00'
  ),
  (
    'Hamlet: The Musical',
    'hamlet-the-musical',
    'Adaptasi modern dari karya Shakespeare dalam bentuk musikal.',
    'theater',
    'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800',
    'Teater Jakarta',
    'Taman Ismail Marzuki, Jakarta Pusat',
    '2026-04-05 20:00:00'
  ),
  (
    'Festival Budaya Nusantara',
    'festival-budaya-nusantara',
    'Perayaan kebudayaan Indonesia dari Sabang sampai Merauke.',
    'festivals',
    'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800',
    'Monas Area',
    'Jl. Medan Merdeka Selatan, Jakarta Pusat',
    '2026-08-17 08:00:00'
  );
