-- ============================================
-- 0011_delete_novel_x_urls:
--   media-sns/novel (小説) カテゴリで website_url が X / twitter のものを削除。
-- ============================================

DELETE FROM listings
 WHERE id IN (
   SELECT l.id FROM listings l
   JOIN listing_categories lc ON lc.listing_id = l.id
  WHERE lc.category_id = '276f7b49-3f51-4101-821b-63507898bf4a'  -- media-sns/novel
    AND l.status = 'published'
    AND (l.website_url LIKE '%x.com/%' OR l.website_url LIKE '%twitter.com/%')
 );
