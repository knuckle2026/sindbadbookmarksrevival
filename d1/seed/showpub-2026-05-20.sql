-- 2026-05-20: バー・クラブ・飲食店 > ショーパブ に4件追加
-- 出典: https://www.gclick.jp/search_list.php?genre=3 (公式サイト掲載店のみ)
-- 全14店中、公式サイト + 接続OK は 4 件のみ。重複なし。
-- 個別 INSERT (前回 multi-row INSERT で silent fail 経験のため)
-- owner: 編集部 (00000000-0000-0000-0000-000000000001)
-- genre: bar-restaurant, category: show pub (d1eb1c8c-f3c1-4b65-a8a2-14863349ef32)

INSERT INTO listings (id, user_id, genre_id, title, description, address, website_url, prefecture, ward, status, created_by, updated_by)
VALUES ('30a4c6e8-7d9f-4a1b-93cd-1b3e5f7a9c30', '00000000-0000-0000-0000-000000000001', '6f7f62e6-9188-4bea-b71a-b19dd5583d90',
  'PINK SODA',
  '千葉市中央区のショーパブ。10代~60代・外国人・女性歓迎。21:00-4:00、日祝定休。カラオケあり。',
  '〒260-0015 千葉県千葉市中央区富士見2-23-6 Kanビル 2F',
  'http://www.pink-soda.com/',
  'chiba', NULL, 'published',
  '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001');

INSERT INTO listings (id, user_id, genre_id, title, description, address, website_url, prefecture, ward, status, created_by, updated_by)
VALUES ('31b5d7f9-8e0a-4b2c-94de-2c4f6a8b0d31', '00000000-0000-0000-0000-000000000001', '6f7f62e6-9188-4bea-b71a-b19dd5583d90',
  '芸Barごだいけんと',
  '練馬・東大泉のショーパブ。現役プロ歌手ごだいけんとがママ。',
  '〒178-0063 東京都練馬区東大泉3-22-1 黒田第二学園ビル 3F',
  'http://geibargodaikento.web.fc2.com/',
  'tokyo', 'nerima', 'published',
  '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001');

INSERT INTO listings (id, user_id, genre_id, title, description, address, website_url, prefecture, ward, status, created_by, updated_by)
VALUES ('32c6e8a0-9f1b-4c3d-95ef-3d5a7b9c1e32', '00000000-0000-0000-0000-000000000001', '6f7f62e6-9188-4bea-b71a-b19dd5583d90',
  'ひげガール',
  '新宿2丁目のショーパブ。歌舞伎町ビル内、19:00開店。SNSでも情報発信。',
  '〒160-0021 東京都新宿区歌舞伎町1-2-8 第二ウィザードセブンビル 5F',
  'http://www.hige-girl.com/',
  'tokyo', 'shinjuku', 'published',
  '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001');

INSERT INTO listings (id, user_id, genre_id, title, description, address, website_url, prefecture, ward, status, created_by, updated_by)
VALUES ('33d7f9b1-0a2c-4d4e-96fa-4e6b8c0d2f33', '00000000-0000-0000-0000-000000000001', '6f7f62e6-9188-4bea-b71a-b19dd5583d90',
  'ベティのマヨネーズ',
  '大阪心斎橋のショーパブ。マスター・ベティ運営。18:30-1:30、月曜定休。女性入店可。',
  '〒542-0083 大阪府大阪市中央区東心斎橋2-3-22 玉八ビル 1F-B',
  'http://bettymayo.com/',
  'osaka', 'osaka-minami', 'published',
  '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001');

INSERT INTO listing_categories (listing_id, category_id) VALUES ('30a4c6e8-7d9f-4a1b-93cd-1b3e5f7a9c30', 'd1eb1c8c-f3c1-4b65-a8a2-14863349ef32');
INSERT INTO listing_categories (listing_id, category_id) VALUES ('31b5d7f9-8e0a-4b2c-94de-2c4f6a8b0d31', 'd1eb1c8c-f3c1-4b65-a8a2-14863349ef32');
INSERT INTO listing_categories (listing_id, category_id) VALUES ('32c6e8a0-9f1b-4c3d-95ef-3d5a7b9c1e32', 'd1eb1c8c-f3c1-4b65-a8a2-14863349ef32');
INSERT INTO listing_categories (listing_id, category_id) VALUES ('33d7f9b1-0a2c-4d4e-96fa-4e6b8c0d2f33', 'd1eb1c8c-f3c1-4b65-a8a2-14863349ef32');
