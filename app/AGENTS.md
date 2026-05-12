<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Production data ownership

リモート D1 の listings は **編集部プロファイル** (`00000000-0000-0000-0000-000000000001`, display_name "G-Ankers編集部") 所有で本番運用しています。

`app/scripts/build-seed-sql.mjs` は冒頭に `DELETE FROM listings WHERE user_id = '<admin>'` を含む SQL を生成しますが、これは旧シード投入用の遺産であり **絶対にリモート D1 で実行しないでください**。本番データを破壊する可能性があります。

`seed:scrape` / `seed:build` は手元で SQL を生成するだけなら無害ですが、出力された `scripts/data/listings-seed.sql` をリモートに `wrangler d1 execute --remote --file=...` する経路は閉じてあります（`package.json` から `seed:apply:remote` を削除済み）。
