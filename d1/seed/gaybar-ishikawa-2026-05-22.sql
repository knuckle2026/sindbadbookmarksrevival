-- 2026-05-22: バー・クラブ・飲食店 > ゲイバー 石川県 3件追加
-- 出典: gclick pref=17&genre=1
-- 全8店中、公式サイト + 接続確認OK は 3 件 (5件分は無し)。重複なし。
-- owner: 編集部 (00000000-0000-0000-0000-000000000001)

INSERT INTO listings (id, user_id, genre_id, title, description, address, website_url, prefecture, status, created_by, updated_by)
VALUES ('e8a0b2c4-9d1e-4f3a-95b6-7c8d0e2f4a5b', '00000000-0000-0000-0000-000000000001', '6f7f62e6-9188-4bea-b71a-b19dd5583d90',
  '真珠貝',
  '金沢片町32年の老舗ゲイバー。40~60代中心、カラオケ500円歌い放題、明朗会計。男性専用。',
  '〒920-0981 石川県金沢市片町1-8-7 のざきビル 3階',
  'http://www.spacelan.ne.jp/~mayo/mobile.html',
  'ishikawa', 'published',
  '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001');

INSERT INTO listings (id, user_id, genre_id, title, description, address, website_url, prefecture, status, created_by, updated_by)
VALUES ('f9b1c3d5-0e2f-4a4b-96c7-8d9e1f3a5b6c', '00000000-0000-0000-0000-000000000001', '6f7f62e6-9188-4bea-b71a-b19dd5583d90',
  'ＰＯＴＡＴＯ',
  '金沢片町のゲイバー。年齢・体型幅広い客層、繁華街ながら落ち着いた雰囲気。',
  '〒920-0981 石川県金沢市片町2-12-12 ビルA 1F',
  'http://kanazawapotato.web.fc2.com/',
  'ishikawa', 'published',
  '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001');

INSERT INTO listings (id, user_id, genre_id, title, description, address, website_url, prefecture, status, created_by, updated_by)
VALUES ('a0c2d4e6-1f3a-4b5c-97d8-9e0f2a4b6c7d', '00000000-0000-0000-0000-000000000001', '6f7f62e6-9188-4bea-b71a-b19dd5583d90',
  'area RAINBOW',
  '金沢片町の白基調の明るいゲイバー。カウンター10席+ボックス、初心者・グループOK。',
  '〒920-0981 石川県金沢市片町2-22-13 サイガワスカールビル 2F',
  'https://arearainbow.dino.vc/',
  'ishikawa', 'published',
  '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001');

INSERT INTO listing_categories (listing_id, category_id) VALUES ('e8a0b2c4-9d1e-4f3a-95b6-7c8d0e2f4a5b', '6588c6df-0081-4a2e-98b9-eb4f578947a7');
INSERT INTO listing_categories (listing_id, category_id) VALUES ('f9b1c3d5-0e2f-4a4b-96c7-8d9e1f3a5b6c', '6588c6df-0081-4a2e-98b9-eb4f578947a7');
INSERT INTO listing_categories (listing_id, category_id) VALUES ('a0c2d4e6-1f3a-4b5c-97d8-9e0f2a4b6c7d', '6588c6df-0081-4a2e-98b9-eb4f578947a7');
