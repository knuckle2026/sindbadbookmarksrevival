-- listings に承認日 (published_at) カラム追加。
-- 承認 API (status を published に遷移するとき) で初回のみ設定。
-- 既存の published 行は updated_at を近似値として backfill。

ALTER TABLE listings ADD COLUMN published_at TEXT;

UPDATE listings
   SET published_at = updated_at
 WHERE status = 'published' AND published_at IS NULL;

CREATE INDEX idx_listings_published_at ON listings(published_at);
