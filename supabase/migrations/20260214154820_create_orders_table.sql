create table orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    ticket_tier_id UUID NOT NULL REFERENCES ticket_tiers(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    total_price DECIMAL NOT NULL,
    status TEXT CHECK (status IN ('pending', 'paid', 'cancelled', 'refunded')),
    created_at TIMESTAMP DEFAULT NOW()
);