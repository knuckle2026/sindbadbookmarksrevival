-- 「個人サイト」ジャンル削除（カテゴリは CASCADE）
-- ON DELETE CASCADE により categories.genre_id 連鎖削除、さらに listing_categories も連鎖
DELETE FROM genres WHERE slug = 'personal-site';

-- sort_order 詰め直し（video-gallery=4, media-sns=5 はそのまま、org-consult 以降を -1）
-- ※ 本マイグレーションは 00013（media-sns 追加）適用後に流すこと
UPDATE genres SET sort_order = sort_order - 1 WHERE sort_order >= 7;
