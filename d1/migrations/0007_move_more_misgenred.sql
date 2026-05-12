-- ============================================
-- 0007_move_more_misgenred:
--   0006 の keyword set では拾えなかった fashion/shop listings が matching に残っていた
--   (例: atelierboe, niji-depot, MASKULO, ROOTS, ROLY-POLY, …).
--   通販 / ショップ / アクセサリー / コスチューム 等のキーワードで追加移動する。
-- ============================================

-- Genre / Category IDs:
--   matching       = '9238c7d0-4574-4edd-9736-c475ca792b19'
--   fashion-beauty = '3e52a6ca-01b4-4027-959e-99b9000dec49'
--   fashion-beauty/shop = 'bdbe8cf4-2753-44dd-90a3-ac629f420c21'

-- 1a) genre_id を fashion-beauty に
UPDATE listings
   SET genre_id = '3e52a6ca-01b4-4027-959e-99b9000dec49'
 WHERE genre_id = '9238c7d0-4574-4edd-9736-c475ca792b19'
   AND status = 'published'
   AND (description LIKE '%通販%'
     OR description LIKE '%ショップ%'
     OR description LIKE '%アクセサリー%'
     OR description LIKE '%スーツ%'
     OR description LIKE '%ハーネス%'
     OR description LIKE '%水着%'
     OR description LIKE '%グッズ%'
     OR description LIKE '%コスチューム%'
     OR description LIKE '%アンダーウエア%'
     OR description LIKE '%アンダーウェア%'
     OR description LIKE '%洋品%'
     OR description LIKE '%洋服%'
     OR description LIKE '%雑貨%'
     OR description LIKE '%ユニフォーム%'
     OR description LIKE '%エロティックギア%'
     OR description LIKE '%レザー%');

-- 1b) 移動した listing の旧 matching/* タグを削除
DELETE FROM listing_categories
 WHERE listing_id IN (
   SELECT id FROM listings
    WHERE genre_id = '3e52a6ca-01b4-4027-959e-99b9000dec49'
      AND status = 'published'
      AND (description LIKE '%通販%'
        OR description LIKE '%ショップ%'
        OR description LIKE '%アクセサリー%'
        OR description LIKE '%スーツ%'
        OR description LIKE '%ハーネス%'
        OR description LIKE '%水着%'
        OR description LIKE '%グッズ%'
        OR description LIKE '%コスチューム%'
        OR description LIKE '%アンダーウエア%'
        OR description LIKE '%アンダーウェア%'
        OR description LIKE '%洋品%'
        OR description LIKE '%洋服%'
        OR description LIKE '%雑貨%'
        OR description LIKE '%ユニフォーム%'
        OR description LIKE '%エロティックギア%'
        OR description LIKE '%レザー%')
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
   AND (description LIKE '%通販%'
     OR description LIKE '%ショップ%'
     OR description LIKE '%アクセサリー%'
     OR description LIKE '%スーツ%'
     OR description LIKE '%ハーネス%'
     OR description LIKE '%水着%'
     OR description LIKE '%グッズ%'
     OR description LIKE '%コスチューム%'
     OR description LIKE '%アンダーウエア%'
     OR description LIKE '%アンダーウェア%'
     OR description LIKE '%洋品%'
     OR description LIKE '%洋服%'
     OR description LIKE '%雑貨%'
     OR description LIKE '%ユニフォーム%'
     OR description LIKE '%エロティックギア%'
     OR description LIKE '%レザー%');
