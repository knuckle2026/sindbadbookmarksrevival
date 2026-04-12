-- 本番DB適用済み (2026-04-12)
-- このファイルはリポジトリの記録用

-- その他にデッサン追加
DO $$
DECLARE
  v_genre_id uuid;
BEGIN
  SELECT id INTO v_genre_id FROM genres WHERE slug = 'other';
  IF v_genre_id IS NOT NULL THEN
    INSERT INTO categories (id, genre_id, slug, name, sort_order) VALUES
      (gen_random_uuid(), v_genre_id, 'dessin', 'デッサン', 4)
    ON CONFLICT DO NOTHING;
  END IF;
END
$$;
