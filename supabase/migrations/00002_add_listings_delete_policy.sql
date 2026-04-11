-- listings テーブルに DELETE ポリシーを追加（既に本番適用済み）
-- オーナー本人 or 管理者が自分のリスティングを削除可能
-- listing_categories は FK ON DELETE CASCADE で自動削除される
--
-- 注意: 本番DBには以下のポリシーが既に存在する（手動 or ダッシュボードで作成済み）
--   listings_delete_own: (user_id = auth.uid()) OR (admin role check)
-- このファイルはリポジトリの記録用。再実行時は DROP IF EXISTS してから再作成。

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'listings' AND policyname = 'listings_delete_own'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "listings_delete_own" ON listings
        FOR DELETE USING (
          user_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
          )
        )
    $policy$;
  END IF;
END
$$;
