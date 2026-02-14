create table ticket_tiers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL NOT NULL,
    quota INTEGER NOT NULL,
    sold INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);