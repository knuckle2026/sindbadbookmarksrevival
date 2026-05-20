-- 2026-05-20: バー・クラブ・飲食店 > ゲイバー 追加2件 (page 2 残)
-- 出典: https://www.gclick.jp/search_list.php?pref=13&genre=1&start=26
-- owner: 編集部 (00000000-0000-0000-0000-000000000001)

INSERT INTO listings (id, user_id, genre_id, title, description, address, website_url, prefecture, ward, status, created_by, updated_by)
VALUES
  ('a8c0e2b4-6d8f-4a0c-93dd-9f1b3d5e7a6b', '00000000-0000-0000-0000-000000000001', '6f7f62e6-9188-4bea-b71a-b19dd5583d90',
    'kamata',
    '蒲田・西蒲田のゲイバー。「まいどっ！」が挨拶のアットホームな店。',
    '〒144-0051 東京都大田区西蒲田5-27-3',
    'http://bulldog.pos.to/kamata/',
    'tokyo', 'ota', 'published',
    '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001'),

  ('b9d1f3c5-7e9a-4b1d-94ee-0a2c4e6f8b7c', '00000000-0000-0000-0000-000000000001', '6f7f62e6-9188-4bea-b71a-b19dd5583d90',
    '度恋処 倶楽部',
    '下北沢のゲイバー。毎週日曜は出逢いの特別デー、60分飲放1000円。世界50カ国旅したマスター。',
    '〒155-0031 東京都世田谷区北沢2-33-6 飯嶋ビル 2F',
    'http://www01.vaio.ne.jp/dokkoi39/',
    'tokyo', 'setagaya', 'published',
    '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001');

INSERT INTO listing_categories (listing_id, category_id) VALUES
  ('a8c0e2b4-6d8f-4a0c-93dd-9f1b3d5e7a6b', '6588c6df-0081-4a2e-98b9-eb4f578947a7'),
  ('b9d1f3c5-7e9a-4b1d-94ee-0a2c4e6f8b7c', '6588c6df-0081-4a2e-98b9-eb4f578947a7');
