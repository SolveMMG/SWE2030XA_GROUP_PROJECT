CREATE TABLE IF NOT EXISTS inquiries (
  id         SERIAL PRIMARY KEY,
  listing_id INT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  buyer_id   INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message    TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS inquiries_listing_id_idx ON inquiries(listing_id);
CREATE INDEX IF NOT EXISTS inquiries_buyer_id_idx ON inquiries(buyer_id);
