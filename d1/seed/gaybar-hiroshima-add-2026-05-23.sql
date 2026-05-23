-- 2026-05-23: バー・クラブ・飲食店 > ゲイバー 広島県 追加1件
-- 出典: gclick pref=34&genre=1 (サイト不通時はXフォールバック対応)
-- 全21店中、サイト or X 接続OK は 13 件、12 件既存重複。新規 1 件のみ。
-- (5件分は無し)
-- USED -our hiding place- は title 23字超のため "USED -hiding place-" に短縮。
-- owner: 編集部 (00000000-0000-0000-0000-000000000001)

INSERT INTO listings (id, user_id, genre_id, title, description, address, website_url, prefecture, status, created_by, updated_by)
VALUES ('c2e4f6b8-3d5a-4c7d-9af3-4d6f8b0c2e1f', '00000000-0000-0000-0000-000000000001', '6f7f62e6-9188-4bea-b71a-b19dd5583d90',
  'USED -hiding place-',
  '広島市流川町のゲイバー。お客様に慣れ親しんでもらえる空間作り。X で情報発信。',
  '〒730-0028 広島県広島市中区流川町8-11 中川2ビル 201',
  'https://x.com/USEDhiroshima',
  'hiroshima', 'published',
  '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001');

INSERT INTO listing_categories (listing_id, category_id) VALUES ('c2e4f6b8-3d5a-4c7d-9af3-4d6f8b0c2e1f', '6588c6df-0081-4a2e-98b9-eb4f578947a7');
