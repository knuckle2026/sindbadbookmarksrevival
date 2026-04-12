-- 本番DB適用済み (2026-04-13)
-- このファイルはリポジトリの記録用

-- カテゴリ追加: video-gallery/fashion-beautyにショップ、org-consultに医療機関
-- 名称変更: fashion-beautyの医療関係→医療機関
DO $$
DECLARE
  v_vg_id uuid;
  v_fb_id uuid;
  v_oc_id uuid;
BEGIN
  SELECT id INTO v_vg_id FROM genres WHERE slug = 'video-gallery';
  SELECT id INTO v_fb_id FROM genres WHERE slug = 'fashion-beauty';
  SELECT id INTO v_oc_id FROM genres WHERE slug = 'org-consult';

  IF v_vg_id IS NOT NULL THEN
    INSERT INTO categories (id, genre_id, slug, name, sort_order) VALUES
      (gen_random_uuid(), v_vg_id, 'shop', 'ショップ', 5)
    ON CONFLICT DO NOTHING;
  END IF;

  IF v_fb_id IS NOT NULL THEN
    INSERT INTO categories (id, genre_id, slug, name, sort_order) VALUES
      (gen_random_uuid(), v_fb_id, 'shop', 'ショップ', 8)
    ON CONFLICT DO NOTHING;
    UPDATE categories SET name = '医療機関' WHERE genre_id = v_fb_id AND slug = 'medical';
  END IF;

  IF v_oc_id IS NOT NULL THEN
    INSERT INTO categories (id, genre_id, slug, name, sort_order) VALUES
      (gen_random_uuid(), v_oc_id, 'medical-org', '医療機関', 4)
    ON CONFLICT DO NOTHING;
  END IF;
END
$$;
