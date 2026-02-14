create table performers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    image_url TEXT,
    role TEXT CHECK (role IN ('headliner', 'guest', 'supporting')),
    perform_date TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);