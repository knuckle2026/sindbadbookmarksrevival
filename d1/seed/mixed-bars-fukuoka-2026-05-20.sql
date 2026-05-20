-- 2026-05-20: バー・クラブ・飲食店 > ミックスバー に福岡2件追加
-- 出典: https://www.gclick.jp/search_list.php?pref=40&genre=20 (公式サイト掲載店のみ)
-- owner: 編集部 (00000000-0000-0000-0000-000000000001)
-- genre: bar-restaurant (6f7f62e6-9188-4bea-b71a-b19dd5583d90)
-- category: mixbar (3da30b41-7958-4cf9-801e-3fd23b99dd02)

INSERT INTO listings (id, user_id, genre_id, title, description, address, website_url, prefecture, status, created_by, updated_by)
VALUES
  ('f2c4d6a8-3b5e-4f7c-92db-4e6a8c0d2f1b', '00000000-0000-0000-0000-000000000001', '6f7f62e6-9188-4bea-b71a-b19dd5583d90',
    'Make up',
    '博多住吉のミックスバー。Twitter @Makeup_HAKATA で情報発信中。',
    '〒812-0018 福岡県福岡市博多区住吉4-9-3',
    'http://www.bar-makeup.com/',
    'fukuoka', 'published',
    '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001'),

  ('a3d5e7b9-4c6f-4a8d-93ec-5f7b9d1e3a2c', '00000000-0000-0000-0000-000000000001', '6f7f62e6-9188-4bea-b71a-b19dd5583d90',
    'diva(s)plus',
    '小倉紺屋町のミックスバー。10代~60代まで幅広い層、女性入店可。21:00-3:00、日曜定休。',
    '〒802-0081 福岡県北九州市小倉北区紺屋町5-17 アージュ紺屋 3F',
    'http://divas-group.com/',
    'fukuoka', 'published',
    '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001');

INSERT INTO listing_categories (listing_id, category_id) VALUES
  ('f2c4d6a8-3b5e-4f7c-92db-4e6a8c0d2f1b', '3da30b41-7958-4cf9-801e-3fd23b99dd02'),
  ('a3d5e7b9-4c6f-4a8d-93ec-5f7b9d1e3a2c', '3da30b41-7958-4cf9-801e-3fd23b99dd02');
