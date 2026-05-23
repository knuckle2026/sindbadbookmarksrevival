-- 2026-05-23: バー・クラブ・飲食店 > ゲイバー に追加
-- 出典1: gclick pref=44&genre=1 (大分): zero のみ HP あり、既存重複 → 0件
-- 出典2: gclick pref=23&genre=20 (愛知ミックスバー): URL OK 6件、重複2件
--         (七色パトス, zero) を除外、ゲイ要素のある 3 件を採用
-- owner: 編集部 (00000000-0000-0000-0000-000000000001)

INSERT INTO listings (id, user_id, genre_id, title, description, address, website_url, prefecture, status, created_by, updated_by)
VALUES ('b9d1f3e5-0c2a-4b4c-9eb0-1b3d5e7f9b0c', '00000000-0000-0000-0000-000000000001', '6f7f62e6-9188-4bea-b71a-b19dd5583d90',
  'QUEEN DIAMOND',
  '名古屋栄のドラァグクイーンゲイバー。2nd season開幕。スタッフ募集中、週1からOK。',
  '〒460-0008 愛知県名古屋市中区栄4-14-15 フジプラザビル 5F',
  'https://x.com/queen_season2',
  'aichi', 'published',
  '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001');

INSERT INTO listings (id, user_id, genre_id, title, description, address, website_url, prefecture, status, created_by, updated_by)
VALUES ('c0e2a4f6-1d3b-4c5d-9fc1-2c4e6a8b0c1d', '00000000-0000-0000-0000-000000000001', '6f7f62e6-9188-4bea-b71a-b19dd5583d90',
  'CAP UP',
  '名古屋栄4丁目の隠れ家MIX-GAYBAR。2部制、120分飲歌放題 GAY 3500円/その他 4000円。',
  '〒460-0008 愛知県名古屋市中区栄4-11-25 都興ビル 2F',
  'https://x.com/taku_ya0116',
  'aichi', 'published',
  '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001');

INSERT INTO listings (id, user_id, genre_id, title, description, address, website_url, prefecture, status, created_by, updated_by)
VALUES ('d1f3b5a7-2e4c-4d6e-9ad2-3d5f7b9c1d2e', '00000000-0000-0000-0000-000000000001', '6f7f62e6-9188-4bea-b71a-b19dd5583d90',
  'アダム',
  '名古屋伏見御園座裏の観光バー。1人客も歓迎、セット2000円 (1ドリンク+突出し3品)、カラオケ歌い放題。',
  '〒460-0008 愛知県名古屋市中区栄1-11-26 歌舞伎町ビル 1F',
  'https://x.com/kamui00055184',
  'aichi', 'published',
  '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001');

INSERT INTO listing_categories (listing_id, category_id) VALUES ('b9d1f3e5-0c2a-4b4c-9eb0-1b3d5e7f9b0c', '6588c6df-0081-4a2e-98b9-eb4f578947a7');
INSERT INTO listing_categories (listing_id, category_id) VALUES ('c0e2a4f6-1d3b-4c5d-9fc1-2c4e6a8b0c1d', '6588c6df-0081-4a2e-98b9-eb4f578947a7');
INSERT INTO listing_categories (listing_id, category_id) VALUES ('d1f3b5a7-2e4c-4d6e-9ad2-3d5f7b9c1d2e', '6588c6df-0081-4a2e-98b9-eb4f578947a7');
