# G-Ankers Architecture

**Status:** 現状反映版 (Single source of truth)
**Last reviewed:** 2026-05-31
**Predecessors:** [legacy/](../legacy/) に旧 `sindbadbookmarks_requirements.md` / `reqest.md` / `implementation.md` を保存

> このドキュメントは「**今動いているもの**」を記述する。設計意図の履歴は
> `legacy/` を参照。本ファイルは実装と乖離した時点で修正し、常に現状と一致
> させる。

---

## 1. スタック / デプロイ構成

| レイヤー | 採用技術 |
|---|---|
| フロントエンド + サーバ | Next.js 15 (App Router) |
| ホスティング | Cloudflare Workers (OpenNext 経由) |
| DB | Cloudflare D1 (SQLite) — binding `env.DB` |
| 認証 | Supabase Auth (Email/Password + Google OAuth) |
| 画像ストレージ | Supabase Storage — bucket `banners` (Public) |
| ビルド | `@opennextjs/cloudflare`、Tailwind v4、Lightning CSS フォールバック有 |
| CSS 互換 | PostCSS で `@layer` フラット化 + `oklch` / `color-mix` の RGB フォールバック (古い iOS WebView 対応) |

**プロジェクト識別子:**
- Cloudflare Worker: `g-ankers` (`app/wrangler.jsonc:3`)
- Cloudflare Account: `5f4f4c90fa8774f0dd479e597923ba84`
- D1 database: `sindbadbookmarks` (id `a37191b1-4993-4938-b2ee-4578b2ec9f86`)
- Supabase project ref: `kawiaabwfdjwvlxcbwul`
- 本番 URL: <https://g-ankers.yourportal.workers.dev>

**Vercel は使用しない**: 旧 Vercel プロジェクト (`sindbadbookmarksrevival.vercel.app`)
は 2026-04 移管時に廃止。Deploy 経路は `npm run cf:deploy`
(= `opennextjs-cloudflare build && opennextjs-cloudflare deploy`) のみ。

**Secrets** (`wrangler secret put` 済み、コードにハードコードしない):
- `SUPABASE_SERVICE_ROLE_KEY` — admin 系 API と Supabase Storage 操作で使用
- `SUPABASE_JWT_SECRET`

**Public env** (`wrangler.jsonc:vars`):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (公開してよいキー、RLS で保護されるべき値だが
  本プロジェクトでは Supabase の DB は使わず Auth のみ利用)

---

## 2. ロールと認可モデル

### 2.1 ロール定義

| ロール | 認証 | 権限 |
|---|---|---|
| **visitor** | 不要 | 情報の検索・閲覧。リスティング通報の送信 |
| **contributor** | 必須 | visitor 権限 + 情報新規登録 + 自分の登録情報の編集・削除 |
| **admin** | 必須 | 全権限。`/sbbm-control/*` 経由で精査・非表示化・アカウント停止 |

`is_suspended=1` の contributor は登録 / 編集権限を失う (`requireUser` 経由で
チェック)。

### 2.2 認可方式

**Supabase の RLS は使っていない** (DB が D1 SQLite で Supabase Postgres ではない
ため、RLS という機構がそもそも存在しない)。

代わりに **API ルート内で明示的にガード関数を呼ぶ**:

- [`requireUser(loginPath)`](../app/src/lib/auth/guards.ts) — 未ログインなら redirect
- `requireAdmin()` — 未ログイン or `role !== 'admin'` なら notFound
- `checkAdminApi()` — 同上を 401/403 で返す版 (API ルート用)
- `requireOwnerOrAdmin(listingId)` — 自分の listing or admin のみ通す

**全ての** `/api/admin/*` ルートで `checkAdminApi()` を呼んでいる
(banners / announcements / faqs / categories / listings / accounts / feedback)。

### 2.3 認証フロー

- Supabase Auth クッキー (`HttpOnly`, `SameSite=Lax`) でセッション管理
- `/auth/callback` で OAuth コールバックを受ける
- `src/middleware.ts` の `updateSession` で各リクエストごとに Supabase セッションを
  リフレッシュし、`is_suspended` 検知時は `/login` へ強制リダイレクト

