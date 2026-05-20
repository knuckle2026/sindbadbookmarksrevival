-- 2026-05-20: バー・クラブ・飲食店 > ゲイバー 追加2件
-- 出典: https://www.gclick.jp/search_list.php?pref=13&genre=1
-- CREST は公式サイトあり、BAR ZATTA は公式サイトなしのため X (Twitter) URL を使用
-- owner: 編集部 (00000000-0000-0000-0000-000000000001)

INSERT INTO listings (id, user_id, genre_id, title, description, address, website_url, prefecture, ward, status, created_by, updated_by)
VALUES
  ('a5d7e9f1-3c5b-4a7c-93de-7f9b1c3d5e4a', '00000000-0000-0000-0000-000000000001', '6f7f62e6-9188-4bea-b71a-b19dd5583d90',
    'CREST',
    '中野坂上・東中野駅徒歩10分、大久保通りのGay Bar。ヒト・モノ・コトを繋ぐ秘密の隠れ家。',
    '〒164-0011 東京都中野区中央2-58-20 村田ビル 2F奥',
    'http://crestnakano.web.fc2.com/',
    'tokyo', 'nakano', 'published',
    '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001'),

  ('b6e8f0a2-4d6c-4b8d-94ef-8a0c2d4e6f5b', '00000000-0000-0000-0000-000000000001', '6f7f62e6-9188-4bea-b71a-b19dd5583d90',
    'BAR ZATTA',
    '中野・新井のゲイバー。平日はノンケや女性も入店可。カクテル各種あり。X @barzatta で発信。',
    '〒165-0026 東京都中野区新井5-10-2 第3富士ビル 地下1階',
    'https://x.com/barzatta',
    'tokyo', 'nakano', 'published',
    '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001');

INSERT INTO listing_categories (listing_id, category_id) VALUES
  ('a5d7e9f1-3c5b-4a7c-93de-7f9b1c3d5e4a', '6588c6df-0081-4a2e-98b9-eb4f578947a7'),
  ('b6e8f0a2-4d6c-4b8d-94ef-8a0c2d4e6f5b', '6588c6df-0081-4a2e-98b9-eb4f578947a7');
