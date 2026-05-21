-- 2026-05-21: バー・クラブ・飲食店 > 女装 + サロン (両方 ON) に5件追加
-- 出典: https://www.gpress.com/cgi-bin/gixsearch3.cgi?keyword=女装サロン
-- 公式サイト + 接続確認OK。Xアカウントのみ(エリザベス浅草橋)も含む。
-- 重複なし。両カテゴリ (drag + salon) を listing_categories に登録。
-- owner: 編集部 (00000000-0000-0000-0000-000000000001)
-- genre: bar-restaurant (6f7f62e6-9188-4bea-b71a-b19dd5583d90)
-- categories: drag (89be9772-ee45-4ea7-8969-e38baa81a0db) + salon (baeadbbb-35e2-4cbe-954e-e26f885dd80f)

INSERT INTO listings (id, user_id, genre_id, title, description, website_url, prefecture, status, created_by, updated_by)
VALUES ('c0a4c6e8-7d9f-4a1b-93cd-1b3e5f7a9cc0', '00000000-0000-0000-0000-000000000001', '6f7f62e6-9188-4bea-b71a-b19dd5583d90',
  '女装サロン ARTEMIS アルテミス',
  '横浜市の女装メイク・撮影サロン。営業案内、ゲスト写真、コラム集を公開。',
  'http://www.arutemisu.com',
  'kanagawa', 'published',
  '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001');

INSERT INTO listings (id, user_id, genre_id, title, description, website_url, prefecture, ward, status, created_by, updated_by)
VALUES ('c1b5d7f9-8e0a-4b2c-94de-2c4f6a8b0dc1', '00000000-0000-0000-0000-000000000001', '6f7f62e6-9188-4bea-b71a-b19dd5583d90',
  'with',
  '東京・浅草の女装サロン。和装変身、撮影コース、本格お縛り撮影コースなどあり。',
  'https://makeover-with.com',
  'tokyo', 'taito', 'published',
  '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001');

INSERT INTO listings (id, user_id, genre_id, title, description, website_url, prefecture, ward, status, created_by, updated_by)
VALUES ('c2c6e8a0-9f1b-4c3d-95ef-3d5a7b9c1ec2', '00000000-0000-0000-0000-000000000001', '6f7f62e6-9188-4bea-b71a-b19dd5583d90',
  'エリザベス浅草橋店',
  '東京・浅草橋の女装サロン兼メイクルーム。Xで情報発信。',
  'https://x.com/eli_asksbs',
  'tokyo', 'taito', 'published',
  '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001');

INSERT INTO listings (id, user_id, genre_id, title, description, website_url, prefecture, status, created_by, updated_by)
VALUES ('c3d7f9b1-0a2c-4d4e-96fa-4e6b8c0d2fc3', '00000000-0000-0000-0000-000000000001', '6f7f62e6-9188-4bea-b71a-b19dd5583d90',
  '女装サロン オペラ座プリンセスハウス',
  '千葉県柏市の女装サロン。写真・動画撮影あり。東京にも店舗あり。',
  'https://www.operatheprincesshouse.com',
  'chiba', 'published',
  '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001');

INSERT INTO listings (id, user_id, genre_id, title, description, website_url, prefecture, ward, status, created_by, updated_by)
VALUES ('c4e8a0c2-1b3d-4e5f-97ab-5f7c9d1e3ac4', '00000000-0000-0000-0000-000000000001', '6f7f62e6-9188-4bea-b71a-b19dd5583d90',
  '女の子クラブ 新宿本店',
  '新宿2丁目の女装サロンバー。営業案内・お知らせをサイトで公開。',
  'http://girls-club.jp',
  'tokyo', 'shinjuku', 'published',
  '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001');

-- 各 listing に drag + salon の両方を紐付け
INSERT INTO listing_categories (listing_id, category_id) VALUES ('c0a4c6e8-7d9f-4a1b-93cd-1b3e5f7a9cc0', '89be9772-ee45-4ea7-8969-e38baa81a0db');
INSERT INTO listing_categories (listing_id, category_id) VALUES ('c0a4c6e8-7d9f-4a1b-93cd-1b3e5f7a9cc0', 'baeadbbb-35e2-4cbe-954e-e26f885dd80f');
INSERT INTO listing_categories (listing_id, category_id) VALUES ('c1b5d7f9-8e0a-4b2c-94de-2c4f6a8b0dc1', '89be9772-ee45-4ea7-8969-e38baa81a0db');
INSERT INTO listing_categories (listing_id, category_id) VALUES ('c1b5d7f9-8e0a-4b2c-94de-2c4f6a8b0dc1', 'baeadbbb-35e2-4cbe-954e-e26f885dd80f');
INSERT INTO listing_categories (listing_id, category_id) VALUES ('c2c6e8a0-9f1b-4c3d-95ef-3d5a7b9c1ec2', '89be9772-ee45-4ea7-8969-e38baa81a0db');
INSERT INTO listing_categories (listing_id, category_id) VALUES ('c2c6e8a0-9f1b-4c3d-95ef-3d5a7b9c1ec2', 'baeadbbb-35e2-4cbe-954e-e26f885dd80f');
INSERT INTO listing_categories (listing_id, category_id) VALUES ('c3d7f9b1-0a2c-4d4e-96fa-4e6b8c0d2fc3', '89be9772-ee45-4ea7-8969-e38baa81a0db');
INSERT INTO listing_categories (listing_id, category_id) VALUES ('c3d7f9b1-0a2c-4d4e-96fa-4e6b8c0d2fc3', 'baeadbbb-35e2-4cbe-954e-e26f885dd80f');
INSERT INTO listing_categories (listing_id, category_id) VALUES ('c4e8a0c2-1b3d-4e5f-97ab-5f7c9d1e3ac4', '89be9772-ee45-4ea7-8969-e38baa81a0db');
INSERT INTO listing_categories (listing_id, category_id) VALUES ('c4e8a0c2-1b3d-4e5f-97ab-5f7c9d1e3ac4', 'baeadbbb-35e2-4cbe-954e-e26f885dd80f');