### 2.4 年齢ゲート

`/age-gate` で 18+ 確認後、`age_verified=1` cookie (HttpOnly, Secure, SameSite=Lax,
max-age 24h) を `/api/age-gate/enter` 経由で発行。`/api/age-gate/enter` は form POST
(`application/x-www-form-urlencoded`) を受けた場合 **303 で `next` へ redirect**、
旧 JSON fetch クライアントの場合は `{ ok: true }` を返す（両対応で互換維持）。

middleware の `AGE_GATE_BYPASS` 以外は cookie 未設定なら `/age-gate` へ 307:

```js
// app/src/middleware.ts
const AGE_GATE_BYPASS = [
  "/age-gate", "/auth", "/_next", "/favicon", "/icon", "/apple-icon",
  "/sbbm-control",
  "/api/auth",        // ログイン/サインアップ系コールバック
  "/api/age-gate",    // 年齢確認 Cookie 設定エンドポイント
  "/google",          // Google Search Console verification (例: /googleb9e2163406392cc0.html)
  "/robots.txt",
  "/sitemap.xml",
];
```

⚠️ `/api` 全体ではなく **`/api/auth` と `/api/age-gate` のみ bypass** する点に注意
（他の `/api/*` も age-gate 対象）。

**age-gate ページ自体は Server Component で完全 SSR + inline style hex 色固定**
（[`app/src/app/age-gate/page.tsx`](../app/src/app/age-gate/page.tsx)）:
旧 Client Component (`"use client"` + `useSearchParams` + `<Suspense fallback={null}>`)
は LINE/Instagram/FB 等の in-app browser で JS 実行が不安定だと真っ白になっていた。
さらに Tailwind v4 の `oklch()` を解釈できない古い WebView では `bg-zinc-950` が
無効化されつつ `text-white` だけ効いて白背景白文字になる二重問題があった。
対策として **(1) Server Component 化で完全 SSR**、**(2) `<form action="/api/age-gate/enter" method="POST">`
で JS なしに Cookie 発行 + 遷移**、**(3) bg/text の主要色を hex の inline style で
重ね指定** の 3 段で in-app browser 互換性を確保している。

### 2.5 admin 認証

admin は `/sbbm-control/login` から個別にログイン。一般ユーザの `/login` とは
分離。`(protected)` ルートグループで `requireAdmin()` を呼んで保護。

---

## 3. DB スキーマ (D1)

リモート D1 から `sqlite_master` で取得した実スキーマ。

### 3.1 `profiles`

```sql
CREATE TABLE profiles (
  id           TEXT PRIMARY KEY,                         -- Supabase auth UID と一致
  display_name TEXT NOT NULL,
  role         TEXT NOT NULL DEFAULT 'contributor'
               CHECK (role IN ('visitor', 'contributor', 'admin')),
  is_suspended INTEGER NOT NULL DEFAULT 0
               CHECK (is_suspended IN (0, 1)),
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
)
```

### 3.2 `genres`

```sql
CREATE TABLE genres (
  id         TEXT PRIMARY KEY,
  slug       TEXT NOT NULL UNIQUE,
  name       TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
)
```

### 3.3 `categories`

```sql
CREATE TABLE categories (
  id         TEXT PRIMARY KEY,
  genre_id   TEXT NOT NULL REFERENCES genres(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  slug       TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (genre_id, slug)
)
```

### 3.4 `listings`

