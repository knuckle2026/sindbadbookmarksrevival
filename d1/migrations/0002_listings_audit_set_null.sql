-- ============================================
-- Day 9: relax listings.created_by / updated_by FKs
--   profiles(id) -> ON DELETE SET NULL
--
-- Background: 0001 left these without an ON DELETE clause so deleting a
-- profile (e.g. account deletion) errored on the FK. Aligns with the
-- existing user_id ON DELETE SET NULL behavior so audit columns just go
-- null when the user record is removed.
--
-- SQLite cannot ALTER a FK in place; rebuild the table.
-- ============================================

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
                CHECK (status IN ('published', 'hidden')),
  click_count   INTEGER NOT NULL DEFAULT 0,
  created_by    TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  updated_by    TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO listings_new
  SELECT id, user_id, genre_id, title, description, address, website_url,
         prefecture, ward, service_areas, provider_ages, status, click_count,
         created_by, updated_by, created_at, updated_at
  FROM listings;

DROP TABLE listings;

ALTER TABLE listings_new RENAME TO listings;

CREATE INDEX idx_listings_user_id     ON listings(user_id);
CREATE INDEX idx_listings_genre_id    ON listings(genre_id);
CREATE INDEX idx_listings_status      ON listings(status);
CREATE INDEX idx_listings_prefecture  ON listings(prefecture);
CREATE INDEX idx_listings_created_at  ON listings(created_at DESC);

PRAGMA foreign_keys = ON;
