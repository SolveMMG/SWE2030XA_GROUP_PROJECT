CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS listings_title_trgm_idx ON listings USING GIN (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS listings_description_trgm_idx ON listings USING GIN (description gin_trgm_ops);