```sql
CREATE TABLE listings (
  id            TEXT PRIMARY KEY,
  user_id       TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  genre_id      TEXT REFERENCES genres(id) ON DELETE RESTRICT,
  title         TEXT NOT NULL CHECK (length(title) BETWEEN 1 AND 20),
  description   TEXT NOT NULL CHECK (length(description) BETWEEN 1 AND 100),
  address       TEXT,
  website_url   TEXT NOT NULL
                CHECK (website_url LIKE 'http://%' OR website_url LIKE 'https://%'),
  prefecture    TEXT,
  ward          TEXT,
  service_areas TEXT,                                    -- JSON 配列文字列
  provider_ages TEXT,                                    -- JSON 配列文字列
  status        TEXT NOT NULL DEFAULT 'published'
                CHECK (status IN ('pending', 'published', 'hidden', 'rejected')),
  click_count   INTEGER NOT NULL DEFAULT 0,
  created_by    TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  updated_by    TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now')),
  published_at  TEXT                                     -- 初回 published に遷移した日時
)
```

注意点:
- `friendliness`, `listing_type`, `latitude/longitude` 列は **存在しない** (旧仕様にあったが採用しなかった)
- 地域モデル: `listing_locations` テーブルは無く `prefecture` / `ward` を listings に直接持つ
- **ステータスは 4 値**: `pending` (承認待ち) / `published` (公開中) / `hidden` (一時非公開) / `rejected` (却下)。`flagged` は不採用 (別途 `reports` テーブルで通報管理)
- **`published_at` は初回 `published` に遷移した日時のみ記録** (`COALESCE(published_at, datetime('now'))` で上書きしない仕様。再公開しても元日時を保持)。詳細は `app/src/app/api/admin/listings/[id]/status/route.ts`
- title は 20 字、description は 100 字の上限

### 3.5 `listing_categories` (多対多)

```sql
CREATE TABLE listing_categories (
  listing_id  TEXT NOT NULL REFERENCES listings(id)   ON DELETE CASCADE,
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (listing_id, category_id)
)
```

### 3.6 `reports`

```sql
CREATE TABLE reports (
  id               TEXT PRIMARY KEY,
  listing_id       TEXT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  reporter_user_id TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  reason           TEXT NOT NULL CHECK (length(reason) BETWEEN 1 AND 50),
  status           TEXT NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'reviewed')),
  created_at       TEXT NOT NULL DEFAULT (datetime('now'))
)
```

### 3.7 `announcements`

```sql
CREATE TABLE announcements (
  id         TEXT PRIMARY KEY,
  title      TEXT NOT NULL CHECK (length(title) BETWEEN 1 AND 100),
  body       TEXT NOT NULL CHECK (length(body)  BETWEEN 1 AND 200),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
)
```

### 3.8 `faqs`

```sql
CREATE TABLE faqs (
  id         TEXT PRIMARY KEY,
  question   TEXT NOT NULL CHECK (length(question) BETWEEN 1 AND 100),
  answer     TEXT NOT NULL CHECK (length(answer)   BETWEEN 1 AND 200),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
)
```

### 3.9 `feedback`

```sql
CREATE TABLE feedback (
  id         TEXT PRIMARY KEY,
  user_id    TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  body       TEXT NOT NULL CHECK (length(body) BETWEEN 1 AND 200),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
)
```

### 3.10 `blocked_emails`

```sql
CREATE TABLE blocked_emails (
  email      TEXT PRIMARY KEY COLLATE NOCASE,
  blocked_by TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  reason     TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
)
```

### 3.11 `ad_banners`

```sql
CREATE TABLE ad_banners (
  id           TEXT PRIMARY KEY,
  storage_key  TEXT NOT NULL,           -- Supabase Storage 内の path
  image_url    TEXT NOT NULL,           -- 公開 URL
  link_url     TEXT NOT NULL,           -- HTTPS 必須
  placement    TEXT NOT NULL,           -- 'top' | 'genres:<slug>'
  alt          TEXT,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  enabled      INTEGER NOT NULL DEFAULT 1,
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
)
CREATE INDEX idx_ad_banners_placement_enabled
  ON ad_banners(placement, enabled, sort_order);
```

### 3.12 `access_counter`

```sql
CREATE TABLE access_counter (
  id         TEXT PRIMARY KEY,          -- 'site' (全体) or 'genres:<slug>' ※migration 0016 で 'site' を初期挿入
  count      INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
)
```

---

