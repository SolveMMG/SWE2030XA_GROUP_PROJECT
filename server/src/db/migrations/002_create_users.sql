CREATE TABLE IF NOT EXISTS users (
  id         SERIAL PRIMARY KEY,
  google_id  TEXT UNIQUE NOT NULL,
  name       TEXT NOT NULL,
  email      TEXT UNIQUE NOT NULL,
  bio        TEXT,
  skills     TEXT[] DEFAULT '{}',
  photo_url  TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
