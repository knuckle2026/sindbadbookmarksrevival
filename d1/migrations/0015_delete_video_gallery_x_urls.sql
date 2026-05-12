-- ============================================
-- 0015_delete_video_gallery_x_urls:
--   video-gallery (動画・ギャラリー) ジャンルで website_url が X / twitter のものを削除。
-- ============================================

DELETE FROM listings
 WHERE id IN (
   SELECT l.id FROM listings l
   JOIN genres g ON g.id = l.genre_id
  WHERE g.slug = 'video-gallery'
    AND l.status = 'published'
    AND (l.website_url LIKE '%x.com/%' OR l.website_url LIKE '%twitter.com/%')
 );
