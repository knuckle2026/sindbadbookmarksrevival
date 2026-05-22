-- 2026-05-22: バー・クラブ・飲食店 > ゲイバー 埼玉県 3件追加
-- 出典: gclick pref=11&genre=1
-- 全14店中、公式サイト + 接続確認OK は 3 件のみ (5件分は無し)。重複なし。
-- owner: 編集部 (00000000-0000-0000-0000-000000000001)

INSERT INTO listings (id, user_id, genre_id, title, description, address, website_url, prefecture, status, created_by, updated_by)
VALUES ('d1e3f5a7-2b4c-4d6e-9f8a-1b3c5d7e9f0a', '00000000-0000-0000-0000-000000000001', '6f7f62e6-9188-4bea-b71a-b19dd5583d90',
  '大宮Bar Raccoon',
  '大宮駅東口徒歩4分、2010年OPENの老舗ゲイバー。2025年で15周年。SNSで最新情報発信。男性専用。',
  '〒330-0846 埼玉県さいたま市大宮区大門町2-28 第一松ビル 3F',
  'http://raccoon2010.web.fc2.com/',
  'saitama', 'published',
  '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001');

INSERT INTO listings (id, user_id, genre_id, title, description, address, website_url, prefecture, status, created_by, updated_by)
VALUES ('e2f4a6b8-3c5d-4e7f-9a0b-2c4d6e8f0a1b', '00000000-0000-0000-0000-000000000001', '6f7f62e6-9188-4bea-b71a-b19dd5583d90',
  'Bar Sage',
  '2022年9月OPEN、春日部のゲイバー。地元の仲間で集まって飲める雰囲気。',
  '〒344-0021 埼玉県春日部市大場1090',
  'https://www.sage0121.com/sage',
  'saitama', 'published',
  '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001');

INSERT INTO listings (id, user_id, genre_id, title, description, address, website_url, prefecture, status, created_by, updated_by)
VALUES ('f3a5b7c9-4d6e-4f8a-9b1c-3d5e7f9a1b2c', '00000000-0000-0000-0000-000000000001', '6f7f62e6-9188-4bea-b71a-b19dd5583d90',
  'COSY',
  '草加市谷塚駅西口徒歩1.5分のゲイバー。カラオケなし、落ち着いて飲める雰囲気。1人歓迎。',
  '〒340-0023 埼玉県草加市谷塚町544-1 1F',
  'http://eijun06010601.wixsite.com/mysite',
  'saitama', 'published',
  '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001');

INSERT INTO listing_categories (listing_id, category_id) VALUES ('d1e3f5a7-2b4c-4d6e-9f8a-1b3c5d7e9f0a', '6588c6df-0081-4a2e-98b9-eb4f578947a7');
INSERT INTO listing_categories (listing_id, category_id) VALUES ('e2f4a6b8-3c5d-4e7f-9a0b-2c4d6e8f0a1b', '6588c6df-0081-4a2e-98b9-eb4f578947a7');
INSERT INTO listing_categories (listing_id, category_id) VALUES ('f3a5b7c9-4d6e-4f8a-9b1c-3d5e7f9a1b2c', '6588c6df-0081-4a2e-98b9-eb4f578947a7');
