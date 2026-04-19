-- 「メディア・SNS」ジャンルにカテゴリを追加
-- インフルエンサー / Youtube / Tiktok / ライバー
DO $$
DECLARE
  v_genre_id uuid;
BEGIN
  SELECT id INTO v_genre_id FROM genres WHERE slug = 'media-sns';
  IF v_genre_id IS NOT NULL THEN
    INSERT INTO categories (id, genre_id, slug, name, sort_order) VALUES
      (gen_random_uuid(), v_genre_id, 'influencer', 'インフルエンサー', 1),
      (gen_random_uuid(), v_genre_id, 'youtube',    'Youtube',          2),
      (gen_random_uuid(), v_genre_id, 'tiktok',     'Tiktok',           3),
      (gen_random_uuid(), v_genre_id, 'liver',      'ライバー',         4)
    ON CONFLICT DO NOTHING;
  END IF;
END
$$;
