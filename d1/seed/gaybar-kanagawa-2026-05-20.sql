-- 2026-05-20: バー・クラブ・飲食店 > ゲイバー に神奈川3件追加
-- 出典: gclick pref=14&genre=1 (start=1)
-- 全7店中、既存重複 (龍馬, KAB横浜, BE☆ST, MONS @yokohama) を除外、残り3件のみ。
-- Endless sorrow Yokohama は title が20文字を超えるため「Endless sorrow 横浜」に短縮。
-- owner: 編集部 (00000000-0000-0000-0000-000000000001)

INSERT INTO listings (id, user_id, genre_id, title, description, address, website_url, prefecture, status, created_by, updated_by)
VALUES ('80a4c6e8-7d9f-4a1b-93cd-1b3e5f7a9c80', '00000000-0000-0000-0000-000000000001', '6f7f62e6-9188-4bea-b71a-b19dd5583d90',
  'Bar CHIS',
  '川崎の10年目ゲイバー。お酒・カラオケ・会話で新しい出会い。グループ・カップル・1人歓迎。',
  '〒210-0006 神奈川県川崎市川崎区砂子2-10-5 1F',
  'http://www.chis-kawasaki.com/',
  'kanagawa', 'published',
  '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001');

INSERT INTO listings (id, user_id, genre_id, title, description, address, website_url, prefecture, status, created_by, updated_by)
VALUES ('81b5d7f9-8e0a-4b2c-94de-2c4f6a8b0d81', '00000000-0000-0000-0000-000000000001', '6f7f62e6-9188-4bea-b71a-b19dd5583d90',
  'ロング･ロング･ア号',
  '川崎市中原区新丸子のゲイバー。',
  '〒211-0004 神奈川県川崎市中原区新丸子東1-764-11 ソシアルビル 1F C号',
  'http://long-long-ago.club/',
  'kanagawa', 'published',
  '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001');

INSERT INTO listings (id, user_id, genre_id, title, description, address, website_url, prefecture, status, created_by, updated_by)
VALUES ('82c6e8a0-9f1b-4c3d-95ef-3d5a7b9c1e82', '00000000-0000-0000-0000-000000000001', '6f7f62e6-9188-4bea-b71a-b19dd5583d90',
  'Endless sorrow 横浜',
  '2025年7月OPEN、横浜野毛で朝~昼飲みができるゲイバー。基本土日営業、ママは太郎。',
  '〒231-0064 神奈川県横浜市中区野毛町1-6 加賀美ビル 201',
  'https://www4.hp-ez.com/hp/es2025',
  'kanagawa', 'published',
  '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001');

INSERT INTO listing_categories (listing_id, category_id) VALUES ('80a4c6e8-7d9f-4a1b-93cd-1b3e5f7a9c80', '6588c6df-0081-4a2e-98b9-eb4f578947a7');
INSERT INTO listing_categories (listing_id, category_id) VALUES ('81b5d7f9-8e0a-4b2c-94de-2c4f6a8b0d81', '6588c6df-0081-4a2e-98b9-eb4f578947a7');
INSERT INTO listing_categories (listing_id, category_id) VALUES ('82c6e8a0-9f1b-4c3d-95ef-3d5a7b9c1e82', '6588c6df-0081-4a2e-98b9-eb4f578947a7');
