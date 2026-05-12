-- ============================================
-- 0013_tag_hiv_in_org_consult:
--   org-consult ジャンルの listing で title/description に "HIV" (case-insensitive) を含むものに
--   HIV カテゴリを付与する。
-- ============================================

INSERT OR IGNORE INTO listing_categories (listing_id, category_id)
SELECT l.id, 'abaadcc5-e11c-4f17-af86-f76f0cd2ae2f'  -- org-consult/hiv
  FROM listings l
  JOIN genres g ON g.id = l.genre_id
 WHERE g.slug = 'org-consult'
   AND l.status = 'published'
   AND (l.title LIKE '%HIV%' OR l.description LIKE '%HIV%'
     OR l.title LIKE '%hiv%' OR l.description LIKE '%hiv%');
