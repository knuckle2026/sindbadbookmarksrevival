-- 2026-05-22: バー・クラブ・飲食店 > ゲイバー 長野県 3件追加
-- 出典: gclick pref=20&genre=1
-- 全7店中、公式サイト + 接続確認OK は 3 件 (5件分は無し)。重複なし。
-- owner: 編集部 (00000000-0000-0000-0000-000000000001)

INSERT INTO listings (id, user_id, genre_id, title, description, address, website_url, prefecture, status, created_by, updated_by)
VALUES ('b1d3e5f7-2a4c-4d6e-98f9-0b2c4d6e8f1a', '00000000-0000-0000-0000-000000000001', '6f7f62e6-9188-4bea-b71a-b19dd5583d90',
  'くらうど',
  '松本市大手のゲイバー。幅広い年齢層、アットホームな雰囲気。',
  '〒390-0874 長野県松本市大手4-12-4 1F奥',
  'http://kumo.crayonsite.net/',
  'nagano', 'published',
  '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001');

INSERT INTO listings (id, user_id, genre_id, title, description, address, website_url, prefecture, status, created_by, updated_by)
VALUES ('c2e4f6a8-3b5d-4e7f-99a0-1c3d5e7f9a2b', '00000000-0000-0000-0000-000000000001', '6f7f62e6-9188-4bea-b71a-b19dd5583d90',
  'B★TOWN',
  '長野市西鶴賀のゲイバー。大学生~幅広い年齢層、アットホームでちょっと昭和な雰囲気。',
  '〒380-0814 長野県長野市西鶴賀1641 風林会館 1F',
  'http://41.xmbs.jp/btown/',
  'nagano', 'published',
  '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001');

INSERT INTO listings (id, user_id, genre_id, title, description, address, website_url, prefecture, status, created_by, updated_by)
VALUES ('d3f5a7b9-4c6e-4f8a-9ab1-2d4e6f8a0b3c', '00000000-0000-0000-0000-000000000001', '6f7f62e6-9188-4bea-b71a-b19dd5583d90',
  'バーピコピコ',
  '長野市権堂の小さなゲイバー。色んなお客さんと和気あいあいワイワイ飲める。',
  '〒380-0815 長野県長野市大字鶴賀田町2242 2階奥',
  'https://barpikopiko.jimdofree.com/',
  'nagano', 'published',
  '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001');

INSERT INTO listing_categories (listing_id, category_id) VALUES ('b1d3e5f7-2a4c-4d6e-98f9-0b2c4d6e8f1a', '6588c6df-0081-4a2e-98b9-eb4f578947a7');
INSERT INTO listing_categories (listing_id, category_id) VALUES ('c2e4f6a8-3b5d-4e7f-99a0-1c3d5e7f9a2b', '6588c6df-0081-4a2e-98b9-eb4f578947a7');
INSERT INTO listing_categories (listing_id, category_id) VALUES ('d3f5a7b9-4c6e-4f8a-9ab1-2d4e6f8a0b3c', '6588c6df-0081-4a2e-98b9-eb4f578947a7');
