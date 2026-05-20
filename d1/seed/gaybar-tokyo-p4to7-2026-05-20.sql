-- 2026-05-20: バー・クラブ・飲食店 > ゲイバー 6件追加 (p4-p7 集約)
-- 出典: gclick pref=13&genre=1 start=76/101/126/151
-- 4ページ合計から重複 (SM&Fetish BAR GATT, Kab's, Greendayz, ししまる, Synapse,
-- ひげ, AshuraBar 上野店, BINGO!, ひで) を除外した結果 6件のみ。
-- 全 URL を GET で接続確認済み (200 OK)。
-- 前回 multi-row INSERT で一部 silently fail したため個別 INSERT に変更。
-- owner: 編集部 (00000000-0000-0000-0000-000000000001)

INSERT INTO listings (id, user_id, genre_id, title, description, address, website_url, prefecture, ward, status, created_by, updated_by)
VALUES ('20a4c6e8-7d9f-4a1b-93cd-1b3e5f7a9c20', '00000000-0000-0000-0000-000000000001', '6f7f62e6-9188-4bea-b71a-b19dd5583d90',
  'TURF',
  '上野の老舗ゲイバー。シャトウ上野ビル4F。',
  '〒110-0005 東京都台東区上野7-10-5 シャトウ上野ビル 4F',
  'http://ip.tosp.co.jp/i.asp?i=turfueno',
  'tokyo', 'taito', 'published',
  '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001');

INSERT INTO listings (id, user_id, genre_id, title, description, address, website_url, prefecture, ward, status, created_by, updated_by)
VALUES ('21b5d7f9-8e0a-4b2c-94de-2c4f6a8b0d21', '00000000-0000-0000-0000-000000000001', '6f7f62e6-9188-4bea-b71a-b19dd5583d90',
  'スナック光',
  '上野のゲイバー。30~50代中心。毎週火曜は褌の日(六尺・越中・黒猫)、貸褌あり。',
  '〒110-0005 東京都台東区上野7-5-6 NKYMハイツ 201',
  'http://k2.fc2.com/cgi-bin/hp.cgi/sunack-kou/',
  'tokyo', 'taito', 'published',
  '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001');

INSERT INTO listings (id, user_id, genre_id, title, description, address, website_url, prefecture, ward, status, created_by, updated_by)
VALUES ('22c6e8a0-9f1b-4c3d-95ef-3d5a7b9c1e22', '00000000-0000-0000-0000-000000000001', '6f7f62e6-9188-4bea-b71a-b19dd5583d90',
  '瓢箪から独楽',
  '上野・昭栄ビル5Fのゲイバー。カラオケ無料、新規開店。',
  '〒110-0005 東京都台東区上野7-2-1 昭栄ビル 5F',
  'http://k1.fc2.com/cgi-bin/hp.cgi/uenokoma/',
  'tokyo', 'taito', 'published',
  '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001');

INSERT INTO listings (id, user_id, genre_id, title, description, address, website_url, prefecture, ward, status, created_by, updated_by)
VALUES ('23d7f9b1-0a2c-4d4e-96fa-4e6b8c0d2f23', '00000000-0000-0000-0000-000000000001', '6f7f62e6-9188-4bea-b71a-b19dd5583d90',
  'ふじ 司',
  '上野・女人禁制の落ち着いたゲイバー。藤岡琢也似オーナーと鼻髭マスターが迎える。',
  '〒110-0005 東京都台東区上野7-4-3 上野ビル 1F',
  'http://www.freepe.com/i.cgi?hujitukasa',
  'tokyo', 'taito', 'published',
  '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001');

INSERT INTO listings (id, user_id, genre_id, title, description, address, website_url, prefecture, ward, status, created_by, updated_by)
VALUES ('24e8a0c2-1b3d-4e5f-97ab-5f7c9d1e3a24', '00000000-0000-0000-0000-000000000001', '6f7f62e6-9188-4bea-b71a-b19dd5583d90',
  'BATTLE',
  '東上野のゲイバー。気軽に立ち寄れる雰囲気。',
  '〒110-0015 東京都台東区東上野4-7-12 2F',
  'http://battle.michikusa.jp/',
  'tokyo', 'taito', 'published',
  '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001');

INSERT INTO listings (id, user_id, genre_id, title, description, address, website_url, prefecture, ward, status, created_by, updated_by)
VALUES ('25f9b1d3-2c4e-4f6a-98bc-6a8d0e2f4b25', '00000000-0000-0000-0000-000000000001', '6f7f62e6-9188-4bea-b71a-b19dd5583d90',
  'うたかた',
  '上野のゲイスナック。40~70代の幅広いおじさまが集う、静かで平和な雰囲気。',
  '〒110-0005 東京都台東区上野7-4-1 2F',
  'http://uenoutakata.wixsite.com/utakata',
  'tokyo', 'taito', 'published',
  '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001');

INSERT INTO listing_categories (listing_id, category_id) VALUES ('20a4c6e8-7d9f-4a1b-93cd-1b3e5f7a9c20', '6588c6df-0081-4a2e-98b9-eb4f578947a7');
INSERT INTO listing_categories (listing_id, category_id) VALUES ('21b5d7f9-8e0a-4b2c-94de-2c4f6a8b0d21', '6588c6df-0081-4a2e-98b9-eb4f578947a7');
INSERT INTO listing_categories (listing_id, category_id) VALUES ('22c6e8a0-9f1b-4c3d-95ef-3d5a7b9c1e22', '6588c6df-0081-4a2e-98b9-eb4f578947a7');
INSERT INTO listing_categories (listing_id, category_id) VALUES ('23d7f9b1-0a2c-4d4e-96fa-4e6b8c0d2f23', '6588c6df-0081-4a2e-98b9-eb4f578947a7');
INSERT INTO listing_categories (listing_id, category_id) VALUES ('24e8a0c2-1b3d-4e5f-97ab-5f7c9d1e3a24', '6588c6df-0081-4a2e-98b9-eb4f578947a7');
INSERT INTO listing_categories (listing_id, category_id) VALUES ('25f9b1d3-2c4e-4f6a-98bc-6a8d0e2f4b25', '6588c6df-0081-4a2e-98b9-eb4f578947a7');
