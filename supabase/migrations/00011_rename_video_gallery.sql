-- 本番DB適用済み (2026-04-13)
-- このファイルはリポジトリの記録用

-- ジャンル名変更: 公式動画配信・ギャラリー → 動画・ギャラリー
UPDATE genres SET name = '動画・ギャラリー' WHERE slug = 'video-gallery';
