-- ============================================
-- 0009_dedupe_org_consult_by_title:
--   gpress では一つの団体が公式サイト + Facebook + Instagram + X など
--   複数 URL で登録されており、タイトルだけ見れば重複扱いになる。
--   公式サイト URL を優先して残し、SNS / アプリストアの行を削除する。
-- ============================================

DELETE FROM listings
 WHERE id IN (
   SELECT lid FROM (
     SELECT l.id AS lid,
            ROW_NUMBER() OVER (
              PARTITION BY l.title
              ORDER BY
                CASE
                  WHEN l.website_url LIKE '%facebook.com%'    THEN 3
                  WHEN l.website_url LIKE '%instagram.com%'   THEN 3
                  WHEN l.website_url LIKE '%x.com%'           THEN 3
                  WHEN l.website_url LIKE '%twitter.com%'     THEN 3
                  WHEN l.website_url LIKE '%youtube.com%'     THEN 3
                  WHEN l.website_url LIKE '%ameblo.jp%'       THEN 3
                  WHEN l.website_url LIKE '%itunes.apple.com%' THEN 2
                  WHEN l.website_url LIKE '%play.google.com%'  THEN 2
                  ELSE 1
                END,
                l.id
            ) AS rn
       FROM listings l
       JOIN genres g ON g.id = l.genre_id
      WHERE g.slug = 'org-consult'
        AND l.status = 'published'
        AND l.title IS NOT NULL
   ) WHERE rn > 1
 );
