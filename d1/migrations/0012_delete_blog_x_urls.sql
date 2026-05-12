-- ============================================
-- 0012_delete_blog_x_urls:
--   media-sns/blog (個人サイト・ブログ) で website_url が X / twitter のものを削除。
-- ============================================

DELETE FROM listings
 WHERE id IN (
   SELECT l.id FROM listings l
   JOIN listing_categories lc ON lc.listing_id = l.id
  WHERE lc.category_id = 'ddd04809-dd7c-490d-9da2-81737263fe21'  -- media-sns/blog
    AND l.status = 'published'
    AND (l.website_url LIKE '%x.com/%' OR l.website_url LIKE '%twitter.com/%')
 );
