-- 2026-05-20: 雅の占い部屋 を マッサージ・売り専 > マッサージ にも登録
-- (占い部屋に施術所併設、ボディケアも提供との公式サイト記載に基づく)
-- 同名 listing を massage-urisen genre 側にも追加 (独立 ID)。
-- owner: 編集部 (00000000-0000-0000-0000-000000000001)
-- genre: massage-urisen (b42c7136-7bf4-41b8-a12c-ce8d9cb26c8c)
-- category: massage (40438ed8-4f91-405c-ba30-ccdabaf533e5)

INSERT INTO listings (id, user_id, genre_id, title, description, address, website_url, prefecture, status, created_by, updated_by)
VALUES ('a0b4d6e8-1f3a-4b5c-9ace-2f5a7b9c1e3a', '00000000-0000-0000-0000-000000000001', 'b42c7136-7bf4-41b8-a12c-ce8d9cb26c8c',
  '雅の占い部屋',
  '千葉市川の占い師・雅。占い部屋に施術所併設、ボディケアも承る。詳細はサイト・問合せにて。',
  '〒272-0023 千葉県市川市',
  'http://miyabi.tou3.com/',
  'chiba', 'published',
  '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001');

INSERT INTO listing_categories (listing_id, category_id)
VALUES ('a0b4d6e8-1f3a-4b5c-9ace-2f5a7b9c1e3a', '40438ed8-4f91-405c-ba30-ccdabaf533e5');
