-- ============================================
-- sindbadbookmarks: D1 (SQLite) initial schema
-- Mirrors the live Supabase public schema as of v3.0.0,
-- with Postgres-specific features translated for SQLite.
-- ============================================

PRAGMA foreign_keys = ON;

-- ========== PROFILES ==========
-- id stores the Supabase Auth user uuid as TEXT.
CREATE TABLE profiles (
  id           TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  role         TEXT NOT NULL DEFAULT 'contributor'
               CHECK (role IN ('visitor', 'contributor', 'admin')),
  is_suspended INTEGER NOT NULL DEFAULT 0
               CHECK (is_suspended IN (0, 1)),
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ========== GENRES ==========
CREATE TABLE genres (
  id         TEXT PRIMARY KEY,
  slug       TEXT NOT NULL UNIQUE,
  name       TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_genres_sort_order ON genres(sort_order);

-- ========== CATEGORIES ==========
CREATE TABLE categories (
  id         TEXT PRIMARY KEY,
  genre_id   TEXT NOT NULL REFERENCES genres(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  slug       TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (genre_id, slug)
);

CREATE INDEX idx_categories_genre_id ON categories(genre_id);

-- ========== LISTINGS ==========
CREATE TABLE listings (
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
  service_areas TEXT,  -- JSON array string, e.g. '["tokyo","osaka"]'
  provider_ages TEXT,  -- JSON array string, e.g. '["20s","30s"]'
  status        TEXT NOT NULL DEFAULT 'published'
                CHECK (status IN ('published', 'hidden')),
  click_count   INTEGER NOT NULL DEFAULT 0,
  created_by    TEXT REFERENCES profiles(id),
  updated_by    TEXT REFERENCES profiles(id),
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_listings_user_id     ON listings(user_id);
CREATE INDEX idx_listings_genre_id    ON listings(genre_id);
CREATE INDEX idx_listings_status      ON listings(status);
CREATE INDEX idx_listings_prefecture  ON listings(prefecture);
CREATE INDEX idx_listings_created_at  ON listings(created_at DESC);

-- ========== LISTING_CATEGORIES (Junction) ==========
CREATE TABLE listing_categories (
  listing_id  TEXT NOT NULL REFERENCES listings(id)   ON DELETE CASCADE,
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (listing_id, category_id)
);

CREATE INDEX idx_listing_categories_category ON listing_categories(category_id);

-- ========== REPORTS ==========
CREATE TABLE reports (
  id               TEXT PRIMARY KEY,
  listing_id       TEXT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  reporter_user_id TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  reason           TEXT NOT NULL
                   CHECK (length(reason) BETWEEN 1 AND 50),
  status           TEXT NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'reviewed')),
  created_at       TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_reports_listing ON reports(listing_id);
CREATE INDEX idx_reports_status  ON reports(status);

-- ========== ANNOUNCEMENTS ==========
CREATE TABLE announcements (
  id         TEXT PRIMARY KEY,
  title      TEXT NOT NULL CHECK (length(title) BETWEEN 1 AND 100),
  body       TEXT NOT NULL CHECK (length(body)  BETWEEN 1 AND 200),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_announcements_sort_order ON announcements(sort_order);

-- ========== FAQS ==========
CREATE TABLE faqs (
  id         TEXT PRIMARY KEY,
  question   TEXT NOT NULL CHECK (length(question) BETWEEN 1 AND 100),
  answer     TEXT NOT NULL CHECK (length(answer)   BETWEEN 1 AND 200),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_faqs_sort_order ON faqs(sort_order);

-- ========== FEEDBACK ==========
CREATE TABLE feedback (
  id         TEXT PRIMARY KEY,
  user_id    TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  body       TEXT NOT NULL CHECK (length(body) BETWEEN 1 AND 200),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_feedback_created_at ON feedback(created_at DESC);
