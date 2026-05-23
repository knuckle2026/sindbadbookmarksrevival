-- 2026-05-23: ゲイバー0件の県に mixbar カテゴリで補充
-- 出典: gclick pref=15/18/29/35&genre=20 (新潟/福井/奈良/山口)
-- 0 件県 10 県のうち 4 県で URL あり + 接続OK の mixbar を 1 件ずつ採用
-- 他 6 県 (toyama/yamanashi/shiga/wakayama/tottori/saga) は gclick に
-- データなし or 接続不可で補充不能。
-- カテゴリは mixbar のみ (gay-bar カウントは 0 のまま)
-- owner: 編集部 (00000000-0000-0000-0000-000000000001)

INSERT INTO listings (id, user_id, genre_id, title, description, address, website_url, prefecture, status, created_by, updated_by)
VALUES ('e2a4c6f8-3b5d-4e7f-9bea-2c4e6a8b0c3d', '00000000-0000-0000-0000-000000000001', '6f7f62e6-9188-4bea-b71a-b19dd5583d90',
  'mix Bar jungleish',
  '新潟駅徒歩5分のミックスバー。2020年7月OPEN。LGBT歓迎、60分飲み放題・カラオケ無料。',
  '〒950-0087 新潟県新潟市中央区東大通1-11-12 パルコミニオンビル B1F',
  'https://x.com/mixbarjungleish',
  'niigata', 'published',
  '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001');

INSERT INTO listings (id, user_id, genre_id, title, description, address, website_url, prefecture, status, created_by, updated_by)
VALUES ('f3b5d7a9-4c6e-4f8a-9cfb-3d5f7b9c1d4e', '00000000-0000-0000-0000-000000000001', '6f7f62e6-9188-4bea-b71a-b19dd5583d90',
  'Bar 妖かし',
  '福井市順化のミックスバー。低価格、日替わりスタッフ。気軽に立ち寄れる雰囲気。',
  '〒910-0023 福井県福井市順化1-14-22 桑の実会館 地下',
  'https://x.com/hanakainn',
  'fukui', 'published',
  '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001');

INSERT INTO listings (id, user_id, genre_id, title, description, address, website_url, prefecture, status, created_by, updated_by)
VALUES ('a4c6e8b0-5d7f-4a9b-9dac-4e6a8c0d2e5f', '00000000-0000-0000-0000-000000000001', '6f7f62e6-9188-4bea-b71a-b19dd5583d90',
  '秘密基地 ScarFace',
  '大和高田市の GAYmix バー。2001年OPEN、性的少数者中心。曜日でスタイル変化、HP要確認。',
  '〒635-0087 奈良県大和高田市内本町5-3 錦花楼 1F',
  'https://scarface.pages.wox.cc/',
  'nara', 'published',
  '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001');

INSERT INTO listings (id, user_id, genre_id, title, description, address, website_url, prefecture, status, created_by, updated_by)
VALUES ('b5d7f9c1-6e8a-4b0c-9ebd-5f7b9d1e3f6a', '00000000-0000-0000-0000-000000000001', '6f7f62e6-9188-4bea-b71a-b19dd5583d90',
  'MIX BAR share',
  '下関駅徒歩5分のMIX BAR。2023年7月OPEN、2025年2月唐戸から豊前田町へ移転。',
  '〒750-0018 山口県下関市豊前田町2-8-9 角田ビル 5F',
  'https://x.com/share_karato',
  'yamaguchi', 'published',
  '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001');

-- listing_categories: mixbar カテゴリのみ (3da30b41-7958-4cf9-801e-3fd23b99dd02)
INSERT INTO listing_categories (listing_id, category_id) VALUES ('e2a4c6f8-3b5d-4e7f-9bea-2c4e6a8b0c3d', '3da30b41-7958-4cf9-801e-3fd23b99dd02');
INSERT INTO listing_categories (listing_id, category_id) VALUES ('f3b5d7a9-4c6e-4f8a-9cfb-3d5f7b9c1d4e', '3da30b41-7958-4cf9-801e-3fd23b99dd02');
INSERT INTO listing_categories (listing_id, category_id) VALUES ('a4c6e8b0-5d7f-4a9b-9dac-4e6a8c0d2e5f', '3da30b41-7958-4cf9-801e-3fd23b99dd02');
INSERT INTO listing_categories (listing_id, category_id) VALUES ('b5d7f9c1-6e8a-4b0c-9ebd-5f7b9d1e3f6a', '3da30b41-7958-4cf9-801e-3fd23b99dd02');
