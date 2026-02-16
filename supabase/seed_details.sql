-- Seed data: ticket tiers dan performers untuk event-event yang sudah ada

-- Ambil ID event "Solaris Music Festival"
-- Lalu masukkan ticket tiers dan performers

-- TICKET TIERS untuk Solaris Music Festival
INSERT INTO ticket_tiers (event_id, name, description, price, quota, sold)
SELECT id, 'General Admission', 'Akses ke area umum festival', 250000, 500, 120
FROM events WHERE slug = 'solaris-music-festival';

INSERT INTO ticket_tiers (event_id, name, description, price, quota, sold)
SELECT id, 'VIP', 'Akses VIP area + free drinks', 750000, 100, 45
FROM events WHERE slug = 'solaris-music-festival';

INSERT INTO ticket_tiers (event_id, name, description, price, quota, sold)
SELECT id, 'VVIP', 'Front row + backstage pass + meet & greet', 1500000, 30, 28
FROM events WHERE slug = 'solaris-music-festival';

-- TICKET TIERS untuk Rock in Jakarta
INSERT INTO ticket_tiers (event_id, name, description, price, quota, sold)
SELECT id, 'Festival', 'Akses standing area', 350000, 1000, 450
FROM events WHERE slug = 'rock-in-jakarta-2026';

INSERT INTO ticket_tiers (event_id, name, description, price, quota, sold)
SELECT id, 'VIP Seated', 'Kursi VIP dengan pemandangan terbaik', 850000, 200, 180
FROM events WHERE slug = 'rock-in-jakarta-2026';

-- TICKET TIERS untuk Liga Soccer Championship
INSERT INTO ticket_tiers (event_id, name, description, price, quota, sold)
SELECT id, 'Tribun Umum', 'Kursi tribun umum', 150000, 2000, 1500
FROM events WHERE slug = 'liga-soccer-championship';

INSERT INTO ticket_tiers (event_id, name, description, price, quota, sold)
SELECT id, 'Tribun VIP', 'Kursi VIP dengan fasilitas lengkap', 500000, 500, 200
FROM events WHERE slug = 'liga-soccer-championship';

-- PERFORMERS untuk Solaris Music Festival
INSERT INTO performers (event_id, name, role)
SELECT id, 'CYBERPUNK 2077', 'headliner'
FROM events WHERE slug = 'solaris-music-festival';

INSERT INTO performers (event_id, name, role)
SELECT id, 'NEON PULSE', 'guest'
FROM events WHERE slug = 'solaris-music-festival';

INSERT INTO performers (event_id, name, role)
SELECT id, 'VOYAGER X', 'supporting'
FROM events WHERE slug = 'solaris-music-festival';

-- PERFORMERS untuk Rock in Jakarta
INSERT INTO performers (event_id, name, role)
SELECT id, 'Metallica', 'headliner'
FROM events WHERE slug = 'rock-in-jakarta-2026';

INSERT INTO performers (event_id, name, role)
SELECT id, 'Guns N Roses', 'guest'
FROM events WHERE slug = 'rock-in-jakarta-2026';
