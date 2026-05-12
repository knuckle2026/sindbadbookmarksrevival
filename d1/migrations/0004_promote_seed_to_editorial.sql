-- ============================================
-- 0004_promote_seed_to_editorial: シードデータを本番データに昇格
--
-- admin (c1e1eb21-...) 所有のテストデータをそのまま本番運用するため、
-- 専用の編集部プロファイル (00000000-...-001) に所有を移管する。
-- これで build-seed-sql.mjs が出力する DELETE WHERE user_id = '<admin>' が
-- 万一実行されても本番データを上書きしない。
-- ============================================

INSERT OR IGNORE INTO profiles (id, display_name, role)
VALUES ('00000000-0000-0000-0000-000000000001', 'G-Ankers編集部', 'admin');

UPDATE listings
   SET user_id    = '00000000-0000-0000-0000-000000000001',
       created_by = '00000000-0000-0000-0000-000000000001',
       updated_by = '00000000-0000-0000-0000-000000000001'
 WHERE user_id = 'c1e1eb21-286e-446c-9dbc-4e40868f677f';
