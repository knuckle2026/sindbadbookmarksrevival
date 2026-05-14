# G-Ankers (`app/`)

Next.js 15 + Cloudflare Workers + D1 + Supabase Auth で動く LGBT ポータルサイト。

本番: <https://g-ankers.yourportal.workers.dev>

詳細仕様: [../docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md)
エージェント向け注意: [AGENTS.md](AGENTS.md)

## 開発

### セットアップ

```powershell
npm install
# .dev.vars に SUPABASE_SERVICE_ROLE_KEY / SUPABASE_JWT_SECRET を設定
# .env.local に NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY を設定
```

### ローカル起動

```powershell
npm run dev           # Next.js dev server (port 3000)
# または
npm run cf:dev        # OpenNext + wrangler preview (Workers 本番に近い環境)
```

### ビルド / デプロイ

**デプロイ先は Cloudflare Workers のみ** (Vercel は使用しない):

```powershell
npm run cf:deploy     # opennextjs-cloudflare build && deploy
```

### テスト / リント

```powershell
npm test              # vitest
npm run lint
```

## ディレクトリ構成

| パス | 内容 |
|---|---|
| `src/app/` | App Router (公開ページ + `/sbbm-control/*` 管理画面 + `/api/*`) |
| `src/components/` | 再利用 UI コンポーネント |
| `src/lib/db/` | D1 アクセス層 (`queries/*.ts`, `types.ts`) |
| `src/lib/supabase/` | Supabase client (auth / storage / admin) |
| `src/lib/auth/guards.ts` | 認可ヘルパー (`requireUser` / `requireAdmin` / `checkAdminApi`) |
| `src/lib/constants/` | ジャンル・都道府県・地域などの定数 |
| `wrangler.jsonc` | Cloudflare Workers 設定 (D1 binding / vars) |
| `public/images/` | 静的画像 (バナー候補・ロゴ等) |
| `scripts/` | データ整形・seed 生成スクリプト (本番 D1 への適用は厳重注意) |

## 重要な制約

- **`scripts/data/listings-seed.sql` をリモート D1 に実行しない** —
  冒頭で admin user_id の全 listing を DELETE する旧 seed があり本番データを
  破壊する (詳細は [AGENTS.md](AGENTS.md))
- **CSS バンドル** は `@tailwindcss/postcss` 後段で `postcss-cascade-layers` /
  `@csstools/postcss-oklab-function` / `@csstools/postcss-color-mix-function`
  を通している (古い iOS WebView 対応)。設定変更時は LINE 内ブラウザ等で動作
  確認すること

## 関連リポジトリ / ダッシュボード

- D1: `sindbadbookmarks` (id: `a37191b1-4993-4938-b2ee-4578b2ec9f86`)
- Supabase: ref `kawiaabwfdjwvlxcbwul`
- Cloudflare Worker: `g-ankers`
