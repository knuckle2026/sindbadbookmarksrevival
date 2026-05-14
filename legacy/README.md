# Legacy documents

このディレクトリには本プロジェクト初期の **設計書 / 要件書ドラフト** を、
当時の意図を残すために保存しています。

> ⚠️ **以下のファイルは現状の実装とは大きく乖離しています。** 開発の参照には
> 使わず、現状把握には [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md) を
> 参照してください。

## 内容

| ファイル | バージョン | 主な乖離 |
|---|---|---|
| [sindbadbookmarks_requirements.md](sindbadbookmarks_requirements.md) | v1.0 ドラフト 2026-04-01 | DB が Supabase PostgreSQL + RLS 前提 (現状は D1 SQLite + API ガード)。スキーマ (listing_locations / regions / friendliness / listing_type 等) も別物 |
| [reqest.md](reqest.md) | v1.3 2026-04-04 | 同じく Supabase Postgres + RLS 前提、フィールド構成が実装と異なる |
| [implementation.md](implementation.md) | 2026-04-14 | ホスティングが Vercel 前提 (2026-04 末に Cloudflare Workers へ移管済み) |

## なぜ残しているか

- 「なぜこの設計を採用しなかったのか」「どこから方向転換したか」を遡れる
- 当初想定の用語 (例: friendliness, listing_type) を今後再導入検討するときに参照可

## なぜ更新していないか

- 段階的な migration の途中で実装が大幅に乖離したため、部分修正では追いつかない
- 単一のソースオブトゥルース ([docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md))
  に集約する方が混乱が少ない
