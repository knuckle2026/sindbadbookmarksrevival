-- ============================================
-- 0014_delete_matching_x_urls:
--   matching (出会い) ジャンルで website_url が X / twitter のものを削除。
-- ============================================

DELETE FROM listings
 WHERE id IN (
   SELECT l.id FROM listings l
   JOIN genres g ON g.id = l.genre_id
  WHERE g.slug = 'matching'
    AND l.status = 'published'
    AND (l.website_url LIKE '%x.com/%' OR l.website_url LIKE '%twitter.com/%')
 );
