-- 2026-05-20: バー・クラブ・飲食店 > ミックスバー に愛知2件追加
-- 出典: https://www.gclick.jp/search_list.php?pref=23&genre=20 (公式サイト掲載店のみ)
-- 愛知県の検索結果は全7店舗中、公式サイト掲載は2件のみ
-- owner: 編集部 (00000000-0000-0000-0000-000000000001)
-- genre: bar-restaurant (6f7f62e6-9188-4bea-b71a-b19dd5583d90)
-- category: mixbar (3da30b41-7958-4cf9-801e-3fd23b99dd02)

INSERT INTO listings (id, user_id, genre_id, title, description, address, website_url, prefecture, status, created_by, updated_by)
VALUES
  ('b2d4f6a8-1c3e-4f5b-9a7d-8b0c2e4f6a18', '00000000-0000-0000-0000-000000000001', '6f7f62e6-9188-4bea-b71a-b19dd5583d90',
    'GAME',
    '2013年OPEN。名古屋栄のミックスバー。若いスタッフで活気ある雰囲気。ソフトドリンクも各種、朝まで営業。',
    '〒460-0008 愛知県名古屋市中区栄4-4-15 住吉観光ビル 3F',
    'http://www.eigyochu.com/game/',
    'aichi', 'published',
    '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001'),

  ('c3e5a7b9-2d4f-4a6c-8b9e-9c1d3f5a7b29', '00000000-0000-0000-0000-000000000001', '6f7f62e6-9188-4bea-b71a-b19dd5583d90',
    '七色パトス',
    '名古屋・栄4丁目のヲタクバー。ハイファミリア姉妹店。アニメ・コスプレ・SM等あらゆる嗜好が集まる。',
    '〒460-0008 愛知県名古屋市中区栄4-13-10 名北ライオンビル 4F',
    'http://hfamilia.com/',
    'aichi', 'published',
    '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001');

INSERT INTO listing_categories (listing_id, category_id) VALUES
  ('b2d4f6a8-1c3e-4f5b-9a7d-8b0c2e4f6a18', '3da30b41-7958-4cf9-801e-3fd23b99dd02'),
  ('c3e5a7b9-2d4f-4a6c-8b9e-9c1d3f5a7b29', '3da30b41-7958-4cf9-801e-3fd23b99dd02');
