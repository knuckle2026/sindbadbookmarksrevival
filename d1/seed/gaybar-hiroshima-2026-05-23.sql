-- 2026-05-23: バー・クラブ・飲食店 > ゲイバー 広島県 2件追加
-- 出典: gclick pref=34&genre=1 (X URL も許可)
-- 全21店中、公式サイト or X + 接続確認OK は 11 件、うち 9 件既存重複。
-- 残り 2 件のみ (5件分は無し)。
-- pPside+-anotherlevel- は title 21字超のため末尾の "-" を 1文字削除。
-- owner: 編集部 (00000000-0000-0000-0000-000000000001)

INSERT INTO listings (id, user_id, genre_id, title, description, address, website_url, prefecture, status, created_by, updated_by)
VALUES ('a0c2e4f6-1d3a-4b5c-9af0-2c4e6a8b0d9e', '00000000-0000-0000-0000-000000000001', '6f7f62e6-9188-4bea-b71a-b19dd5583d90',
  'Bar Zero',
  '福山市松浜町のゲイバー。2022年7月8日OPEN。X で情報発信。',
  '〒720-0802 広島県福山市松浜町1-12-10 バーレンビル 2F',
  'https://x.com/fukuyama_Zero',
  'hiroshima', 'published',
  '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001');

INSERT INTO listings (id, user_id, genre_id, title, description, address, website_url, prefecture, status, created_by, updated_by)
VALUES ('b1d3f5a7-2e4b-4c6d-9bd1-3d5f7b9c1e0a', '00000000-0000-0000-0000-000000000001', '6f7f62e6-9188-4bea-b71a-b19dd5583d90',
  'pPside+-anotherlevel',
  '広島市銀山町の出逢いスペースBAR。広島一広いスペース、初心者・県外客も大歓迎。',
  '〒730-0022 広島県広島市中区銀山町13-13 シャトレ3ビル 4F',
  'https://www.bar-pp.com/',
  'hiroshima', 'published',
  '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001');

INSERT INTO listing_categories (listing_id, category_id) VALUES ('a0c2e4f6-1d3a-4b5c-9af0-2c4e6a8b0d9e', '6588c6df-0081-4a2e-98b9-eb4f578947a7');
INSERT INTO listing_categories (listing_id, category_id) VALUES ('b1d3f5a7-2e4b-4c6d-9bd1-3d5f7b9c1e0a', '6588c6df-0081-4a2e-98b9-eb4f578947a7');
