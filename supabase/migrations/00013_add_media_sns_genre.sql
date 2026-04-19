-- ジャンル追加: メディア・SNS を「動画・ギャラリー」の次（sort_order = 5）に挿入
-- 既存の sort_order 5 以降のジャンルを +1 でスライド
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM genres WHERE slug = 'media-sns') THEN
    UPDATE genres SET sort_order = sort_order + 1 WHERE sort_order >= 5;
    INSERT INTO genres (slug, name, sort_order) VALUES ('media-sns', 'メディア・SNS', 5);
  END IF;
END
$$;
