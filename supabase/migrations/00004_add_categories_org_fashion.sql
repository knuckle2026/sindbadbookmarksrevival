-- 団体・相談先にカテゴリ「サークル」を追加
DO $$
DECLARE
  v_genre_id uuid;
BEGIN
  SELECT id INTO v_genre_id FROM genres WHERE slug = 'org-consult';
  IF v_genre_id IS NOT NULL THEN
    INSERT INTO categories (id, genre_id, slug, name, sort_order) VALUES
      (gen_random_uuid(), v_genre_id, 'circle', 'サークル', 3)
    ON CONFLICT DO NOTHING;
  END IF;
END
$$;

-- ファッション・美容にカテゴリ「フィットネス」「医療関係」を追加
DO $$
DECLARE
  v_genre_id uuid;
BEGIN
  SELECT id INTO v_genre_id FROM genres WHERE slug = 'fashion-beauty';
  IF v_genre_id IS NOT NULL THEN
    INSERT INTO categories (id, genre_id, slug, name, sort_order) VALUES
      (gen_random_uuid(), v_genre_id, 'fitness', 'フィットネス', 6),
      (gen_random_uuid(), v_genre_id, 'medical', '医療関係', 7)
    ON CONFLICT DO NOTHING;
  END IF;
END
$$;
