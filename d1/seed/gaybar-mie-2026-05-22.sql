-- 2026-05-22: バー・クラブ・飲食店 > ゲイバー 三重県 2件追加
-- 出典: gclick pref=24&genre=1
-- 全5店中、公式サイト + 接続確認OK は 2 件 (3件分は無し)。重複なし。
-- owner: 編集部 (00000000-0000-0000-0000-000000000001)

INSERT INTO listings (id, user_id, genre_id, title, description, address, website_url, prefecture, status, created_by, updated_by)
VALUES ('c3e5a7b9-4d6f-4c8d-9dea-5f7a9b1c3d2e', '00000000-0000-0000-0000-000000000001', '6f7f62e6-9188-4bea-b71a-b19dd5583d90',
  'UO82 Cafe&Bar',
  '三重県四日市の日曜日昼限定MensOnly Cafe&Bar。2500円飲み放題、1杯利用も歓迎。13:00-19:00。',
  '〒510-0087 三重県四日市市西新地8-5',
  'https://uo82.my.canva.site/13-19/',
  'mie', 'published',
  '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001');

INSERT INTO listings (id, user_id, genre_id, title, description, address, website_url, prefecture, status, created_by, updated_by)
VALUES ('d4f6b8c0-5e7a-4d9e-9efb-6a8b0c2d4e3f', '00000000-0000-0000-0000-000000000001', '6f7f62e6-9188-4bea-b71a-b19dd5583d90',
  '7seven∞infinity8',
  '四日市西浦のゲイバー。ワイワイ騒げる、悩みも話せる、出会いの場を提供。',
  '〒510-0071 三重県四日市市西浦2-3-2 プレーザービル 1F',
  'http://88.xmbs.jp/7seveninfinity8/',
  'mie', 'published',
  '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001');

INSERT INTO listing_categories (listing_id, category_id) VALUES ('c3e5a7b9-4d6f-4c8d-9dea-5f7a9b1c3d2e', '6588c6df-0081-4a2e-98b9-eb4f578947a7');
INSERT INTO listing_categories (listing_id, category_id) VALUES ('d4f6b8c0-5e7a-4d9e-9efb-6a8b0c2d4e3f', '6588c6df-0081-4a2e-98b9-eb4f578947a7');
