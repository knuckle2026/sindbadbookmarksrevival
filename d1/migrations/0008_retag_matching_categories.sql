-- ============================================
-- 0008_retag_matching_categories:
--   gpress の "match" カテゴリは matching/matchmaking 一律に貼られていたが、
--   実態は アプリ / 掲示板 / 出会いパーティー が混在している。
--   description のキーワードで以下に再タグ:
--     "アプリ"          → matching/app
--     "掲示板" / "チャット" → matching/board
-- ============================================

-- Category IDs:
--   matching/app         = 'f523c408-a42b-42fc-9b8e-9e9e400fa19c'
--   matching/matchmaking = '72539a4e-4bff-4bb4-8a5a-e8e19498aa1d'
--   matching/board       = 'd09dd5f2-219e-4c17-b7f0-3e62c0b75e13'

-- ===== Step 1: アプリ → app =====

-- 1a) app タグを追加
INSERT OR IGNORE INTO listing_categories (listing_id, category_id)
SELECT l.id, 'f523c408-a42b-42fc-9b8e-9e9e400fa19c'
  FROM listings l
  JOIN genres g ON g.id = l.genre_id
 WHERE g.slug = 'matching'
   AND l.status = 'published'
   AND l.description LIKE '%アプリ%';

-- 1b) 該当 listing から matchmaking タグを削除
DELETE FROM listing_categories
 WHERE category_id = '72539a4e-4bff-4bb4-8a5a-e8e19498aa1d'
   AND listing_id IN (
     SELECT l.id FROM listings l JOIN genres g ON g.id = l.genre_id
      WHERE g.slug = 'matching'
        AND l.status = 'published'
        AND l.description LIKE '%アプリ%'
   );

-- ===== Step 2: 掲示板/チャット → board =====
-- (上の Step 1 で app に行ったものは除外: app タグが付いているものはスキップ)

-- 2a) board タグを追加
INSERT OR IGNORE INTO listing_categories (listing_id, category_id)
SELECT l.id, 'd09dd5f2-219e-4c17-b7f0-3e62c0b75e13'
  FROM listings l
  JOIN genres g ON g.id = l.genre_id
 WHERE g.slug = 'matching'
   AND l.status = 'published'
   AND (l.description LIKE '%掲示板%' OR l.description LIKE '%チャット%')
   AND NOT EXISTS (
     SELECT 1 FROM listing_categories lc
      WHERE lc.listing_id = l.id
        AND lc.category_id = 'f523c408-a42b-42fc-9b8e-9e9e400fa19c'  -- app は除外
   );

-- 2b) 該当 listing から matchmaking タグを削除
DELETE FROM listing_categories
 WHERE category_id = '72539a4e-4bff-4bb4-8a5a-e8e19498aa1d'
   AND listing_id IN (
     SELECT l.id FROM listings l JOIN genres g ON g.id = l.genre_id
      WHERE g.slug = 'matching'
        AND l.status = 'published'
        AND (l.description LIKE '%掲示板%' OR l.description LIKE '%チャット%')
   );
