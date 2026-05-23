-- 2026-05-23: バー・クラブ・飲食店 > ゲイバー 鹿児島県 4件追加
-- 出典: gclick pref=46&genre=1 (site→X 3段階フォールバック)
-- 全8店中、URL あり + 接続OK は 5 件、既存重複 (天空) を除外し残り 4 件のみ
-- (5件分は無し)。
-- owner: 編集部 (00000000-0000-0000-0000-000000000001)

INSERT INTO listings (id, user_id, genre_id, title, description, address, website_url, prefecture, status, created_by, updated_by)
VALUES ('e0a2c4d6-1f3b-4e5f-9bfa-2e4a6c8d0e9b', '00000000-0000-0000-0000-000000000001', '6f7f62e6-9188-4bea-b71a-b19dd5583d90',
  'メンバーズCafe&Bar ジーエス',
  '鹿児島天文館電停徒歩1分のゲイバー。緑の看板が目印、初心者歓迎。カラオケ1曲100円。',
  '〒892-0826 鹿児島県鹿児島市呉服町1-18 LINKビル 1F',
  'https://palms.gs-kagoshima.com/',
  'kagoshima', 'published',
  '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001');

INSERT INTO listings (id, user_id, genre_id, title, description, address, website_url, prefecture, status, created_by, updated_by)
VALUES ('f1b3d5e7-2a4c-4f6a-9cab-3f5b7d9e1f0c', '00000000-0000-0000-0000-000000000001', '6f7f62e6-9188-4bea-b71a-b19dd5583d90',
  'Buzz-R',
  '鹿児島山之口町の新感覚ゲイバー。13周年、DJブース有り音映像盛りだくさん。20~50代中心。',
  '〒892-0844 鹿児島県鹿児島市山之口町9-39 ニチビル 3F',
  'http://buzz-r.net/',
  'kagoshima', 'published',
  '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001');

INSERT INTO listings (id, user_id, genre_id, title, description, address, website_url, prefecture, status, created_by, updated_by)
VALUES ('a2c4e6f8-3b5d-4a7b-9dbc-4a6c8e0f2a1d', '00000000-0000-0000-0000-000000000001', '6f7f62e6-9188-4bea-b71a-b19dd5583d90',
  'WHARF  KAGOSHIMA',
  '鹿児島山之口町のゲイバー。1人でも気軽な雰囲気、基本休みなし。',
  '〒892-8533 鹿児島県鹿児島市山之口町8-34 ウノキビル 2F A',
  'https://x.com/wharf_kg',
  'kagoshima', 'published',
  '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001');

INSERT INTO listings (id, user_id, genre_id, title, description, address, website_url, prefecture, status, created_by, updated_by)
VALUES ('b3d5f7a9-4c6e-4b8c-9ecd-5b7d9f1a3b2e', '00000000-0000-0000-0000-000000000001', '6f7f62e6-9188-4bea-b71a-b19dd5583d90',
  'ロリポップ',
  '鹿児島山之口町のゲイバー。1人もグループも楽しめる空間、出会いをサポート。',
  '〒892-0844 鹿児島県鹿児島市山之口町8-34 ウノキビル 4F',
  'http://www.bar-lollipop.com/',
  'kagoshima', 'published',
  '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001');

INSERT INTO listing_categories (listing_id, category_id) VALUES ('e0a2c4d6-1f3b-4e5f-9bfa-2e4a6c8d0e9b', '6588c6df-0081-4a2e-98b9-eb4f578947a7');
INSERT INTO listing_categories (listing_id, category_id) VALUES ('f1b3d5e7-2a4c-4f6a-9cab-3f5b7d9e1f0c', '6588c6df-0081-4a2e-98b9-eb4f578947a7');
INSERT INTO listing_categories (listing_id, category_id) VALUES ('a2c4e6f8-3b5d-4a7b-9dbc-4a6c8e0f2a1d', '6588c6df-0081-4a2e-98b9-eb4f578947a7');
INSERT INTO listing_categories (listing_id, category_id) VALUES ('b3d5f7a9-4c6e-4b8c-9ecd-5b7d9f1a3b2e', '6588c6df-0081-4a2e-98b9-eb4f578947a7');
