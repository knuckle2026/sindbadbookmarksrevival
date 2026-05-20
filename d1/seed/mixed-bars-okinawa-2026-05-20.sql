-- 2026-05-20: バー・クラブ・飲食店 > ミックスバー に沖縄1件追加
-- 出典: https://www.gclick.jp/search_list.php?pref=47&genre=20 (公式サイト掲載店のみ)
-- 沖縄県の全6店舗中、公式サイト掲載は1件のみ
-- owner: 編集部 (00000000-0000-0000-0000-000000000001)
-- genre: bar-restaurant (6f7f62e6-9188-4bea-b71a-b19dd5583d90)
-- category: mixbar (3da30b41-7958-4cf9-801e-3fd23b99dd02)

INSERT INTO listings (id, user_id, genre_id, title, description, address, website_url, prefecture, status, created_by, updated_by)
VALUES
  ('b4e6c8a1-5d7f-4b9c-94ad-6e8c0d2f4b3a', '00000000-0000-0000-0000-000000000001', '6f7f62e6-9188-4bea-b71a-b19dd5583d90',
    'BAR SPOT OKINAWA',
    '沖縄市ゲート通り近くのLGBTフレンドリーなスナックバー。NHママの軽快トーク、カラオケ・カクテル充実。',
    '〒904-0031 沖縄県沖縄市上地1-9-30',
    'https://i78635.wixsite.com/spot-okinawa-lgbt',
    'okinawa', 'published',
    '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001');

INSERT INTO listing_categories (listing_id, category_id) VALUES
  ('b4e6c8a1-5d7f-4b9c-94ad-6e8c0d2f4b3a', '3da30b41-7958-4cf9-801e-3fd23b99dd02');
