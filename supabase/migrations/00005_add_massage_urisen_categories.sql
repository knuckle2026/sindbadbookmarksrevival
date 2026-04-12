-- 本番DB適用済み (2026-04-12)
-- このファイルはリポジトリの記録用

-- マッサージ・売り専ジャンルにカテゴリ追加 + sort_order調整
DO $$
DECLARE
  v_genre_id uuid;
BEGIN
  SELECT id INTO v_genre_id FROM genres WHERE slug = 'massage-urisen';
  IF v_genre_id IS NOT NULL THEN
    -- マッサージ (sort_order 1)
    INSERT INTO categories (id, genre_id, slug, name, sort_order) VALUES
      (gen_random_uuid(), v_genre_id, 'massage', 'マッサージ', 1)
    ON CONFLICT DO NOTHING;
    -- 売り専 (sort_order 5)
    INSERT INTO categories (id, genre_id, slug, name, sort_order) VALUES
      (gen_random_uuid(), v_genre_id, 'urisen', '売り専', 5)
    ON CONFLICT DO NOTHING;
    -- 既存カテゴリのsort_order調整
    UPDATE categories SET sort_order = 2 WHERE genre_id = v_genre_id AND slug = 'seitai';
    UPDATE categories SET sort_order = 3 WHERE genre_id = v_genre_id AND slug = 'oil';
    UPDATE categories SET sort_order = 4 WHERE genre_id = v_genre_id AND slug = 'thai';
    UPDATE categories SET sort_order = 6 WHERE genre_id = v_genre_id AND slug = 'newhalf';
  END IF;
END
$$;
