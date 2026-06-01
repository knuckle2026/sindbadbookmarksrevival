# ⚠️ プロジェクト識別（混同防止・必読）

このリポジトリは **G-Ankers**（LGBTQ+ ポータル / GitHub: `knuckle2026/sindbadbookmarksrevival`）。
同じマシン上の **占ヌス (uranus)** とは **完全に別プロジェクト**。
混同して `wrangler` を打つと本番事故。

| 識別子 | ✅ このプロジェクト (G-Ankers) | ❌ 別プロジェクト (uranus) |
|---|---|---|
| パス | `C:\Users\copyc\Desktop\sindbadbookmarks\` | `C:\Users\copyc\Desktop\uranus\` |
| GitHub | `sindbadbookmarksrevival` | `uranus` |
| 本番 URL | g-ankers.yourportal.workers.dev | uranus.yourportal.workers.dev |
| Worker / D1 名 | `g-ankers` / `sindbadbookmarks` | `uranus` / `uranus` |
| D1 id | `a37191b1-4993-4938-b2ee-4578b2ec9f86` | `ca28b9e9-50f7-4742-82dc-13e4aaa61784` |

**作業を始める前に必ず確認**:
- `pwd` が `sindbadbookmarks` 配下
- `git remote -v` が `sindbadbookmarksrevival.git`
- `wrangler.jsonc` の `name` が `g-ankers`

1つでも `uranus` を指していたら即停止。`wrangler d1 execute uranus ...` 等は絶対に実行しない。
詳細はリポジトリルートの [`README.md`](../README.md) のプロジェクト識別表を参照。

---

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Production data ownership

リモート D1 の listings は **編集部プロファイル** (`00000000-0000-0000-0000-000000000001`, display_name "G-Ankers編集部") 所有で本番運用しています。

`app/scripts/build-seed-sql.mjs` は冒頭に `DELETE FROM listings WHERE user_id = '<admin>'` を含む SQL を生成しますが、これは旧シード投入用の遺産であり **絶対にリモート D1 で実行しないでください**。本番データを破壊する可能性があります。

`seed:scrape` / `seed:build` は手元で SQL を生成するだけなら無害ですが、出力された `scripts/data/listings-seed.sql` をリモートに `wrangler d1 execute --remote --file=...` する経路は閉じてあります（`package.json` から `seed:apply:remote` を削除済み）。
