CREATE TABLE IF NOT EXISTS reviews (
  id          SERIAL PRIMARY KEY,
  inquiry_id  INT UNIQUE NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
  reviewer_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seller_id   INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating      INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS reviews_seller_id_idx ON reviews(seller_id);
