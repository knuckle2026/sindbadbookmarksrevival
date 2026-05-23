-- 2026-05-23: バー・クラブ・飲食店 > ゲイバー 熊本県 3件追加
-- 出典: gclick pref=43&genre=1 (site→X 3段階フォールバック)
-- 全6店中、URL あり + 接続OK は 3 件、重複なし。
-- owner: 編集部 (00000000-0000-0000-0000-000000000001)

INSERT INTO listings (id, user_id, genre_id, title, description, address, website_url, prefecture, status, created_by, updated_by)
VALUES ('e6a8c0d2-7f9b-4e1f-9bed-8e0a2c4d6e5f', '00000000-0000-0000-0000-000000000001', '6f7f62e6-9188-4bea-b71a-b19dd5583d90',
  'GREECE',
  '熊本市下通のゲイバー。村上ビルBF。X で情報発信、楽しく飲める雰囲気。',
  '〒860-0807 熊本県熊本市下通1-8-5 村上ビル BF',
  'https://x.com/GREECE_1998',
  'kumamoto', 'published',
  '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001');

INSERT INTO listings (id, user_id, genre_id, title, description, address, website_url, prefecture, status, created_by, updated_by)
VALUES ('f7b9d1e3-8a0c-4f2a-9cfe-9f1b3d5e7f6a', '00000000-0000-0000-0000-000000000001', '6f7f62e6-9188-4bea-b71a-b19dd5583d90',
  'まさお',
  '熊本市中央区下通のゲイバー。アイアイビル3F。皆のお越しを待つ雰囲気。',
  '〒860-0807 熊本県熊本市中央区下通1-6-7 アイアイビル 3F',
  'http://masaosbar.x.fc2.com/',
  'kumamoto', 'published',
  '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001');

INSERT INTO listings (id, user_id, genre_id, title, description, address, website_url, prefecture, status, created_by, updated_by)
VALUES ('a8c0e2f4-9b1d-4a3b-9daf-0a2c4e6f8a7b', '00000000-0000-0000-0000-000000000001', '6f7f62e6-9188-4bea-b71a-b19dd5583d90',
  'POWER''',
  '熊本市下通のゲイバー。大和ビル2F。',
  '〒860-0807 熊本県熊本市下通1-6-15 大和ビル 2F',
  'http://wwwa.dcns.ne.jp/~orange51/power.htm',
  'kumamoto', 'published',
  '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001');

INSERT INTO listing_categories (listing_id, category_id) VALUES ('e6a8c0d2-7f9b-4e1f-9bed-8e0a2c4d6e5f', '6588c6df-0081-4a2e-98b9-eb4f578947a7');
INSERT INTO listing_categories (listing_id, category_id) VALUES ('f7b9d1e3-8a0c-4f2a-9cfe-9f1b3d5e7f6a', '6588c6df-0081-4a2e-98b9-eb4f578947a7');
INSERT INTO listing_categories (listing_id, category_id) VALUES ('a8c0e2f4-9b1d-4a3b-9daf-0a2c4e6f8a7b', '6588c6df-0081-4a2e-98b9-eb4f578947a7');
