-- ============================================
-- 0006_cleanup_misgenred_and_dupes:
--   (1) gpress の "app" カテゴリは Apparel (服飾) を含むため、
--       matching ジャンルに誤って入った fashion 系 listing を fashion-beauty に移す
--   (2) website_url の重複を排除 (最若い id を残し、残りは DELETE)
--       listing_categories は FK CASCADE で自動掃除される
-- ============================================

-- Genre IDs (from d1/seed/categories.sql):
--   matching       = '9238c7d0-4574-4edd-9736-c475ca792b19'
--   fashion-beauty = '3e52a6ca-01b4-4027-959e-99b9000dec49'
-- Category IDs:
--   fashion-beauty/shop = 'bdbe8cf4-2753-44dd-90a3-ac629f420c21'

-- ============================================
-- Step 1: 誤ったジャンル割当を修正
-- ============================================

-- 1a) genre_id を fashion-beauty に
UPDATE listings
   SET genre_id = '3e52a6ca-01b4-4027-959e-99b9000dec49'
 WHERE genre_id = '9238c7d0-4574-4edd-9736-c475ca792b19'
   AND status = 'published'
   AND (description LIKE '%ブランド%'
     OR description LIKE '%ファッション%'
     OR description LIKE '%アパレル%'
     OR description LIKE '%ウェア%'
     OR description LIKE '%Tシャツ%'
     OR description LIKE '%下着%');

-- 1b) 移動した listing にぶら下がっていた matching/* の category タグを削除
DELETE FROM listing_categories
 WHERE listing_id IN (
   SELECT id FROM listings
    WHERE genre_id = '3e52a6ca-01b4-4027-959e-99b9000dec49'
      AND status = 'published'
      AND (description LIKE '%ブランド%'
        OR description LIKE '%ファッション%'
        OR description LIKE '%アパレル%'
        OR description LIKE '%ウェア%'
        OR description LIKE '%Tシャツ%'
        OR description LIKE '%下着%')
 )
 AND category_id IN (
   SELECT id FROM categories WHERE genre_id = '9238c7d0-4574-4edd-9736-c475ca792b19'
 );

-- 1c) fashion-beauty/shop を付与
INSERT OR IGNORE INTO listing_categories (listing_id, category_id)
SELECT id, 'bdbe8cf4-2753-44dd-90a3-ac629f420c21'
  FROM listings
 WHERE genre_id = '3e52a6ca-01b4-4027-959e-99b9000dec49'
   AND status = 'published'
   AND (description LIKE '%ブランド%'
     OR description LIKE '%ファッション%'
     OR description LIKE '%アパレル%'
     OR description LIKE '%ウェア%'
     OR description LIKE '%Tシャツ%'
     OR description LIKE '%下着%');

-- ============================================
-- Step 2: website_url 重複排除
-- 同じ URL を持つ複数 listing から、最若い id (UUID lex 昇順) を残して他は削除。
-- listing_categories は FK CASCADE で連鎖削除される。
-- ============================================
DELETE FROM listings
 WHERE id IN (
   SELECT id FROM (
     SELECT id,
            ROW_NUMBER() OVER (PARTITION BY website_url ORDER BY id) AS rn
       FROM listings
      WHERE status = 'published'
        AND website_url IS NOT NULL
        AND website_url <> ''
   ) WHERE rn > 1
 );
