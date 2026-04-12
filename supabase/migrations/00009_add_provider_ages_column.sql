-- 本番DB適用済み (2026-04-13)
-- このファイルはリポジトリの記録用

-- マッサージ・売り専のサービス提供者の年代カラム追加
ALTER TABLE listings ADD COLUMN IF NOT EXISTS provider_ages text[] NULL;
