-- 2026-05-23: バー・クラブ・飲食店 > ゲイバー 宮崎県 2件追加
-- 出典: gclick pref=45&genre=1 (site→X 3段階フォールバック)
-- 全5店中、URL あり + 接続OK は 2 件 (5件分は無し)。重複なし。
-- owner: 編集部 (00000000-0000-0000-0000-000000000001)

INSERT INTO listings (id, user_id, genre_id, title, description, address, website_url, prefecture, status, created_by, updated_by)
VALUES ('c4e6a8b0-5d7f-4c9d-9fdb-6c8e0a2b4c3d', '00000000-0000-0000-0000-000000000001', '6f7f62e6-9188-4bea-b71a-b19dd5583d90',
  '578deBAR',
  '宮崎市高松町のゲイバー。金土22:00~営業 (それまでは居酒屋)。ノンケ対策で入口貸切札。',
  '〒880-0003 宮崎県宮崎市高松町2-28 かがみマンション 1F',
  'https://x.com/578deBAR',
  'miyazaki', 'published',
  '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001');

INSERT INTO listings (id, user_id, genre_id, title, description, address, website_url, prefecture, status, created_by, updated_by)
VALUES ('d5f7b9c1-6e8a-4d0e-9aec-7d9f1b3c5d4e', '00000000-0000-0000-0000-000000000001', '6f7f62e6-9188-4bea-b71a-b19dd5583d90',
  'ARASHI',
  '宮崎市橘通西のゲイバー。ショット/ボトル/飲歌放題から選択可。LIVE DAMカラオケ完備。',
  '〒880-0001 宮崎県宮崎市橘通西3丁目4番4号 第2ワタナベビル 3F',
  'https://x.com/ARASHI201104',
  'miyazaki', 'published',
  '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001');

INSERT INTO listing_categories (listing_id, category_id) VALUES ('c4e6a8b0-5d7f-4c9d-9fdb-6c8e0a2b4c3d', '6588c6df-0081-4a2e-98b9-eb4f578947a7');
INSERT INTO listing_categories (listing_id, category_id) VALUES ('d5f7b9c1-6e8a-4d0e-9aec-7d9f1b3c5d4e', '6588c6df-0081-4a2e-98b9-eb4f578947a7');
