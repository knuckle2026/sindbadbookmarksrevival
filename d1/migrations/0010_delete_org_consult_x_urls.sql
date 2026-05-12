-- ============================================
-- 0010_delete_org_consult_x_urls:
--   org-consult 内で website_url が X (twitter.com / x.com) のものを削除。
--   listing_categories は FK CASCADE で連鎖削除される。
-- ============================================

DELETE FROM listings
 WHERE id IN (
   SELECT l.id FROM listings l
   JOIN genres g ON g.id = l.genre_id
  WHERE g.slug = 'org-consult'
    AND l.status = 'published'
    AND (l.website_url LIKE '%x.com/%' OR l.website_url LIKE '%twitter.com/%')
 );
