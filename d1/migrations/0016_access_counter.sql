-- ============================================
-- 0016_access_counter: ヘッダー右側の通算アクセスカウンター用テーブル
-- ============================================

CREATE TABLE access_counter (
  id         TEXT PRIMARY KEY,
  count      INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO access_counter (id, count) VALUES ('site', 0);
