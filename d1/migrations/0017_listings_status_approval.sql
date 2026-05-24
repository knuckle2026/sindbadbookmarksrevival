-- 0017_listings_status_approval.sql
-- Extend listings.status CHECK constraint to support approval workflow.
-- Old: ('published', 'hidden')
-- New: ('pending', 'published', 'hidden', 'rejected')
-- SQLite/D1 has no ALTER TABLE DROP CONSTRAINT, so we rebuild the table.

PRAGMA foreign_keys = OFF;

CREATE TABLE listings_new (
  id            TEXT PRIMARY KEY,
  user_id       TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  genre_id      TEXT REFERENCES genres(id) ON DELETE RESTRICT,
  title         TEXT NOT NULL
                CHECK (length(title) BETWEEN 1 AND 20),
  description   TEXT NOT NULL
                CHECK (length(description) BETWEEN 1 AND 100),
  address       TEXT,
  website_url   TEXT NOT NULL
                CHECK (website_url LIKE 'http://%' OR website_url LIKE 'https://%'),
  prefecture    TEXT,
  ward          TEXT,
  service_areas TEXT,
  provider_ages TEXT,
  status        TEXT NOT NULL DEFAULT 'published'
                CHECK (status IN ('pending', 'published', 'hidden', 'rejected')),
  click_count   INTEGER NOT NULL DEFAULT 0,
  created_by    TEXT REFERENCES profiles(id),
  updated_by    TEXT REFERENCES profiles(id),
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO listings_new SELECT * FROM listings;

DROP TABLE listings;
ALTER TABLE listings_new RENAME TO listings;

CREATE INDEX idx_listings_user_id     ON listings(user_id);
CREATE INDEX idx_listings_genre_id    ON listings(genre_id);
CREATE INDEX idx_listings_status      ON listings(status);
CREATE INDEX idx_listings_prefecture  ON listings(prefecture);
CREATE INDEX idx_listings_created_at  ON listings(created_at DESC);

PRAGMA foreign_keys = ON;
