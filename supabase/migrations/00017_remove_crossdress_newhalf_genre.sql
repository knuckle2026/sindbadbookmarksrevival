-- 「女装・ニューハーフ」ジャンル削除（カテゴリは CASCADE）
-- ON DELETE CASCADE により categories.genre_id 連鎖削除、さらに listing_categories も連鎖
DELETE FROM genres WHERE slug = 'crossdress-newhalf';

-- sort_order 詰め直し（crossdress-newhalf=8 の次以降を -1）
UPDATE genres SET sort_order = sort_order - 1 WHERE sort_order >= 9;
