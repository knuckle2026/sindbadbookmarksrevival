-- ============================================
-- 0005_auto_tag_massage_urisen: テキストマッチで listings を追加カテゴリにタグ付け
-- INSERT OR IGNORE なので既存タグは保持 (massage / urisen は変わらない)
-- ============================================

-- delivery (出張)
INSERT OR IGNORE INTO listing_categories (listing_id, category_id)
SELECT l.id, c.id
  FROM listings l
  JOIN genres g     ON g.id = l.genre_id
  JOIN categories c ON c.genre_id = g.id AND c.slug = 'delivery'
 WHERE g.slug = 'massage-urisen'
   AND l.status = 'published'
   AND (l.title LIKE '%出張%' OR l.description LIKE '%出張%' OR l.service_areas LIKE '%出張%');

-- oil (オイルマッサージ)
INSERT OR IGNORE INTO listing_categories (listing_id, category_id)
SELECT l.id, c.id
  FROM listings l
  JOIN genres g     ON g.id = l.genre_id
  JOIN categories c ON c.genre_id = g.id AND c.slug = 'oil'
 WHERE g.slug = 'massage-urisen'
   AND l.status = 'published'
   AND (l.title LIKE '%オイル%' OR l.description LIKE '%オイル%');

-- thai (タイ式マッサージ)
INSERT OR IGNORE INTO listing_categories (listing_id, category_id)
SELECT l.id, c.id
  FROM listings l
  JOIN genres g     ON g.id = l.genre_id
  JOIN categories c ON c.genre_id = g.id AND c.slug = 'thai'
 WHERE g.slug = 'massage-urisen'
   AND l.status = 'published'
   AND (l.title LIKE '%タイ式%' OR l.description LIKE '%タイ式%');

-- seitai (整体)
INSERT OR IGNORE INTO listing_categories (listing_id, category_id)
SELECT l.id, c.id
  FROM listings l
  JOIN genres g     ON g.id = l.genre_id
  JOIN categories c ON c.genre_id = g.id AND c.slug = 'seitai'
 WHERE g.slug = 'massage-urisen'
   AND l.status = 'published'
   AND (l.title LIKE '%整体%' OR l.description LIKE '%整体%');

-- newhalf (ニューハーフ)
INSERT OR IGNORE INTO listing_categories (listing_id, category_id)
SELECT l.id, c.id
  FROM listings l
  JOIN genres g     ON g.id = l.genre_id
  JOIN categories c ON c.genre_id = g.id AND c.slug = 'newhalf'
 WHERE g.slug = 'massage-urisen'
   AND l.status = 'published'
   AND (l.title LIKE '%ニューハーフ%' OR l.description LIKE '%ニューハーフ%');

-- les (レズ) — 現状 0 hits だが将来分の冪等性のために記述
INSERT OR IGNORE INTO listing_categories (listing_id, category_id)
SELECT l.id, c.id
  FROM listings l
  JOIN genres g     ON g.id = l.genre_id
  JOIN categories c ON c.genre_id = g.id AND c.slug = 'les'
 WHERE g.slug = 'massage-urisen'
   AND l.status = 'published'
   AND (l.title LIKE '%レズ%' OR l.description LIKE '%レズ%');
