-- 本番DB適用済み (2026-04-11)
-- このファイルはリポジトリの記録用

-- 1. listings.click_count 追加（アクセス数カウント用）
ALTER TABLE listings ADD COLUMN IF NOT EXISTS click_count integer NOT NULL DEFAULT 0;

-- 2. friendliness カラム廃止
ALTER TABLE listings DROP COLUMN IF EXISTS friendliness;

-- 3. categories.group_type カラム廃止
ALTER TABLE categories DROP COLUMN IF EXISTS group_type;

-- 4. 団体カテゴリ名変更
UPDATE categories SET name = 'NPO' WHERE slug = 'npo' AND name = 'NPO法人';
UPDATE categories SET name = '行政' WHERE slug = 'volunteer' AND name = 'ボランティア';

-- 5. 「その他」ジャンルにカテゴリ追加
DO $$
DECLARE
  v_genre_id uuid;
BEGIN
  SELECT id INTO v_genre_id FROM genres WHERE slug = 'other';
  IF v_genre_id IS NOT NULL THEN
    INSERT INTO categories (id, genre_id, slug, name, sort_order) VALUES
      (gen_random_uuid(), v_genre_id, 'fortune', '占い', 1),
      (gen_random_uuid(), v_genre_id, 'publishing', '出版', 2),
      (gen_random_uuid(), v_genre_id, 'useful-site', '便利サイト', 3)
    ON CONFLICT DO NOTHING;
  END IF;
END
$$;