## 4. URL ルーティング

### 4.1 公開ページ

| パス | 認証 | 内容 |
|---|---|---|
| `/` | 不要 (年齢ゲート必須) | ダッシュボード (ジャンル別カテゴリ件数カード) |
| `/age-gate` | 不要 | 18+ 確認 |
| `/genres/[slug]` | 不要 | ジャンル一覧 (フィルタ + listing) |
| `/listings/[id]` | 不要 | listing 詳細 |
| `/search` | 不要 | キーワード検索結果 |
| `/operator` | 不要 | 運営事務局 (お知らせ / FAQ / 意見) |
| `/login` | — | ログイン |
| `/signup` | — | サインアップ |
| `/reset-password` | — | パスワードリセット |

### 4.2 認証必須ページ

| パス | 認証 | 内容 |
|---|---|---|
| `/listings/new` | contributor 以上 | 情報新規登録 |
| `/listings/[id]/edit` | 所有者 or admin | 情報編集 |
| `/my-listings` | 自分自身 | 自分の登録一覧 |
| `/profile` | 自分自身 | プロフィール設定 |

### 4.3 管理画面 (`/sbbm-control/*`)

ロール=admin のみアクセス可。`/sbbm-control/login` で別途ログイン。
通常ヘッダーとは別の `AdminHeader` を表示。

| パス | 内容 |
|---|---|
| `/sbbm-control` | ダッシュボード |
| `/sbbm-control/listings` | 全 listing 管理 (フィルタ + 編集) |
| `/sbbm-control/listings/[id]/edit` | 個別編集 |
| `/sbbm-control/categories` | カテゴリ管理 (per genre, 並び替え) |
| `/sbbm-control/accounts` | ユーザ管理 (停止 / 強制削除 / ブロック解除) |
| `/sbbm-control/announcements` | お知らせ CRUD |
| `/sbbm-control/faqs` | FAQ CRUD |
| `/sbbm-control/feedback` | ユーザ意見一覧 |
| `/sbbm-control/banners` | 広告バナー CRUD (Supabase Storage 連携) |

### 4.4 API ルート

公開:
- `GET  /api/banners?placement=top|genres:<slug>` — 広告バナー一覧 (enabled のみ)
- `POST /api/counter/visit?key=top|genres:<slug>` — アクセスカウンタ +1
- `POST /api/listings/[id]/click` — リスティングクリック数 +1
- `POST /api/reports` — 通報送信 (未ログインでも可)
- `POST /api/feedback` — 意見送信
- `POST /api/client-error` — クライアント例外を Worker ログへ送信
- `GET  /api/auth/check-email` — サインアップ前のメール重複/ブロック判定
- `GET  /api/listings` / `/api/listings/[id]` — リスティング read API
- `POST /api/listings` — 新規登録 (公開フォーム経由)。**status は `isAdmin ? 'published' (即時公開) : 'pending' (管理者承認待ち)`**（[`app/src/app/api/listings/route.ts`](../app/src/app/api/listings/route.ts) L153）。admin 以外には honeypot + Cloudflare Turnstile + 24h/30d 投稿クォータを適用。in-app browser (LINE/Instagram/FB/X) は UA で検出して Turnstile をスキップ
- `POST /api/age-gate/enter` — 年齢確認 Cookie 発行。form POST は **303 で `next` へ redirect**、JSON fetch は `{ ok: true }` を返す（両対応）
- `GET  /api/dev/d1-check` — D1 接続診断 (dev only 想定)

認証必須:
- `DELETE /api/account/delete` — ユーザ本人のアカウント削除

admin 専用 (`checkAdminApi()` ガード):
- `POST   /api/admin/banners`
- `PATCH  /api/admin/banners/[id]`
- `DELETE /api/admin/banners/[id]`
- `POST   /api/admin/banners/upload` (multipart, Supabase Storage に保存)
- `POST   /api/admin/announcements`、`PATCH/DELETE /api/admin/announcements/[id]`
- `POST   /api/admin/faqs`、`PATCH/DELETE /api/admin/faqs/[id]`
- `POST   /api/admin/categories`、`PATCH/DELETE /api/admin/categories/[id]`
- `PATCH/DELETE /api/admin/listings/[id]`
- `DELETE /api/admin/feedback/[id]`
- `DELETE /api/admin/accounts/[userId]/force-delete`
- `DELETE /api/admin/accounts/blocked/[email]`

