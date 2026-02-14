create table events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    category TEXT CHECK (category IN ('concerts', 'sports', 'theater', 'festivals')),
    image_url TEXT,
    venue_name TEXT,
    venue_address TEXT,
    latitude FLOAT,
    longitude FLOAT,
    event_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);