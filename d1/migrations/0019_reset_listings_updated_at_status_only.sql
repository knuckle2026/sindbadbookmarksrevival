-- 承認のみ (status PATCH しただけ、content 編集なし) の listing は
-- updated_at が published_at と一致する。これらを created_at に戻し、
-- UI 上「登録」表示にする。
--
-- 影響: 西麻布コピークラブ / NANAME-ebisu- 等、承認しただけの listing が
-- 正しく「登録」表示になる。
--
-- 残る限界: 一度 hidden → 再 published された listing は updated_at > published_at に
-- なるため対象外 (引き続き「更新」と誤表示。完全解決には別カラムが必要だが overkill)。

UPDATE listings
   SET updated_at = created_at
 WHERE published_at IS NOT NULL
   AND updated_at = published_at;