### 4.5 UI レイアウト構成 (SiteChrome)

公開側の全ページは `app/src/components/site-chrome.tsx` の `SiteChrome` で
ラップされ、以下の構造で描画する。

```
<div flex flex-col h-svh>           ← 親 (縦並びフレックス、ビューポート高さ固定)
  <Header />                         ← shrink-0 (高さ h-24 = 96px、上部固定)
  <div flex flex-1 overflow-hidden>  ← 残り領域 (横並びフレックス)
    {sidebarOpen && <Sidebar />}     ← 開閉式サイドバー
    <main flex-1 overflow-y-auto>    ← スクロール領域
      <AdBannerSlider />              ← バナー (バナー設定済 placement のみ)
      {children}
      <Footer />
    </main>
  </div>
</div>
```

#### バナー (`AdBannerSlider`) の挙動
- バナーは `<main>` の **コンテンツ先頭** に配置。文書フローに乗るため
  **スクロールするとヘッダーの下に潜り込む** (固定表示ではない)。
- 表示対象 placement:
  - `top` (トップページ `/`)
  - `genres:<slug>` (ジャンル一覧ページ `/genres/<slug>`)
  - それ以外のパスでは表示しない (`bannerPlacement = null`)
- アスペクト比 `5:1` (`aspect-[5/1] w-full`)。
- **ロード中もプレースホルダー (`aspect-[5/1]` 灰色) で領域を予約**し、
  fetch 完了後の画像表示でレイアウトシフトが起きないようにする
  (`AdBannerSlider.tsx` の `banners === null` 分岐)。
- バナー設定が空配列のとき (`banners.length === 0`) は領域を消す。

#### ページ遷移時の scroll リセット
- Next.js のルーターは `<html>` のスクロール位置はリセットするが、
  内側スクロールコンテナ (`<main>` の `overflow-y-auto`) の `scrollTop` は
  保持されてしまう。
- `SiteChrome` で `useEffect(() => { mainRef.current.scrollTop = 0 }, [pathname])`
  を実装し、**ジャンル/ページ変更ごとに main をトップに戻す**。
- これによりバナーが画面外にスクロールアウトした状態でジャンル遷移する不具合
  (バナーがヘッダー下に潜り込んだまま見えない) を防ぐ。

#### Bare paths
`BARE_PATHS = ["/age-gate"]` に該当するパスは Header/Sidebar/Footer を出さず、
`children` のみを描画する (年齢ゲート画面が単独表示になるよう)。

### 4.6 認証コールバック

- `/auth/callback` — Supabase OAuth コールバック (Google 用)

---

## 5. ジャンル・カテゴリ体系

### 5.1 設計方針

- ジャンルは **コード固定** (`app/src/lib/constants/genres.ts`)。DB の `genres`
  テーブルは ID マスタとして存在するが slug は code 側で whitelist される
- カテゴリは **ジャンルごとに独立**。`categories.genre_id` で親ジャンル決定。
  CRUD は管理画面 `/sbbm-control/categories` から
- 旧仕様にあった「軸 (purpose/industry/friendliness)」「フレンドリー度」は
  **採用しなかった**

### 5.2 ジャンル一覧 (sort_order 順)

