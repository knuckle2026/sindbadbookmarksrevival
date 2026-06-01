# G-Ankers — リポジトリ俯瞰図

> このリポジトリは GitHub では `sindbadbookmarksrevival` の名前ですが、
> プロダクト名は **G-Ankers**（旧名 sindbadbookmarks）です。
> **本番**: <https://g-ankers.yourportal.workers.dev>

---

## ⚠️ プロジェクト識別（混同防止・必読）

このリポジトリは **G-Ankers**（LGBTQ+ ポータル）。
同じマシン上にある **占ヌス (uranus)・四柱推命アプリ** とは **完全に別プロジェクト**です。
混同して編集・デプロイ・wrangler 実行をすると **本番事故** になります。

| 項目 | ✅ G-Ankers (本プロジェクト) | ❌ uranus（占ヌス・触らない） |
|---|---|---|
| ローカルパス | `C:\Users\copyc\Desktop\sindbadbookmarks\` | `C:\Users\copyc\Desktop\uranus\` |
| GitHub | `knuckle2026/sindbadbookmarksrevival` | `knuckle2026/uranus` |
| 本番 URL | <https://g-ankers.yourportal.workers.dev> | <https://uranus.yourportal.workers.dev> |
| Cloudflare Worker 名 | `g-ankers` | `uranus` |
| D1 database 名 | `sindbadbookmarks` | `uranus` |
| D1 database id | `a37191b1-4993-4938-b2ee-4578b2ec9f86` | `ca28b9e9-50f7-4742-82dc-13e4aaa61784` |
| Supabase project ref | `kawiaabwfdjwvlxcbwul` | `hgskrohrrvgirontlqji` |
| プロダクト性質 | 店舗ディレクトリ・カテゴリ・年代フィルタ | 八字（四柱推命）鑑定 |

### 作業開始前の必須チェック（5秒）

```sh
pwd                                # → /sindbadbookmarks/... を含むか
git -C . remote -v                 # → sindbadbookmarksrevival.git を指すか
grep '"name"' app/wrangler.jsonc   # → "g-ankers" か
```

**1つでも `uranus` を指していたら即時作業中止。**
`wrangler` コマンドで `--name uranus` や D1 `uranus` を含む経路に出会ったら **絶対に実行しない**。

---

「どこに何があるか」を一目で把握するための目次。詳細は各リンク先を参照してください。

---

## 📐 仕様書（このサービスは何か）

| ドキュメント | 場所 | 用途 |
|---|---|---|
| **現状の仕様書 (Single source of truth)** | [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | スタック・ドメインモデル・ロジック・URL ルートを実装と一致させた最新版。**まずここを読む** |
| 旧 要件書ドラフト（初期構想） | [`legacy/sindbadbookmarks_requirements.md`](legacy/sindbadbookmarks_requirements.md) | 開発初期の要件メモ。実装とは大きく乖離。経緯把握用 |
| 旧 要望書 | [`legacy/reqest.md`](legacy/reqest.md) | 同上、要望リスト |
| 旧 実装メモ | [`legacy/implementation.md`](legacy/implementation.md) | 同上、実装計画ドラフト |
| legacy 全体の説明 | [`legacy/README.md`](legacy/README.md) | 旧ドキュメントの扱い方 |

> ⚠️ `legacy/` は履歴保存用。**現状の挙動を知りたいときは必ず `docs/ARCHITECTURE.md`** を参照すること。

---

## 🏗️ 設計書（どう組まれているか）

| ドキュメント | 場所 | 内容 |
|---|---|---|
| **アーキテクチャ / データモデル / ロジック** | [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | レイヤー構成、DB 設計、URL マップ、Cloudflare/Supabase 設定 |
| **エージェント／開発者への注意事項** | [`app/AGENTS.md`](app/AGENTS.md) | Next 16 の差分・本番データの編集部所有・触ってはいけない経路 |
| **データバックアップ／復元手順** | [`docs/RESTORE.md`](docs/RESTORE.md) | wrangler d1 export とリストア |
| **DB マイグレーション（D1）** | [`d1/migrations/`](d1/migrations) | スキーマ変更履歴（番号順）。本番にも適用済み |
| **DB シード（D1）** | [`d1/seed/`](d1/seed) | カテゴリ別の listing 初期データ SQL |
| **Supabase マイグレーション** | [`supabase/migrations/`](supabase/migrations) | Auth/プロファイル RLS など Supabase 側のスキーマ |
| **D1 バックアップ** | [`backups/`](backups) | `wrangler d1 export` の出力先 |

---

## 💻 プログラム（コードはどこに）

リポジトリは Next.js アプリ本体を [`app/`](app) に集約。それ以外はデータ／ドキュメント／資材。

### `app/` — Next.js アプリ本体

```
app/
├── AGENTS.md                  # エージェント向け運用ルール
├── CLAUDE.md                  # @AGENTS.md を取り込むだけのスタブ
├── README.md                  # 開発手順 (dev/build/test/deploy)
├── wrangler.jsonc             # Cloudflare Workers 設定 (worker 名 / D1 binding)
├── open-next.config.ts        # OpenNext 設定
├── next.config.ts             # Next.js 16 設定
├── package.json               # npm scripts (dev / build / cf:deploy 等)
├── src/
│   ├── middleware.ts          # age-gate + 認証ミドルウェア
│   ├── app/                   # Next.js App Router (画面 + API)
│   │   ├── layout.tsx         # ルートレイアウト (SiteChrome 包含)
│   │   ├── page.tsx           # トップ (ジャンル × カテゴリツリー)
│   │   ├── age-gate/          # 年齢確認ページ (Server Component + form POST)
│   │   ├── auth/              # ログイン / コールバック
│   │   ├── genres/[slug]/     # ジャンル一覧 (フィルタ・件数連動・カード描画)
│   │   ├── listings/new/      # 新規登録フォーム
│   │   ├── operator/          # 運営事務局ページ
│   │   ├── sbbm-control/      # 管理画面 (承認・編集・統計)
│   │   ├── search/            # 検索結果
│   │   ├── api/               # Route Handlers (登録 / 承認 / age-gate Cookie 等)
│   │   ├── sitemap.ts         # 動的 sitemap
│   │   ├── globals.css        # Tailwind v4 グローバル
│   │   └── not-found.tsx / global-error.tsx
│   ├── components/            # 横断コンポーネント (header / footer / sidebar / banner 等)
│   └── lib/                   # ドメイン・データ層
│       ├── auth/              # 認証ガード (getCurrentUser / requireAdmin)
│       ├── constants/         # GENRES / PROVIDER_AGES / PREFECTURES 等の定数
│       ├── db/                # D1 クライアント・クエリ・型
│       │   ├── client.ts
│       │   ├── types.ts       # 行型 (ListingRow / ProfileRow 等)
│       │   └── queries/       # listings / categories / profiles / banners 等
│       ├── supabase/          # Supabase auth/storage クライアント
│       ├── turnstile.ts       # Cloudflare Turnstile (Bot 防御)
│       ├── in-app-browser.ts  # LINE/IG/FB UA 判定 (Turnstile bypass)
│       └── utils/             # safeRedirectPath 等
├── public/                    # 静的画像・favicon 等
├── scripts/                   # シード生成・スクレイピング (build-seed-sql.mjs 等)
└── .open-next/                # ビルド成果物 (deploy で再生成)
```

### ジャンル別の核心ファイル早見表

| やりたいこと | 主要ファイル |
|---|---|
| ジャンル一覧ページの挙動を変える | [`app/src/app/genres/[slug]/page.tsx`](app/src/app/genres/%5Bslug%5D/page.tsx) |
| カテゴリ / 都道府県 / 区 / 年代フィルタ | [`app/src/app/genres/[slug]/GenreFilters.tsx`](app/src/app/genres/%5Bslug%5D/GenreFilters.tsx) ほか兄弟ファイル |
| listing の DB クエリ／集計／件数連動 | [`app/src/lib/db/queries/listings.ts`](app/src/lib/db/queries/listings.ts) |
| 登録 API（admin は即公開／匿名は pending） | [`app/src/app/api/listings/route.ts`](app/src/app/api/listings/route.ts) |
| 承認フロー | [`app/src/app/api/admin/listings/[id]/status/route.ts`](app/src/app/api/admin/listings/%5Bid%5D/status/route.ts) |
| 年齢確認（LINE 等の in-app browser 対応） | [`app/src/app/age-gate/page.tsx`](app/src/app/age-gate/page.tsx) / [`app/src/app/api/age-gate/enter/route.ts`](app/src/app/api/age-gate/enter/route.ts) |
| 管理画面 | [`app/src/app/sbbm-control/`](app/src/app/sbbm-control) |
| 認証ガード | [`app/src/lib/auth/guards.ts`](app/src/lib/auth/guards.ts) |
| ジャンル定義 (provider_ages 対応など) | [`app/src/lib/constants/genres.ts`](app/src/lib/constants/genres.ts) |
| 提供者年代 (20代〜60代〜) | [`app/src/lib/constants/provider-ages.ts`](app/src/lib/constants/provider-ages.ts) |

### `d1/` — Cloudflare D1（本番 DB）の SQL 資産

| パス | 内容 |
|---|---|
| [`d1/migrations/`](d1/migrations) | スキーマ変更履歴。`wrangler d1 execute sindbadbookmarks --remote --file=...` で本番適用 |
| [`d1/seed/`](d1/seed) | カテゴリ別の listing シード SQL（`gaybar-tokyo-*.sql` 等）。**本番直接適用は閉鎖中**（`app/AGENTS.md` 参照） |

### `supabase/` — Supabase（Auth + Storage）の SQL

| パス | 内容 |
|---|---|
| [`supabase/migrations/`](supabase/migrations) | profiles / RLS ポリシー等 |

### その他

| パス | 内容 |
|---|---|
| [`backups/`](backups) | D1 リモートダンプ（`wrangler d1 export` 出力先） |
| [`images/`](images) | 各種ロゴ・宣材画像 |
| `index.html` / `build.png` / `sbbmr2logo.jpg` | ルート直下に置かれた資材（履歴的に残存） |

---

## 🚀 よくあるオペレーション

| やること | コマンド／参照 |
|---|---|
| ローカル開発サーバ | `cd app && npm run dev` |
| 型チェック | `cd app && npx tsc --noEmit` |
| テスト | `cd app && npm test` |
| 本番デプロイ | `cd app && npm run cf:deploy`（OpenNext build → wrangler deploy） |
| D1 マイグレーション適用（本番） | `cd app && npx wrangler d1 execute sindbadbookmarks --remote --file=../d1/migrations/<N>.sql` |
| D1 バックアップ | [`docs/RESTORE.md`](docs/RESTORE.md) 参照 |

---

## 📦 リポジトリ

- GitHub: <https://github.com/knuckle2026/sindbadbookmarksrevival>
- 主要ブランチ: `master`
- 本番 Worker: `g-ankers`（Cloudflare account `5f4f4c90fa8774f0dd479e597923ba84`）
- D1 database: `sindbadbookmarks`（id `a37191b1-4993-4938-b2ee-4578b2ec9f86`）
- Supabase project: `kawiaabwfdjwvlxcbwul`

---

## ✋ 触ってはいけないもの（最重要）

[`app/AGENTS.md`](app/AGENTS.md) に詳しいが、特に注意：

- 本番 D1 の listings は **編集部プロファイル**（`00000000-0000-0000-0000-000000000001`, "G-Ankers編集部"）所有で運用中
- `app/scripts/build-seed-sql.mjs` は冒頭に `DELETE FROM listings WHERE user_id = '<admin>'` を含む SQL を生成する → **絶対に本番 D1 で実行しない**
- `seed:apply:remote` 経路は `package.json` から削除済み（手元で SQL を作るだけなら無害）

---

_Last updated: 2026-05-31 — このファイルがリポジトリの俯瞰図。新しいトップレベルディレクトリや重要ドキュメントを追加したら、ここも更新してください。_
