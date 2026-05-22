-- 2026-05-23: バー・クラブ・飲食店 > ゲイバー 四国 4県集約 4件追加
-- 出典: gclick pref=36/37/38/39&genre=1
-- 4県合計の検索結果から公式サイト + 接続確認OK は 4 件 (5件分は無し)。重複なし。
-- pref=36 (徳島) はゼロ件。
-- owner: 編集部 (00000000-0000-0000-0000-000000000001)

INSERT INTO listings (id, user_id, genre_id, title, description, address, website_url, prefecture, status, created_by, updated_by)
VALUES ('c5e7a9b1-6d8f-4c0d-9eb6-7a9b1c3d5e4f', '00000000-0000-0000-0000-000000000001', '6f7f62e6-9188-4bea-b71a-b19dd5583d90',
  'LGBT Bar Action!!',
  '高松市古馬場町のLGBT限定バー。高松唯一、宅飲み風アットホームな雰囲気。',
  '〒760-0045 香川県高松市古馬場町8-6 コンソールビル 2階奥',
  'http://www.aiki-evolution.jp/action/',
  'kagawa', 'published',
  '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001');

INSERT INTO listings (id, user_id, genre_id, title, description, address, website_url, prefecture, status, created_by, updated_by)
VALUES ('d6f8b0c2-7e9a-4d1e-9fc7-8b0c2d4e6f5a', '00000000-0000-0000-0000-000000000001', '6f7f62e6-9188-4bea-b71a-b19dd5583d90',
  'HAPPY DRAGON',
  '2001年2月OPEN、松山三番町のゲイバー。初心者歓迎、テニスサークルもあり。',
  '〒790-0003 愛媛県松山市三番町1-16-4 ハーフビル 3F',
  'http://wwwe.pikara.ne.jp/happy-dragon/',
  'ehime', 'published',
  '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001');

INSERT INTO listings (id, user_id, genre_id, title, description, address, website_url, prefecture, status, created_by, updated_by)
VALUES ('e7a9c1d3-8f0b-4e2f-9ad8-9c1d3e5f7a6b', '00000000-0000-0000-0000-000000000001', '6f7f62e6-9188-4bea-b71a-b19dd5583d90',
  'ナイトラウンジ 街道',
  '松山45年の老舗ゲイバー。内装新規リニューアル、出張・旅行客歓迎。',
  '〒790-0801 愛媛県松山市歩行町1-13-3 御宝ハイツ 2F',
  'http://www3.hp-ez.com/hp/matsuyamakaidoh/',
  'ehime', 'published',
  '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001');

INSERT INTO listings (id, user_id, genre_id, title, description, address, website_url, prefecture, status, created_by, updated_by)
VALUES ('f8b0d2e4-9a1c-4f3a-9be9-0d2e4f6a8b7c', '00000000-0000-0000-0000-000000000001', '6f7f62e6-9188-4bea-b71a-b19dd5583d90',
  'パプリカ',
  '2020年7月OPEN、高知市廿代町のゲイバー (元アーモンド)。1人でも入りやすい雰囲気。',
  '〒780-0843 高知県高知市廿代町3-24 オクダビル 6F',
  'http://almondkochi.blog.fc2.com/',
  'kochi', 'published',
  '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001');

INSERT INTO listing_categories (listing_id, category_id) VALUES ('c5e7a9b1-6d8f-4c0d-9eb6-7a9b1c3d5e4f', '6588c6df-0081-4a2e-98b9-eb4f578947a7');
INSERT INTO listing_categories (listing_id, category_id) VALUES ('d6f8b0c2-7e9a-4d1e-9fc7-8b0c2d4e6f5a', '6588c6df-0081-4a2e-98b9-eb4f578947a7');
INSERT INTO listing_categories (listing_id, category_id) VALUES ('e7a9c1d3-8f0b-4e2f-9ad8-9c1d3e5f7a6b', '6588c6df-0081-4a2e-98b9-eb4f578947a7');
INSERT INTO listing_categories (listing_id, category_id) VALUES ('f8b0d2e4-9a1c-4f3a-9be9-0d2e4f6a8b7c', '6588c6df-0081-4a2e-98b9-eb4f578947a7');
