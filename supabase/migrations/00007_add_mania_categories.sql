-- 本番DB適用済み (2026-04-12)
-- このファイルはリポジトリの記録用

-- マニア系に競パン・褌・ブリーフ・ユニフォーム追加
DO $$
DECLARE
  v_genre_id uuid;
BEGIN
  SELECT id INTO v_genre_id FROM genres WHERE slug = 'mania';
  IF v_genre_id IS NOT NULL THEN
    INSERT INTO categories (id, genre_id, slug, name, sort_order) VALUES
      (gen_random_uuid(), v_genre_id, 'kyoupan', '競パン', 7),
      (gen_random_uuid(), v_genre_id, 'fundoshi', '褌', 8),
      (gen_random_uuid(), v_genre_id, 'brief', 'ブリーフ', 9),
      (gen_random_uuid(), v_genre_id, 'uniform', 'ユニフォーム', 10)
    ON CONFLICT DO NOTHING;
  END IF;
END
$$;
