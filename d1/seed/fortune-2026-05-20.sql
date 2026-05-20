-- 2026-05-20: その他 > 占い に5件追加
-- 出典: https://www.gclick.jp/search_list.php?keyword2=%E5%8D%A0%E3%81%84
-- 検索結果9件のうち、マッサージ店(ふんどしTakuya)は占いカテゴリ不適のため除外。
-- 公式サイト掲載 + 接続確認OK は 5 件のみ。
-- タロット占い・西洋占星術&癒しの店 サロン・TORA は title が20字超のため
-- 「タロット占い サロン・TORA」に短縮。
-- owner: 編集部 (00000000-0000-0000-0000-000000000001)
-- genre: other (6315411b-dcad-4c76-844e-709ba9490cca)
-- category: fortune (3d193c7d-68b0-43d6-9400-b60e74e93953)

INSERT INTO listings (id, user_id, genre_id, title, description, address, website_url, prefecture, ward, status, created_by, updated_by)
VALUES ('90a4c6e8-7d9f-4a1b-93cd-1b3e5f7a9c90', '00000000-0000-0000-0000-000000000001', '6315411b-dcad-4c76-844e-709ba9490cca',
  '雅の占い部屋',
  '千葉市川の40代占い師・雅が運営。タロットカード・西洋占星術でゲイ・バイの悩みを鑑定。',
  '〒272-0023 千葉県市川市',
  'http://miyabi.tou3.com/',
  'chiba', NULL, 'published',
  '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001');

INSERT INTO listings (id, user_id, genre_id, title, description, address, website_url, prefecture, ward, status, created_by, updated_by)
VALUES ('91b5d7f9-8e0a-4b2c-94de-2c4f6a8b0d91', '00000000-0000-0000-0000-000000000001', '6315411b-dcad-4c76-844e-709ba9490cca',
  'にじ海サロン',
  '新宿築地町のサロン。各種交流イベント・占いイベントを開催。ゲイ Only イベントもあり。',
  '〒162-0818 東京都新宿区築地町1-1 オーシャンヴィレッジII 101',
  'https://www.uranai.hkt2.com/',
  'tokyo', 'shinjuku', 'published',
  '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001');

INSERT INTO listings (id, user_id, genre_id, title, description, address, website_url, prefecture, ward, status, created_by, updated_by)
VALUES ('92c6e8a0-9f1b-4c3d-95ef-3d5a7b9c1e92', '00000000-0000-0000-0000-000000000001', '6315411b-dcad-4c76-844e-709ba9490cca',
  'プライベート占いサロン侑詩徹占',
  '大阪中崎のLGBT専門占いサロン。完全個室。初回5000円時間無制限。',
  '〒530-0015 大阪府大阪市北区中崎西2-6-3 パステルワン501 5F',
  'https://yushitessen.com/',
  'osaka', 'osaka-kita', 'published',
  '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001');

INSERT INTO listings (id, user_id, genre_id, title, description, address, website_url, prefecture, ward, status, created_by, updated_by)
VALUES ('93d7f9b1-0a2c-4d4e-96fa-4e6b8c0d2f93', '00000000-0000-0000-0000-000000000001', '6315411b-dcad-4c76-844e-709ba9490cca',
  'タロット占い サロン・TORA',
  '大阪中津のゲイの占師・和矢が運営。タロット・セラピー組合せたセッションでLGBT特有の悩み解決。',
  '〒531-0071 大阪府大阪市北区中津1-9-18 コーポ野方 1F',
  'http://www2u.biglobe.ne.jp/~kaz-ya/',
  'osaka', 'osaka-kita', 'published',
  '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001');

INSERT INTO listings (id, user_id, genre_id, title, description, address, website_url, prefecture, status, created_by, updated_by)
VALUES ('94e8a0c2-1b3d-4e5f-97ab-5f7c9d1e3a94', '00000000-0000-0000-0000-000000000001', '6315411b-dcad-4c76-844e-709ba9490cca',
  '倉敷手相占い 占えもん よしやん',
  '岡山県倉敷の手相・四柱推命占い。ゲイによるゲイのための人生占い。電話予約制。',
  '〒701-0102 岡山県倉敷市庄新町5-4-12',
  'https://www.uraemon-yoshiyan.com/',
  'okayama', 'published',
  '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001');

INSERT INTO listing_categories (listing_id, category_id) VALUES ('90a4c6e8-7d9f-4a1b-93cd-1b3e5f7a9c90', '3d193c7d-68b0-43d6-9400-b60e74e93953');
INSERT INTO listing_categories (listing_id, category_id) VALUES ('91b5d7f9-8e0a-4b2c-94de-2c4f6a8b0d91', '3d193c7d-68b0-43d6-9400-b60e74e93953');
INSERT INTO listing_categories (listing_id, category_id) VALUES ('92c6e8a0-9f1b-4c3d-95ef-3d5a7b9c1e92', '3d193c7d-68b0-43d6-9400-b60e74e93953');
INSERT INTO listing_categories (listing_id, category_id) VALUES ('93d7f9b1-0a2c-4d4e-96fa-4e6b8c0d2f93', '3d193c7d-68b0-43d6-9400-b60e74e93953');
INSERT INTO listing_categories (listing_id, category_id) VALUES ('94e8a0c2-1b3d-4e5f-97ab-5f7c9d1e3a94', '3d193c7d-68b0-43d6-9400-b60e74e93953');