| sort | slug | 表示名 | hasPrefecture | hasServiceAreas | hasProviderAges |
|---:|---|---|:-:|:-:|:-:|
| 1 | `bar-restaurant` | バー・クラブ・飲食店 | ✓ | – | – |
| 2 | `hattenba` | ハッテンバ | ✓ | – | – |
| 3 | `massage-urisen` | マッサージ・売り専 | ✓ | ✓ | ✓ |
| 4 | `video-gallery` | 動画・ギャラリー | – | – | – |
| 5 | `media-sns` | メディア・SNS | – | – | – |
| 6 | `org-consult` | 団体・相談先 | – | – | – |
| 7 | `matching` | 出会い | – | – | – |
| 8 | `fashion-beauty` | ファッション・美容 | – | – | – |
| 9 | `mania` | マニア系 | – | – | – |
| 10 | `other` | その他 | – | – | – |

フラグの意味:
- **hasPrefecture**: 都道府県フィルタを表示。未指定アクセス時は `prefecture=tokyo` に強制リダイレクト
- **hasServiceAreas**: 「出張可能エリア」フィルタを表示。listings の `service_areas` JSON に格納
- **hasProviderAges**: 「提供者年齢」フィルタを表示

### 5.3 カテゴリ検索の特殊ルール (massage-urisen ジャンル)

OR 検索モード選択中でも `delivery` (出張) カテゴリは **強制 AND** で結合される
(`app/src/app/genres/[slug]/page.tsx` の `FORCED_AND_BY_GENRE` で定義)。

→ 例: OR モードで `[出張, マッサージ, オイル]` を選ぶと、実クエリは
  `出張 AND (マッサージ OR オイル)` になる。

### 5.4 「レズ・ニューハーフ以外」フィルタ

`exclude_nh=1` で `newhalf` / `les` カテゴリを **NOT IN** で除外。OR/AND モードの
影響を受けず常に AND 適用。

---

## 6. 主要な実装規約

- **DB アクセスはすべて prepared statement + `.bind()`** (`app/src/lib/db/queries/*.ts`)。
  user 入力を SQL 文字列補間しない
- **動的 ORDER BY** は `Record<SortKey, string>` 形式の whitelist マップ経由のみ
- **admin 系 API** は必ず `checkAdminApi()` を冒頭で呼ぶ
- **外部リンク (バナー / リスティング website_url)** には `target="_blank"
  rel="noopener noreferrer"` を付与
- **画像最適化**: Supabase Storage の公開 URL は `<img>` 直貼り (next/image の
  `remotePatterns` 未設定)
- **共通エラーハンドリング**: `app/src/app/global-error.tsx` でクライアント例外を
  表示 + `/api/client-error` に送信し Worker ログから後追い可能

---

## 7. 環境変数 / シークレット

| 変数 | 種別 | 設定場所 |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | public | `wrangler.jsonc:vars` + `.env.local` (dev) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public | 同上 |
| `SUPABASE_SERVICE_ROLE_KEY` | secret | `wrangler secret put` (prod) + `app/.dev.vars` (dev) |
| `SUPABASE_JWT_SECRET` | secret | 同上 |

`.dev.vars` / `.env.local` は git 管理対象外 (`app/.gitignore`)。リポジトリには
シークレットを一切コミットしない。

---

## 8. ロードマップ (現状ステータス)

| Phase | 状態 |
|---|---|
| Phase 1: 基盤 + 認証 + ダッシュボード | ✅ 完了 (Cloudflare 移管 v4.0.0) |
| Phase 2: 情報登録 + 検索 + 一覧 | ✅ 完了 |
| Phase 3: 管理者パネル | ✅ 完了 (sbbm-control 配下) |
| Phase 4: 広告バナー + アクセスカウンタ | ✅ 完了 (本ドキュメント時点) |
| Phase 5: 多言語 / レビュー / イベント | 未着手 |

---

## 9. 関連ドキュメント

- [app/AGENTS.md](../app/AGENTS.md) — エージェント / AI 向け実装上の注意
- [app/CLAUDE.md](../app/CLAUDE.md) — `@AGENTS.md` 再エクスポート
- [docs/RESTORE.md](RESTORE.md) — データバックアップ取得 / 復元手順 (Time Travel / 全面 / 部分)
- [legacy/](../legacy/) — 旧設計書・要件書 (history 用)
- [backups/](../backups/) — 過去の D1 export (`.sql`) 群
