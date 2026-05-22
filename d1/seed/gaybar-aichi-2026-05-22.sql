-- 2026-05-22: バー・クラブ・飲食店 > ゲイバー 愛知県 2件追加
-- 出典: gclick pref=23&genre=1 (3 ページ集約)
-- 既存重複 5 件 (Weight, BAR Anchor, ラ・マンチャ, スナックよっくん, STONE)
-- を除外、残り 2 件のみ (10件分は無し)。
-- owner: 編集部 (00000000-0000-0000-0000-000000000001)

INSERT INTO listings (id, user_id, genre_id, title, description, address, website_url, prefecture, status, created_by, updated_by)
VALUES ('a1c3e5f7-2b4d-4a6b-9bc8-3d5e7f9a1b0c', '00000000-0000-0000-0000-000000000001', '6f7f62e6-9188-4bea-b71a-b19dd5583d90',
  'ハイファミリア',
  '名古屋錦3丁目の観光バー。ノリの良いノンケ客中心、20~30代スタッフが元気いっぱい。',
  '〒460-0003 愛知県名古屋市中区錦3-19-26 アッツ錦ビル 5F',
  'http://hfamilia.com/',
  'aichi', 'published',
  '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001');

INSERT INTO listings (id, user_id, genre_id, title, description, address, website_url, prefecture, status, created_by, updated_by)
VALUES ('b2d4f6a8-3c5e-4b7c-9cd9-4e6f8a0b2c1d', '00000000-0000-0000-0000-000000000001', '6f7f62e6-9188-4bea-b71a-b19dd5583d90',
  'RODAN',
  '名古屋市中区栄のゲイバー。第3メイトビル2A、SNSは @ChanceRodan で情報発信。',
  '〒460-0008 愛知県名古屋市中区栄4-4-1 第3メイトビル 2A',
  'http://www.rodan-nagoya.jp/',
  'aichi', 'published',
  '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001');

INSERT INTO listing_categories (listing_id, category_id) VALUES ('a1c3e5f7-2b4d-4a6b-9bc8-3d5e7f9a1b0c', '6588c6df-0081-4a2e-98b9-eb4f578947a7');
INSERT INTO listing_categories (listing_id, category_id) VALUES ('b2d4f6a8-3c5e-4b7c-9cd9-4e6f8a0b2c1d', '6588c6df-0081-4a2e-98b9-eb4f578947a7');
