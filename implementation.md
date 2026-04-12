# sindbadbookmarks 実装仕様書

**最終更新:** 2026-04-12
**ブランチ:** `feature/age-gate`（masterへのマージ待ち）
**ステータス:** 実装進行中

---

## 目次

### Phase 1: 基盤（完了済み）
- 1. インフラ・デプロイ構成
- 2. 技術スタック
- 3. 認証・ロール
- 4. DB スキーマ（初期）
- 5. ルーティング
- 6. レイアウト
- 7. 年齢ゲート
- 8. 認証ページ群
- 9. リスティング機能（初期）
- 10. ダッシュボード（初期）
- 11. ミドルウェア
- 12. 環境変数
- 13. 既知の課題
- 14. Phase 2 以降 TODO

### Phase 2: 仕様確定（本ドキュメントで追記）
- **15.** 11ジャンル + サイドバー再設計（初版）
- **16.** フレンドリー度廃止・トップ検索簡素化・ログイン導線
- **17.** 情報登録画面フォーム仕様
- **18.** 実装前 確定事項（第1弾: データ形式・サービス提供地域・ダッシュボード構成）
- **19.** リスティング一覧の表示仕様（カード・ページング・ソート）
- **20.** 追加確定事項（第2弾: 名称20字・説明100字必須・URL必須・詳細ページ不要・マイリスティング・管理画面範囲）
- **21.** 通報機能・監査情報・アカウント停止
- **22.** 追加確定事項（第3弾: ヘッダー/サイドバー構成・都道府県表示・認証方式・OGP・モバイル・初期admin）

### 付録
- **A.** 実装着手順序（Section 18.8 + 追加分）
- **B.** 確定事項クイックリファレンス

---

## 1. インフラ・デプロイ構成

| 項目 | 内容 |
|---|---|
| ホスティング | Vercel（knuckle2026's projects） |
| リポジトリ | github.com/knuckle2026/sindbadbookmarksrevival |
| 本番URL | sindbadbookmarksrevival-eh3qozd9d-knuckle2026s-projects.vercel.app |
| プレビューURL | sindbadbookmarksrevival-git-featur-d22cf7-knuckle2026s-projects.vercel.app |
| DB・認証 | Supabase（プロジェクト: kawiaabwfdjwvlxcbwul） |

### monorepo 構造

```
sindbadbookmarksrevival/        ← リポジトリルート
├── app/                        ← Next.js アプリ本体
│   ├── src/
│   │   ├── app/                ← App Router pages
│   │   ├── components/         ← 共通コンポーネント
│   │   └── lib/supabase/       ← Supabase クライアント
│   ├── package.json
│   └── next.config.ts
├── package.json                ← Vercel検知用（next依存のみ宣言）
├── vercel.json                 ← ビルド設定
└── images/                     ← ファビコン生成元画像
```

### vercel.json（ルート）

```json
{
  "buildCommand": "cd app && npm run build",
  "outputDirectory": "app/.next",
  "installCommand": "npm install && cd app && npm install",
  "framework": "nextjs"
}
```

- `installCommand` でルートと `app/` を両方インストール
- ルートの `package.json` に `next` を宣言しておくことで Vercel がフレームワークを検知
- 環境変数（`NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`）は `build.env` と `env` の両方に設定

---

## 2. 技術スタック

| レイヤー | 技術 |
|---|---|
| フレームワーク | Next.js 15.5.14（App Router） |
| 言語 | TypeScript 5 |
| スタイリング | Tailwind CSS 4 |
| DB・認証 | Supabase（@supabase/supabase-js 2, @supabase/ssr） |
| React | React 19 |

---

## 3. 画面・ルート一覧

| パス | ファイル | 認証 | 説明 |
|---|---|---|---|
| `/age-gate` | `app/age-gate/page.tsx` | 不要 | 年齢確認ゲート |
| `/` | `app/page.tsx` | 不要 | ダッシュボード（件数サマリー） |
| `/listings` | `app/listings/page.tsx` | 不要 | 登録情報一覧・検索 |
| `/listings/new` | `app/listings/new/page.tsx` | 必須 | 情報登録フォーム |
| `/listings/[id]` | `app/listings/[id]/page.tsx` | 不要 | 詳細ページ |
| `/login` | `app/login/` | — | ログイン |
| `/signup` | `app/signup/` | — | サインアップ |
| `/reset-password` | `app/reset-password/` | — | パスワードリセット |
| `/auth/callback` | `app/auth/callback/` | — | OAuth コールバック |

---

## 4. レイアウト・UIコンポーネント

### 4.1 SiteChrome（`src/components/site-chrome.tsx`）

全ページを包むクライアントコンポーネント。pathname を読んで `/age-gate` のみクロームを非表示にする。

```
<SiteChrome>
  ├── <Header />        ← /age-gate では非表示
  ├── <Sidebar />       ← /age-gate では非表示
  └── <main>{children}  ← 常に表示
```

### 4.2 Header（`src/components/header.tsx`）

- 背景色: `#B21000`（赤）
- 高さ: `h-24`（約96px / 2.5cm）
- 文字色: 白
- 左側: sindbadbookmarks ロゴ + 現在ページのタイトル
- 右側: ログイン状態に応じて「情報を登録」「ログアウト」or「ログイン」ボタン
- ページタイトルマッピング:

| パス | タイトル |
|---|---|
| `/` | ダッシュボード |
| `/listings` | 登録情報一覧 |
| `/listings/new` | 情報を登録 |
| `/listings/[id]` | 詳細 |
| `/login` | ログイン |
| `/signup` | サインアップ |
| `/reset-password` | パスワードリセット |
| `/profile` | プロフィール |
| `/admin/*` | 管理者パネル |

### 4.3 Sidebar（`src/components/sidebar.tsx`）

- 背景色: `#B21000`（赤）
- 幅: `w-40`（160px / 約3cm）
- 11ジャンルを縦に並べ、各ジャンル名の右横に登録件数を `(123)` 形式で表示
- クリックで `/genres/[slug]` へ遷移（アコーディオン展開なし）
- 「マイリスティング」リンクを常時表示（未ログイン時は認証ゲート）
- ハンバーガーメニュー（☰）で開閉トグル、デフォルトは閉じた状態

**ジャンル構成（11ジャンル）:** Section 23.2 参照

---

## 5. 年齢確認ゲート

### 仕様

- **ファイル:** `src/app/age-gate/page.tsx`
- **ミドルウェア:** `src/middleware.ts`

### フロー

```
ユーザーがサイトにアクセス
       │
       ▼
middleware: age_verified クッキーを確認
       │
       ├─ クッキーあり → そのまま通過
       │
       └─ クッキーなし → /age-gate へリダイレクト
                │
                ├─ 「Enter（18歳以上）」クリック
                │     → age_verified=1 クッキーをセット（24時間）
                │     → window.location.href="/" でトップへ
                │
                └─ 「EXIT（18歳未満）」クリック
                      → window.location.href="https://www.yahoo.co.jp"
```

### バイパスパス（年齢確認をスキップ）

```
/age-gate, /auth, /_next, /favicon, /icon, /apple-icon
```

### クッキー仕様

```
age_verified=1; path=/; max-age=86400; SameSite=Lax
```

- 有効期間: 24時間
- `router.push` ではなく `window.location.href` を使う（フルリロードでミドルウェアにクッキーを確実に渡すため）

---

## 6. 認証（Supabase Auth）

- **Googleログイン**（OAuth 2.0 / Supabase Auth）
  - Supabase ダッシュボードで Google プロバイダー有効化済み
  - Google Cloud Console で OAuth 認証情報を設定済み
- **メール＋パスワード**（Supabase Auth email provider）
- **パスワードリセット**（メール送信）
- セッション管理: `@supabase/ssr` によるクッキーベース

---

## 7. ダッシュボード（`/`）

**Server Component**（`export const dynamic = "force-dynamic"`）

### 表示内容

- **11ジャンルをカード/セクションで3列グリッド表示**
- 各ジャンルセクション内に **カテゴリ名 + (登録件数)** を表示
- 件数0のカテゴリは非表示
- カテゴリ名クリック → `/genres/[slug]?category=[cat-slug]` で絞り込み表示
- ジャンル名クリック → `/genres/[slug]` で全件表示

---

## 8. 登録情報一覧（`/listings`）

**Server Component**

### URLパラメータ

| パラメータ | 型 | 説明 |
|---|---|---|
| `q` | string | キーワード検索（タイトル部分一致） |

カテゴリ・ジャンル・都道府県などの絞り込みはジャンル別ページ `/genres/[slug]` で行う。

### TypeScript 注意

Supabase のリレーション join クエリで型推論が `never` になる既知問題 → `// @ts-nocheck` で回避中

---

## 9. 情報登録（`/listings/new`）

- **未認証** → ログイン案内UI表示（Section 16.3 準拠）
- **フォーム:** `ListingForm.tsx`（Client Component）

### 入力項目

Section 17.1 参照。主要項目:

| フィールド | 型 | 備考 |
|---|---|---|
| ジャンル | 11ジャンルから単一選択 | 必須 |
| 名称 | text（最大20字） | 必須 |
| ウェブサイトURL/SNS | url | 必須 |
| 説明文 | textarea（最大100字） | 必須 |
| カテゴリ | チェックボックス複数選択 | 任意・ジャンル連動 |
| サービス提供者の年代 | チェックボックス複数選択 | マッサージ・売り専のみ |
| 所在地（都道府県/区/詳細住所） | select + text | hasPrefectureジャンルのみ |
| 出張エリア | チェックボックス複数選択 | マッサージ・売り専のみ |

### INSERT フロー

1. `listings` テーブルに INSERT → `listing.id` を取得
2. 選択カテゴリを `listing_categories` テーブルに INSERT

---

## 10. 詳細ページ（`/listings/[id]`）

**不要と確定**（Section 20.2）。名称クリック＝外部サイト遷移のみ。編集は `/listings/[id]/edit` で実施。

---

## 11. DBスキーマ

### 主要テーブル

```
profiles           - ユーザープロフィール（id, display_name, role, is_suspended）
genres             - ジャンルマスタ（id, slug, name, sort_order）
listings           - 掲載情報（id, user_id, genre_id, title, description, website_url, prefecture, ward, address, service_areas, click_count, status, created_at, created_by, updated_at, updated_by）
categories         - カテゴリマスタ（id, genre_id, slug, name, sort_order）
listing_categories - 多対多リレーション（listing_id, category_id）
reports            - 通報（id, listing_id, reason, reporter_user_id, status）
```

### RPC関数

```
get_genre_counts()                          → 11ジャンルの件数
get_category_counts_all()                   → 全ジャンル×カテゴリの件数
increment_click_count(listing_id uuid)      → クリックカウント+1（アトミック）
```

---

## 12. ファビコン

- `src/app/icon.png`（192×192）- PWA / ブラウザタブ
- `src/app/apple-icon.png`（180×180）- iOS ホーム画面
- 元画像: `images/hRRVNL4n_400x400.jpeg`（キャラクター画像）

---

## 13. 既知の課題・TODO

| # | 内容 | 状態 |
|---|---|---|
| 1 | Supabase join クエリの TypeScript 型推論が `never` → `@ts-nocheck` で暫定対応 | 継続 |
| 2 | ~~`/listings/[id]/edit` 編集ページ~~ | ✅ 実装済み |
| 3 | 検索: キーワード全文検索（タイトル部分一致のみ） | 未実装 |
| 4 | ~~ページネーション~~ | ✅ 実装済み |
| 5 | 画像アップロード | 未実装 |
| 6 | 管理者パネル（`/admin`） | 未実装 |
| 7 | プロフィール設定ページ（`/profile`） | 未実装 |
| 8 | ~~地域フィルタ~~ | ✅ 実装済み（地方→都道府県2階層ナビ） |

---

## 14. ブランチ・デプロイ状態

| ブランチ | 状態 | 説明 |
|---|---|---|
| `master` | 本番デプロイ済み（READY） | age-gate・新レイアウト**未適用** |
| `feature/age-gate` | プレビューデプロイ済み（READY） | 年齢確認・新レイアウト実装済み |

→ `feature/age-gate` を master にマージすると本番に適用される

---

## 15. 左サイドバー / ジャンル一覧画面

> ステータス: **実装済み**

### 15.1 ジャンル一覧（11個）

旧サイト準拠の固定ジャンル。サイドバーには上から順に縦並びで表示する。

| # | ジャンル名 | スラッグ案 |
|---|---|---|
| 1 | バー・飲食店 | `bar-restaurant` |
| 2 | ハッテンバ | `hattenba` |
| 3 | マッサージ・売り専 | `massage-urisen` |
| 4 | 公式動画・ギャラリー | `video-gallery` |
| 5 | 個人サイト | `personal-site` |
| 6 | 団体・相談先 | `org-consult` |
| 7 | 出会い | `matching` |
| 8 | 女装・ニューハーフ | `crossdress-newhalf` |
| 9 | ファッション・美容 | `fashion-beauty` |
| 10 | マニア系 | `mania` |
| 11 | その他 | `other` |

### 15.2 左サイドバーの表示仕様

- 11ジャンルを上から縦に並べる（背景色は引き続き `#B21000`）
- 各ジャンル名の **右横に登録件数を `(123)` 形式で表示**
- 件数はジャンルに紐づく公開済み（`status = published`）リスティングの総数
- ジャンルをクリックしても **アコーディオンで縦に展開しない**
- クリック時の挙動 → 「15.3 ジャンル選択時のメイン画面」へ

### 15.3 ジャンル選択時のメイン画面構成

ジャンルクリック後、メイン領域（`<main>`）は以下の縦構成になる。

```
┌────────────────────────────────────────────────────┐
│ ヘッダー（赤 #B21000）                              │
│  [☰] [ロゴ] sindbadbookmarks revival  [情報を登録]  │
├────────────────────────────────────────────────────┤
│ パンくず: ダッシュボード / バー・飲食店                │
│ カテゴリ絞り込み（チェックボックス・横並び）            │
│  ☑ すべて  □ ゲイバー  □ レズバー  □ 飲食 ...      │
│ サービス提供者の年代（マッサージ・売り専のみ）          │
│  □ 20代  □ 30代  □ 40代  □ 50代  □ 60代〜         │
│ 所在地絞り込み（hasPrefectureジャンルのみ）            │
│ ソートタブ（7種）                                    │
│ 一覧表示エリア（20件/ページ、クリックカウント付き）    │
│ ページネーション                                     │
└────────────────────────────────────────────────────┘
```

#### カテゴリチェックボックス絞り込み

- ジャンルページ上部に **そのジャンル専用のカテゴリチェックボックス** を横並びで表示
- カテゴリは **複数選択可能**（OR検索）
- 「すべて」チェックボックスで全カテゴリ一括ON/OFF（マッサージ・売り専ではニューハーフを除く）
- チェック変更時にローカルステートで即時反映 → `router.replace` でURL同期
- カテゴリは各ジャンルごとに紐付く（Section 23.2 参照）

### 15.4 所在地絞り込み（hasPrefecture ジャンル専用）

所在地の入力・絞り込みが可能なジャンル（`hasPrefecture: true`）:
- バー・飲食店 / ハッテンバ / マッサージ・売り専 / ファッション・美容

ジャンル一覧ページで **地方→都道府県** の2階層ナビゲーション（件数付き）を表示。

#### Level 1（デフォルト: ?region= なし）
```
所在地絞り込み
北海道・東北 (3)  関東 (12)  中部 (0)  関西 (5)  ...
```
- 地方名 + (登録件数) をリンクで表示。0件でも表示・クリック可能

#### Level 2（?region=kanto 等）
```
関東
茨城県 (0)  栃木県 (0)  群馬県 (1)  埼玉県 (3)  ...
```
- 都道府県名 + (登録件数) をリンクで表示。0件でも表示・クリック可能
- 選択中の都道府県はハイライト

件数は `listings.prefecture` のみでカウント（出張エリアは含めない）

### 15.5 データ要件・DB変更

#### 15.5.1 ジャンル＋ジャンル別カテゴリのテーブル設計

「ジャンル（11個）」と「ジャンル別カテゴリ（複数選択用）」を **2階層** で表現する。
カテゴリは **後から管理画面で追加・編集・削除可能** にする必要がある。

##### 新規テーブル: `genres`

```sql
CREATE TABLE genres (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  sort_order int NOT NULL,
  created_at timestamptz DEFAULT now()
);
```

11ジャンルを初期投入：

| name | slug | sort_order |
|---|---|---|
| バー・飲食店 | bar-restaurant | 1 |
| ハッテンバ | hattenba | 2 |
| マッサージ・売り専 | massage-urisen | 3 |
| 公式動画・ギャラリー | video-gallery | 4 |
| 個人サイト | personal-site | 5 |
| 団体・相談先 | org-consult | 6 |
| 出会い | matching | 7 |
| 女装・ニューハーフ | crossdress-newhalf | 8 |
| ファッション・美容 | fashion-beauty | 9 |
| マニア系 | mania | 10 |
| その他 | other | 11 |

##### 既存 `categories` テーブルの拡張

既存の `categories` テーブルに **ジャンルへの外部キー** を追加し、「どのジャンルに属するカテゴリか」を表現する。

```sql
ALTER TABLE categories ADD COLUMN genre_id uuid REFERENCES genres(id) ON DELETE CASCADE;
```

- `group_type` カラムは **削除済み**（マイグレーション 00003 で DROP）
- `genre_id` が NOT NULL のレコードのみ使用
- `name` / `slug` / `sort_order` はそのまま利用

##### 初期投入カテゴリ

全11ジャンルのカテゴリは Section 23.2 参照。全ジャンル分が定義済み。

##### 管理画面からの追加

- 管理者（admin）は管理画面（`/admin/categories`）から：
  - ジャンルごとのカテゴリ一覧表示
  - カテゴリの追加（name / slug / sort_order / genre_id）
  - カテゴリの編集
  - カテゴリの削除（紐付く `listing_categories` は CASCADE）
  - 並び順変更
- 将来的にジャンル自体（`genres` テーブル）の追加・編集も管理画面から可能にする（要件外、Phase 後送り可）

→ `lib/supabase/types.ts` に `Genre` 型を新規追加、`Category` 型に `genre_id` を追加

#### 15.5.2 listings テーブル拡張

都道府県絞り込み用に **構造化された都道府県カラム** が必要：

```sql
ALTER TABLE listings ADD COLUMN prefecture text;
```

- 既存の `address` フリーテキストとは別に、`prefecture` を独立カラムで保持
- 登録フォームで都道府県セレクトを必須化（バー・飲食店／マッサージ・売り専系のみ）
- 既存データは手動 or バッチで分割

#### 15.5.3 listings とジャンルの紐付け

リスティングは **必ず1ジャンル** に属する：

```sql
ALTER TABLE listings ADD COLUMN genre_id uuid REFERENCES genres(id);
```

- 登録フォームでジャンルを必須選択
- ジャンル変更時は紐付くカテゴリも整合性を取る必要あり（ジャンル変更で旧カテゴリ削除）

カテゴリは引き続き `listing_categories` 中間テーブルで多対多：

```
listings 1 ──N── listing_categories ──N── categories N ──1── genres
                                            (genre_id)
```

#### 15.5.4 件数取得用 RPC

```sql
get_genre_counts()                       -- サイドバー用: 11ジャンルの件数
get_category_counts_all()                -- ダッシュボード用: 全ジャンル×カテゴリ件数
increment_click_count(listing_id uuid)   -- クリックカウント+1
```

都道府県別件数はジャンル一覧ページ（page.tsx）でJSにより集計（RPC不使用）。

### 15.6 ルーティング（URL設計）

| URL | 説明 |
|---|---|
| `/genres/bar-restaurant` | バー・飲食店一覧（カテゴリ絞り込みなし） |
| `/genres/bar-restaurant?category=gay-bar,mixed-bar` | バー・飲食店 × ゲイバー＋ミックスバー |
| `/genres/bar-restaurant?region=kanto` | バー・飲食店 × 関東地方 |
| `/genres/bar-restaurant?region=kanto&prefecture=tokyo` | バー・飲食店 × 東京都 |
| `/genres/bar-restaurant?category=gay-bar&region=kanto&prefecture=tokyo` | 複合絞り込み |
| `/genres/massage-urisen?category=urisen,gay-massage` | マッサージ・売り専 × 売り専＋ゲイマッサージ |
| `/genres/massage-urisen?service_area=tokyo-23,osaka` | マッサージ・売り専 × 出張エリア絞り込み |
| `/genres/bar-restaurant?sort=popular` | アクセス数順で並び替え |

- `category` パラメータは **カンマ区切りで複数指定可能**（OR検索）
- `service_area` パラメータは **カンマ区切りで複数指定可能**
- `sort` パラメータ: `created_desc`(default) / `created_asc` / `updated_desc` / `updated_asc` / `title_asc` / `title_desc` / `popular`
- カテゴリのスラッグはジャンル内でユニーク（DB全体ではジャンルをまたいで重複可）

### 15.7 主要ファイル

| 種別 | パス |
|---|---|
| 実装済み | `app/src/components/sidebar.tsx` — 11ジャンル＋件数表示 |
| 実装済み | `app/src/components/header.tsx` — ロゴ・ハンバーガー・情報登録ボタン |
| 実装済み | `app/src/app/genres/[slug]/page.tsx` — ジャンル別一覧ページ |
| 実装済み | `app/src/app/genres/[slug]/GenreFilters.tsx` — カテゴリ・出張エリアチェックボックス |
| 実装済み | `app/src/app/genres/[slug]/RegionPrefectureNav.tsx` — 所在地2階層ナビ |
| 実装済み | `app/src/components/listings/SortTabs.tsx` — ソートタブ（7種） |
| 実装済み | `app/src/components/listings/ClickableTitle.tsx` — クリックカウント付きタイトル |
| 実装済み | `app/src/components/listings/Pagination.tsx` — ページネーション |
| 実装済み | `app/src/app/api/listings/[id]/click/route.ts` — クリックカウントAPI |
| 実装済み | `app/src/app/listings/new/ListingForm.tsx` — ジャンル連動フォーム |
| 実装済み | `app/src/lib/constants/genres.ts` — 11ジャンル定義 |
| 実装済み | `app/src/lib/constants/prefectures.ts` — 都道府県＋地方定義 |

### 15.8 未決事項（確定済みは ✅ マーク）

| # | 項目 | 決定 |
|---|---|---|
| 1 | ✅ 全11ジャンルのカテゴリ定義 | **確定**: Section 23.2 参照 |
| 2 | ✅ 都道府県リストの並び順 | **北から南順** |
| 3 | ✅ 既存の `categories.group_type`（purpose/industry）の扱い | **DROP 済み**（マイグレーション 00003） |
| 4 | ✅ 既存リスティングの `prefecture` 欠損データの扱い | **バッチ補完**（マイグレーション or スクリプトで一括補完） |
| 5 | ✅ カテゴリチェックの検索方式 | **OR検索**。ただしマッサージ・売り専の「ニューハーフマッサージ」は特殊扱い（後述 §15.8.1） |
| 6 | ✅ カテゴリ未選択時の挙動 | **全件表示**（ジャンルのみで絞り込み） |
| 7 | ✅ 件数 0 ジャンルの表示有無 | **0件でも表示、クリック可能**（ジャンル一覧画面を表示） |
| 8 | 管理画面 `/admin/categories` の権限制御 | RLS or Service Role Key |
| 9 | ✅ リスティング登録時のジャンル変更時、カテゴリの扱い | **自動クリア**（ジャンル変更時にカテゴリ選択状態をリセット。実装済み） |

#### 15.8.1 マッサージ・売り専のニューハーフマッサージ除外ロジック

マッサージ・売り専ジャンルのカテゴリ絞り込みには **特殊ルール** がある:

- **基本**: カテゴリ絞り込みは OR 検索（いずれかに該当すれば表示）
- **例外**: 「ニューハーフマッサージ」カテゴリを **選択していない** 場合、ニューハーフマッサージに該当するリスティングは **検索結果から除外される（AND NOT 条件）**
- つまり、ニューハーフマッサージの結果を見るには、ユーザーが明示的に「ニューハーフマッサージ」チェックボックスをONにする必要がある
- 何もカテゴリを選択していない状態（全件表示）でも、ニューハーフマッサージは除外される
- ニューハーフマッサージ **のみ** を選択した場合は、ニューハーフマッサージのリスティングだけが表示される

**実装方針**: クエリ側で `category != 'newhalf'` 条件をデフォルトで付与し、「ニューハーフマッサージ」チェック時のみ解除する

---

## 16. フレンドリー度廃止 / トップ検索簡素化 / 未ログイン時の登録導線

> ステータス: **実装済み**

### 16.1 「フレンドリー度（Friendliness）」分類の廃止

**変更内容:**

- **分類軸としての「フレンドリー度」を完全廃止**
- サイドバー・ヘッダー下・トップ検索いずれからも削除
- リスティング登録フォームの「フレンドリー度」入力欄を削除
- DBカラム `listings.friendliness` は **DROP 済み**（マイグレーション 00003）
- RPC `get_dashboard_friendliness_counts()` は廃止
- ダッシュボード（`/`）の「フレンドリー度別」セクション削除

**影響ファイル:**

| 種別 | パス | 変更内容 |
|---|---|---|
| 変更 | `app/src/app/page.tsx` | フレンドリー度セクション削除、RPC呼び出し削除 |
| 変更 | `app/src/components/sidebar.tsx` | フレンドリー度のジャンル削除（11ジャンル構成への移行と同時） |
| 変更 | `app/src/app/listings/page.tsx` | `friendliness` URLパラメータ削除 |
| 変更 | `app/src/app/listings/SearchFilters.tsx` | フレンドリー度セレクト削除 |
| 変更 | `app/src/app/listings/new/ListingForm.tsx` | フレンドリー度選択欄削除 |
| 変更 | `app/src/app/listings/[id]/page.tsx` | フレンドリー度表示削除 |
| 変更 | `app/src/lib/supabase/types.ts` | `FriendlinessLevel` 型を非推奨マーク（当面は残置） |

**注記:**
- 要件定義書（reqest.md）5章では「Friendliness は住所・連絡先と同レベルの属性として任意保持」とあるが、**運用上不要と判断し廃止**
- 既存データへの影響は無し（カラム残置のため）

### 16.2 トップページの検索・フィルタ機能の簡素化

**変更内容:**

カテゴリ絞り込みは **各ジャンルページ（`/listings?genre=xxx`）で行う** ため、トップページ（`/`）および `/listings` のルート表示では以下を削除：

- ❌ カテゴリ絞り込み（`SearchFilters.tsx` のカテゴリドロップダウン）
- ❌ フレンドリー度絞り込み（16.1で廃止）
- ❌ 情報タイプ絞り込み（旧 shop/organization/media）
- ✅ **キーワード検索のみ残す**（タイトル部分一致）

**トップ検索の役割:**

- サイト全体からキーワードで横断検索
- カテゴリ・ジャンル・都道府県などの絞り込みはジャンルページに委ねる
- ダッシュボード（`/`）は件数表示とジャンル入口の提示に特化

**影響ファイル:**

| 種別 | パス | 変更内容 |
|---|---|---|
| 変更 | `app/src/app/page.tsx` | ダッシュボードのカテゴリカード → サイドバー経由へ誘導 |
| 変更 | `app/src/app/listings/SearchFilters.tsx` | キーワード以外のフィルタ UI を削除 |
| 変更 | `app/src/app/listings/page.tsx` | クエリパラメータの `type` / `category` / `friendliness` を廃止（`q` と `genre` / `prefecture` のみ） |

**削減後の `/listings` URLパラメータ:**

| パラメータ | 用途 |
|---|---|
| `q` | キーワード検索（タイトル部分一致） |
| `genre` | ジャンルスラッグ（11ジャンル） |
| `category` | ジャンル配下カテゴリ（カンマ区切り複数） |
| `provider_age` | サービス提供者の年代（カンマ区切り複数、マッサージ・売り専のみ） |
| `exclude_nh` | ニューハーフマッサージ除外フラグ（`1`=除外、マッサージ・売り専のみ） |
| `prefecture` | 都道府県名（バー・飲食店／マッサージ・売り専のみ） |

### 16.3 「情報を登録」押下時の未ログイン導線

**現在の挙動:**

- `/listings/new` は Server Component で未認証ユーザーを `/login` にリダイレクト
- ユーザーは登録画面を見る前に強制的にログイン画面へ飛ばされる

**変更後の挙動:**

- `/listings/new` アクセス時、**未ログインでもページ自体は表示される**
- フォームの代わりに「ログインが必要です」メッセージ＋**ログインボタン** を表示
- ログインボタンを押すと `/login?redirect=/listings/new` へ遷移
- ログイン後は自動で `/listings/new` に戻る

**表示例:**

```
┌──────────────────────────────────────┐
│  情報を登録するにはログインが必要です   │
│                                      │
│  情報の登録には Contributor 権限が    │
│  必要です。ログインして続行してください。│
│                                      │
│       [ログイン]   [新規登録]          │
└──────────────────────────────────────┘
```

**影響ファイル:**

| 種別 | パス | 変更内容 |
|---|---|---|
| 変更 | `app/src/app/listings/new/page.tsx` | 未認証時の `redirect('/login')` を削除し、ログイン案内UIを返す |
| 新規 | `app/src/app/listings/new/LoginRequired.tsx` | 未認証時に表示するログイン案内コンポーネント |
| 変更 | `app/src/app/login/page.tsx` | `redirect` クエリパラメータに対応し、ログイン後に指定URLへ遷移 |
| 変更 | `app/src/app/auth/callback/route.ts` | OAuth コールバック後も `redirect` を尊重 |

### 16.4 変更後の15章反映

- **15.2 サイドバー** から「フレンドリー度」ジャンルは存在しない（11ジャンルのみ）← 元々の11ジャンルに含まれていないため影響なし
- **15.3 ジャンル選択時のメイン画面** の「絞り込みチェックボックス」セクションからフレンドリー度項目を削除
- **15.6 URL設計** から `friendliness` パラメータを削除
- **15.8 未決事項** への追記不要（既に網羅）

### 16.5 未決事項（16章固有）（確定済みは ✅ マーク）

| # | 項目 | 決定 |
|---|---|---|
| 1 | ✅ `listings.friendliness` カラムの最終処理 | **DROP 済み**（`categories.group_type` も同時に DROP。マイグレーション 00003） |
| 2 | ✅ ログイン案内画面のボタン構成 | **「アカウント新規作成」ボタンを表示する**。「情報を登録」ボタンは不要（ログイン後にヘッダーから遷移可能） |
| 3 | ✅ `/login?next=...` のオープンリダイレクト対策 | **実装済み**: `safeRedirectPath()` で `/` 始まり（`//` 除外）のみ許可。login/signup/auth/callback 全箇所に適用 |
| 4 | ✅ ダッシュボードの代替コンテンツ | **ジャンル×カテゴリ件数ツリー（§24.4）で確定・実装済み** |

---

## 17. 情報登録画面（/listings/new）フォーム仕様

### 17.1 入力項目の並び順（上から順）

1. **ジャンル**（必須・単一選択）
   - 11ジャンルから1つ選択（`genres` テーブル参照）
   - 選択値により後続項目の出しわけが発生（カテゴリ一覧、サービス提供地域の有無）
2. **名称**（必須・テキスト）
   - 施設・団体・メディアの名称（`listings.title`）
3. **ウェブサイトURLまたはSNS**（**必須**・テキスト）
   - `listings.website_url` に格納
   - URL 形式バリデーション（http/https および主要SNSリンクを許容）
4. **カテゴリ**（任意・複数選択可）
   - 選択中ジャンルに紐づく `categories`（`categories.genre_id = 選択ジャンル`）をチェックボックスで表示
   - 未定義ジャンルの場合は非表示または「カテゴリなし」表示
   - 保存先: `listing_categories` 中間テーブル
   - **登録画面レイアウト**: マッサージ・売り専では「サービス提供者の年代」と横並び（カテゴリ=左、年代=右）
5. **サービス提供者の年代**（任意・複数選択可・マッサージ・売り専のみ）
   - **ジャンルが「マッサージ・売り専」の場合のみ表示**
   - 登録画面ではカテゴリブロックの **右側** に配置
   - 選択肢: 20代 / 30代 / 40代 / 50代 / 60代〜（チェックボックス）
   - 保存先: `listings.provider_ages`（`text[]` 配列）
   - マッサージ以外のジャンルでは DB に NULL/空配列を保存
   - **一覧画面レイアウト**: カテゴリ絞り込みの **下** に表示
6. **所在地**（`hasPrefecture: true` のジャンルのみ表示: バー・飲食店/ハッテンバ/マッサージ・売り専/ファッション・美容）
   - 「所在地」セクションヘッダーを表示
   - **都道府県**（セレクト、幅半分 `w-1/2`）47都道府県
   - **区**（東京都選択時のみ、都道府県の右横に表示 `w-1/2`）23区セレクト
   - **住所詳細**（任意・テキスト）番地・建物名など自由入力
   - 保存先:
     - `listings.prefecture`（例: `"tokyo"`）
     - `listings.ward`（東京23区のみ使用）
     - `listings.address`（番地以降の自由入力）
7. **サービス提供地域（出張エリア）**（条件付き・複数選択可・チェックボックス）
   - **ジャンルが「マッサージ・売り専」の場合のみ表示**
   - 選択肢: **東京23区 / 東京23区外 + 46道府県**（全48エリア、地域グループ別にチェックボックス表示）
   - 保存先: `listings.service_areas`（`text[]` 配列）
   - マッサージ以外のジャンルでは DB に NULL/空配列を保存

### 17.2 廃止された項目

- **目的別カテゴリ** / **業態別カテゴリ** — ジャンルに紐づく単一カテゴリ群に統一
- **フレンドリー度** — Section 16.1 で廃止、カラムも DROP 済み

### 17.3 DB スキーマ追加・変更（案）

| テーブル | カラム | 型 | 説明 |
|---|---|---|---|
| `listings` | `genre_id` | `uuid FK genres.id` | 選択ジャンル（必須） |
| `listings` | `prefecture` | `text` | 都道府県コード/スラッグ |
| `listings` | `ward` | `text NULL` | 東京23区の区名（東京都の場合のみ） |
| `listings` | `provider_ages` | `text[] NULL` | マッサージ・売り専ジャンル専用（20s/30s/40s/50s/60s_plus） |
| `listings` | `service_areas` | `text[] NULL` | マッサージ・売り専ジャンル専用 |

既存の `listings.address` は「番地・建物名」の自由入力欄として継続利用。

### 17.4 バリデーションとUX

- ジャンルを変更するとカテゴリチェック状態はリセットする（紐づきが変わるため）
- 都道府県が東京都以外になったら `ward` を自動クリア
- ジャンルがマッサージ・売り専以外になったら `service_areas` と `provider_ages` を自動クリア
- 必須項目: ジャンル / 名称 / **URL** / 都道府県（＋東京都なら区）
- 任意項目: 説明文（最大100文字） / カテゴリ / それ以降の住所 / サービス提供地域
- **説明文の入力制限: 100文字以内**（`maxLength={100}` + サーバ側バリデーション、`listings.description` に CHECK 制約 `char_length(description) <= 100` を追加）
- **URL 必須**: 空文字不可、http(s):// または主要SNS URL 形式をバリデーション。DB は `listings.website_url NOT NULL`

### 17.5 影響を受けるファイル（実装時）

| 区分 | パス | 説明 |
|---|---|---|
| 変更 | `app/src/app/listings/new/page.tsx` | フォーム項目の並び替え、条件分岐追加 |
| 変更 | `app/src/app/listings/new/ListingForm.tsx` | 上記フォームロジック、バリデーション |
| 新規 | `app/src/components/form/PrefectureSelect.tsx` | 都道府県＋東京23区の連動セレクト |
| 新規 | `app/src/components/form/ServiceAreaPicker.tsx` | マッサージ専用の複数選択UI |
| 新規 | `app/src/components/form/GenreCategoryChecks.tsx` | ジャンル連動カテゴリチェック群 |
| 新規マイグレーション | `supabase/migrations/xxxx_listings_genre_location.sql` | 17.3 のカラム追加 |

### 17.6 未決事項（確定済みは ✅ マーク）

| # | 項目 | 決定 |
|---|---|---|
| 1 | ✅ 政令指定都市の区選択 | **東京23区のみ**。大阪市・横浜市等は対象外 |
| 2 | サービス提供地域の選択肢マスタ化 | 固定配列 vs `service_areas` テーブル化 |
| 3 | ✅ 都道府県の保存形式 | **スラッグ**（`tokyo` 等）で確定・実装済み |
| 4 | ✅ マッサージ・売り専以外への出張エリア拡張 | **拡張しない**。マッサージ・売り専のみで確定 |
| 5 | ✅ 同一ジャンル内でカテゴリ未定義の場合の UI | **セクションごと非表示**（カテゴリが0件なら表示しない。実装済み） |

---

## 18. 実装前 確定事項（2026-04-08 決定）

Section 15〜17 の未決事項および追加論点について、以下のとおり確定。実装はこの決定に従う。

### 18.1 データ形式・スキーマ確定

| # | 項目 | 決定 |
|---|---|---|
| 1 | 都道府県の保存形式 | **スラッグ**（例: `tokyo`, `osaka`, `hokkaido`） |
| 2 | 東京以外の市区町村 | **東京23区のみ特別扱い**。他都道府県は `ward` 未使用、番地以降を `address` 自由入力に統合 |
| 3 | `listings.friendliness` カラム | **DROP 済み**（マイグレーション 00003） |
| 4 | 緯度経度 (`latitude`/`longitude`) | **Phase 2 では入力不要**。カラムは残すが NULL 許容、フォームに含めない。Phase 4 でジオコーディング検討 |
| 5 | ウェブサイトURL/SNS | **1カラム（`listings.website_url`）に統合、NOT NULL（必須）**。複数URL不要。SNSプロファイルも同カラム |
| 5b | 説明文の文字数制限 | **100文字以内**（入力時 `maxLength`、DB CHECK 制約） |
| 6 | 多言語化 | **対応しない**（ブラウザ翻訳機能で代替）。`name_en` 等の追加カラムは作らない |

### 18.2 サービス提供地域 選択肢（確定）

マッサージ・売り専ジャンル選択時のみ表示。**チェックボックスで複数選択可**。`listings.service_areas text[]` に配列で保存。

全48エリア: **東京23区 + 東京23区外 + 46道府県**（東京都を除く全道府県）

- **東京**: 東京23区 (`tokyo-23`) / 東京23区外 (`tokyo-out23`)
- **北海道・東北**: 北海道 / 青森県 / 岩手県 / 宮城県 / 秋田県 / 山形県 / 福島県
- **関東**: 茨城県 / 栃木県 / 群馬県 / 埼玉県 / 千葉県 / 神奈川県
- **中部**: 新潟県 / 富山県 / 石川県 / 福井県 / 山梨県 / 長野県 / 岐阜県 / 静岡県 / 愛知県
- **関西**: 三重県 / 滋賀県 / 京都府 / 大阪府 / 兵庫県 / 奈良県 / 和歌山県
- **中国**: 鳥取県 / 島根県 / 岡山県 / 広島県 / 山口県
- **四国**: 徳島県 / 香川県 / 愛媛県 / 高知県
- **九州・沖縄**: 福岡県 / 佐賀県 / 長崎県 / 熊本県 / 大分県 / 宮崎県 / 鹿児島県 / 沖縄県

保存形式はスラッグ（例: `tokyo-23`, `tokyo-out23`, `hokkaido`, `osaka`, `fukuoka` 等）。道府県スラッグは `prefectures.ts` と共通。

フォーム表示は地域グループ別にチェックボックスを並べる（`SERVICE_AREA_GROUPS` 定数で定義）。実装上は固定配列（TypeScript const）として `app/src/lib/constants/service-areas.ts` に定義。

### 18.3 カテゴリ未定義ジャンルの UI

全11ジャンルにカテゴリが定義済み（Section 23.2 参照）。カテゴリが0件のジャンルでは：

- 登録フォームの **カテゴリセクション自体を非表示**
- ジャンル別一覧ページでも **カテゴリ絞り込み UI を非表示**
- 管理画面 `/admin/categories` でカテゴリが追加されたら自動的に表示されるようにする（件数ベースで判定）

### 18.4 センシティブコンテンツ表示

- age-gate により全体ブロック済みのため、**ジャンル別の追加警告・画像ぼかし等は実装しない**
- ハッテンバ等のジャンルも他ジャンルと同一UIで表示

### 18.5 ダッシュボード（トップページ）の構成

フレンドリー度カード廃止後の代替コンテンツ：

1. **ジャンル別件数カード**（11ジャンル分、件数とアイコン）
2. **新着リスティング10件**（作成日時 DESC、`status = 'published'` のみ）
3. **キーワード検索ボックス**（Section 16.2 で確定済み、キーワードのみ）

それ以外（都道府県別集計、統計グラフ等）は Phase 4 以降。

### 18.6 ログイン後リダイレクト（セキュリティ）

- `/login?redirect=...` は **同一オリジン相対パス（`/` 始まり）のみ許可**
- 外部URLや `//evil.com` 形式は拒否してデフォルト `/` に戻す
- 実装箇所: `app/src/app/login/page.tsx` および `app/src/app/auth/callback/route.ts`

### 18.7 管理画面の認証方針（暫定）

- 当面は同一リポジトリ内の `/admin/*` ルートで実装
- middleware で `profiles.role = 'admin'` をチェック、非 admin は `/` へリダイレクト
- 別リポジトリ/別ドメイン化は Phase 3 後半で検討

### 18.8 実装着手順序（提案）

1. **マイグレーション**: `genres` テーブル作成、`listings` に `genre_id`/`prefecture`/`ward`/`service_areas` 追加、`friendliness` DROP、`categories.genre_id` 追加
2. **シード**: 11ジャンル + バー/マッサージのカテゴリ投入
3. **RPC**: `get_genre_counts()`, `get_prefecture_counts_by_genre(slug)`
4. **共通定数**: 都道府県スラッグ配列、東京23区配列、サービス提供地域配列
5. **サイドバー**: 11ジャンル + 件数表示（アコーディオン廃止）
6. **ヘッダー**: ジャンル名表示、キーワード検索のみ
7. **ダッシュボード**: ジャンル別カード + 新着10件
8. **登録フォーム**: Section 17 の並び順で再構築
9. **未ログイン時ログイン案内**: `LoginRequired` コンポーネント
10. **管理画面 `/admin/categories`**: カテゴリCRUD
11. **feature ブランチから master へマージ**

### 18.9 この時点で残る未決事項

なし（実装に着手可能）。実装途中で新たに判明した論点はその都度確認する。

---

## 19. リスティング一覧の表示仕様

ジャンル別一覧ページ・検索結果ページ・ダッシュボード新着など、リスティングをリスト表示する全画面で共通のカード仕様。

### 19.1 カードレイアウト

1件あたりの表示内容（縦積み）:

1. **名称**（`listings.title`）
   - 色: **#B21000**
   - 太字（font-bold）
   - フォントサイズ: 大きめ（text-lg 〜 text-xl 目安）
   - クリッカブル: `listings.website_url` を **新規ウィンドウ**（`target="_blank" rel="noopener noreferrer"`）で開く
   - `website_url` が未登録の場合はリンクなしのテキスト表示
2. **説明文**（`listings.description`）
   - 名称の直下
   - 通常ウェイト、黒〜ダークグレー
   - **最大100文字**で切り詰め表示。100文字を超える場合は末尾に `…` を付与（`description.length > 100 ? description.slice(0, 100) + '…' : description`）
3. （補助情報: 都道府県・カテゴリタグ等は任意で名称右 or 説明下に表示。仕様未確定のため Phase 2 では省略可）

カード全体のクリックで詳細ページに遷移する従来挙動は **行わない**。名称クリック＝外部サイト遷移のみ。

### 19.2 ページング

- **1ページあたり最大20件**
- ページネーションUIは下部に配置（前へ / ページ番号 / 次へ）
- URL クエリパラメータ: `?page=2` 形式
- Supabase クエリは `.range((page-1)*20, page*20 - 1)` で取得
- 総件数は `count: 'exact'` で取得してページ数算出

### 19.3 並び順切り替え

- 一覧上部に **ソートタブ（pill ボタン横並び）** を配置（`SortTabs` コンポーネント）
- 選択肢（7種）:
  | value | 表示ラベル | Supabase order |
  |---|---|---|
  | `created_desc` | 登録日新しい順 | `.order('created_at', { ascending: false })` |
  | `created_asc` | 登録日古い順 | `.order('created_at', { ascending: true })` |
  | `updated_desc` | 更新日新しい順 | `.order('updated_at', { ascending: false })` |
  | `updated_asc` | 更新日古い順 | `.order('updated_at', { ascending: true })` |
  | `title_asc` | 名称 あ→わ | `.order('title', { ascending: true })` |
  | `title_desc` | 名称 わ→あ | `.order('title', { ascending: false })` |
  | `popular` | アクセス数順 | `.order('click_count', { ascending: false })` |
- **デフォルト**: `created_desc`（新しい順、URLパラメータ省略）
- URL クエリパラメータ: `?sort=popular` 形式
- 並び替え操作時は `page=1` にリセット

### 19.3.1 クリックカウント（アクセス数）

- `listings.click_count integer NOT NULL DEFAULT 0` カラムで保持
- 名称リンクのクリック時に `ClickableTitle` コンポーネントが `/api/listings/[id]/click` へ fire-and-forget POST
- サーバー側は `supabase.rpc('increment_click_count', { listing_id })` でアトミックに +1
- ナビゲーション（外部サイト遷移）をブロックしない設計

### 19.4 空状態

- 0件の場合: 「該当するリスティングがありません」のメッセージ表示
- ソート/ページングUIは非表示

### 19.5 影響ファイル（実装時）

| 区分 | パス | 説明 |
|---|---|---|
| 新規 | `app/src/components/listings/ListingCard.tsx` | 19.1 のカードコンポーネント |
| 新規 | `app/src/components/listings/ListingList.tsx` | カード配列 + 空状態 |
| 新規 | `app/src/components/listings/SortSelect.tsx` | 19.3 のソートコンボボックス |
| 新規 | `app/src/components/listings/Pagination.tsx` | 19.2 のページングUI |
| 変更 | `app/src/app/listings/page.tsx` | 一覧ページで上記を組み合わせ |
| 変更 | `app/src/app/genres/[slug]/page.tsx` | ジャンル別ページでも同一コンポーネントを使用 |

### 19.6 未決事項（確定済みは ✅ マーク）

| # | 項目 | 決定 |
|---|---|---|
| 1 | ✅ ~~説明文の行数制限~~ | **確定: 入力時点で100文字以内必須のため切り詰め不要** |
| 2 | ✅ カード内の補助メタ情報 | **名称 + 説明 + カテゴリタグ** を表示。都道府県・登録日は非表示 |
| 3 | ✅ URL未登録時の名称表示 | **該当なし — URL は必須入力**（`website_url NOT NULL`）のため発生しない |
| 4 | ✅ ページング最大ページ数 UI | **省略表示あり**（`1 ... 5 6 7 ... 20` 形式） |

---

## 20. 追加確定事項（2026-04-08 第2弾）

### 20.1 フィールド仕様 確定

| 項目 | 決定 |
|---|---|
| 名称（title） | **必須・最大20文字**。`maxLength={20}`、DB CHECK `char_length(title) <= 20` |
| 説明文（description） | **必須・最大100文字**。`maxLength={100}` + `NOT NULL` + CHECK `char_length(description) <= 100 AND char_length(description) >= 1` |
| URL（website_url） | **必須**。`https?://` フル形式に加え、**SNSアカウント指定も可**（X/Instagram/Threads/TikTok/Facebook/YouTube/LINE 等の `https://` 始まりのプロファイルURL）。バリデーションは `/^https?:\/\/.+/` のゆるい正規表現で許容し、到達性チェックは行わない |

カード表示時の100文字切り詰めロジックは不要（入力時点で保証されるため）。Section 19.1 の該当記述も入力制限に統一。

### 20.2 詳細ページ 不要

- `/listings/[id]` 詳細ページは **作らない**
- 一覧カードの **名称の右側に目立たない小さなリンク**（例: `⚠ 報告` のような薄いグレー小文字）を配置し、通報フォーム（モーダル or 専用ページ `/listings/[id]/report`）へ誘導
- 通報UIの具体実装は Phase 3 で決定

### 20.3 マイリスティング `/my/listings`

- **作る**（Contributor 自身の登録情報管理用）
- 機能:
  - 自分が登録したリスティング一覧（ページング・ソートは Section 19 準拠）
  - 各行に「編集」「削除」ボタン
  - 削除は **物理削除**（確認ダイアログ → Supabase `DELETE`、RLS `delete using (user_id = auth.uid())`）
- 編集画面は `/listings/[id]/edit`（登録フォームの再利用、RLS で本人のみ許可）

### 20.4 Phase 2 管理画面 範囲拡張

Phase 2 時点で以下の管理画面を実装する（当初案より拡張）：

| パス | 機能 |
|---|---|
| `/admin/categories` | カテゴリCRUD（ジャンル別） |
| `/admin/listings` | **全リスティングの一覧・編集・削除**（登録者アカウント情報を同一行に表示） |

`/admin/listings` の一覧カラム:
- 名称 / ジャンル / 都道府県 / ステータス / **登録者メール or ユーザー名** / 登録日時 / 編集ボタン / 削除ボタン

通報管理 `/admin/reports` とユーザー停止 `/admin/users` は Phase 3 で追加。

### 20.5 削除方針 確定

| 主体 | 対象 | 方針 |
|---|---|---|
| Contributor 自身 | 自分のリスティング | **物理削除** |
| Admin | 任意のリスティング | **物理削除**（Phase 2） |
| Admin | ユーザーアカウント | Phase 3（停止＝論理、削除＝物理を想定） |

### 20.6 未決事項（実装中に決定可）

| # | 項目 | 備考 |
|---|---|---|
| 1 | 通報モーダル or 通報ページ | Phase 3 で決定 |
| 2 | `/admin/listings` で admin 編集時の監査ログ | Phase 3 以降 |
| 3 | 削除時の関連データ（`listing_categories` 等）のカスケード | 推奨: FK `ON DELETE CASCADE` |
| 4 | 管理画面 admin 判定 | `profiles.role = 'admin'` チェック（Section 18.7 準拠） |

---

## 21. 通報機能・監査情報・アカウント停止

### 21.1 通報機能

- **ログイン不要**で誰でも通報可能（匿名通報）
- 一覧カードの名称右の「報告」小リンク押下で通報フォームへ遷移（または同ページ内モーダル）
- 通報フォームの表示項目:
  1. **名称**（通報対象リスティングの `title`、表示のみ）
  2. **について**（固定ラベル、読み取り専用の説明テキスト）
  3. **報告内容**（テキストエリア、**必須・最大50文字**、`maxLength={50}` + DB CHECK）
  4. **運営へ報告** ボタン
- 送信後: **報告完了画面** へ遷移
  - 完了メッセージ表示
  - 「トップ画面へ戻る」リンク（`/`）を表示
  - 文言上は「ログイン後トップ画面へ戻るリンクを表示」とあるが、通報自体はログイン不要のため、リンク先は通常のトップ `/` とする
- 通報先 DB: 既存の `reports` テーブルを利用（`reporter_user_id` は NULL 許容、`listing_id`、`reason`（50文字）、`created_at`）
- RLS: 匿名 INSERT 可、SELECT は admin のみ

### 21.2 監査情報（リスティング）

`listings` テーブルに以下を保持：

| カラム | 型 | 説明 |
|---|---|---|
| `created_at` | `timestamptz` | 登録日時（既存） |
| `created_by` | `uuid FK auth.users` | 登録者（= 初回の `user_id`） |
| `updated_at` | `timestamptz` | 更新日時（トリガーで自動更新） |
| `updated_by` | `uuid FK auth.users NULL` | 最終更新者 |

- INSERT 時: `created_by = auth.uid()`, `updated_by = auth.uid()`
- UPDATE 時: `updated_at = now()`, `updated_by = auth.uid()`（トリガーまたはアプリ側で設定）
- 管理画面 `/admin/listings` の一覧カラムに以下を追加表示:
  - 登録日時 / 登録者（メール or 表示名）/ 更新日時 / 更新者（メール or 表示名）

### 21.3 アカウント停止（Admin権限）

- 管理者は `/admin/listings` または `/admin/users` から、**特定の情報登録者のアカウントを利用不可**にできる
- **復元不可**（元に戻す機能は実装しない）
- 実装方針:
  - `profiles.is_disabled boolean default false` カラム追加
  - Admin 操作で `is_disabled = true` に更新
  - middleware / auth ガードで `is_disabled = true` のユーザーは全ページアクセス不可（age-gate と auth の間で判定し、専用の「アカウント停止中」ページへリダイレクト）
  - RLS: `listings` の INSERT/UPDATE/DELETE は `NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_disabled)` を条件に追加
- 停止済みアカウントの既存リスティングは **そのまま残す**（自動削除はしない、必要なら admin が個別削除）
- UI:
  - `/admin/listings` の登録者列の横に「このユーザーを停止」ボタン
  - 確認ダイアログ（「この操作は取り消せません。本当に停止しますか？」）
  - 停止成功後、該当ユーザーの行に「停止済み」バッジ

### 21.4 DB マイグレーション追加事項

Section 18.8 のステップ1に以下を追加：

- `listings.created_by uuid`（既存 `user_id` を流用 or リネーム）
- `listings.updated_by uuid`
- `listings.updated_at` の自動更新トリガー
- `profiles.is_disabled boolean default false`
- `reports.reason` に CHECK `char_length(reason) <= 50`
- `reports.reporter_user_id` を NULL 許容に変更（匿名通報対応）
- `reports` の RLS: anon INSERT 許可

### 21.5 影響ファイル（実装時）

| 区分 | パス | 説明 |
|---|---|---|
| 新規 | `app/src/app/listings/[id]/report/page.tsx` | 通報フォーム画面（ログイン不要） |
| 新規 | `app/src/app/listings/[id]/report/complete/page.tsx` | 報告完了画面 |
| 新規 | `app/src/app/account-disabled/page.tsx` | 停止済みユーザー向け案内ページ |
| 変更 | `app/src/middleware.ts` | `is_disabled` チェック追加 |
| 変更 | `app/src/app/admin/listings/page.tsx` | 監査カラム + 停止ボタン |
| 新規 | `app/src/app/admin/users/disable/route.ts` | ユーザー停止 API |

### 21.6 未決事項

| # | 項目 | 備考 |
|---|---|---|
| 1 | 通報のスパム対策 | reCAPTCHA / rate limit / 同一IPチェック いずれも Phase 3 |
| 2 | 停止済みユーザーのログイン自体を拒否するか | middleware で可能だが、Supabase Auth 側のバン機能併用も検討 |
| 3 | 通報の「について」固定文言 | 具体的な文言を後日決定（例: 「以下のリスティングについて報告します」） |
| 4 | 通報完了画面の文言 | 「ご報告ありがとうございました。内容を確認のうえ対応いたします。」程度を想定 |

---

## 22. 追加確定事項（2026-04-08 第3弾）

### 22.1 レイアウト・ナビゲーション

| 項目 | 決定 |
|---|---|
| ヘッダー右側 | **「情報を登録」ボタン**を配置（常時表示、未ログイン時は押下後にログイン案内＝Section 16.3） |
| サイドバー | 11ジャンルリスト（Section 15 準拠） + **「マイリスティング」リンクを常時表示**（未ログインでも表示）。未ログインで押下した場合は `/my-listings` 側で「ログインが必要です」案内＋ログイン/新規登録ボタンを表示（Section 16.3 と同等の認証ゲート）。ログイン済みの場合は自分の登録 listings 一覧を表示 |

### 22.2 所在地絞り込み 表示方針

`hasPrefecture: true` の4ジャンル（バー・飲食店/ハッテンバ/マッサージ・売り専/ファッション・美容）で表示。

- **地方→都道府県** の2階層ナビゲーション（Section 15.4 参照）
- 地方一覧: 件数付き、0件でも表示・クリック可能
- 都道府県一覧: 選択した地方内のみ表示、件数付き、0件でも表示・クリック可能
- 選択中の都道府県はハイライト表示

### 22.3 マッサージ・売り専 件数基準

- **件数基準 = 情報（リスティング）件数**
- カテゴリは複数選択可能だが、件数カウントは **1リスティング = 1件**（カテゴリ数で重複カウントしない）
- サービス提供地域（`service_areas`）別の件数表示は同様に **リスティング件数ベース**
- 都道府県別カウントは `listings.prefecture` を基準（マッサージ・売り専も他ジャンル同様 47都道府県表示）

### 22.4 カテゴリ絞り込みロジック

- **基本: OR 条件**（複数カテゴリチェック時はいずれかに該当すれば表示）
- SQL: `WHERE listing_categories.category_id IN (選択カテゴリID配列)` + `DISTINCT listings.id`
- **例外: マッサージ・売り専の「ニューハーフマッサージ」除外ルール**（詳細は §15.8.1 参照）
  - 「ニューハーフマッサージ」を明示的に選択しない限り、ニューハーフマッサージのリスティングは検索結果から除外される（AND NOT 条件）
  - カテゴリ未選択（全件表示）時もニューハーフマッサージは除外

### 22.5 認証方式

- **Email + Password** と **Google OAuth** の2方式を提供
- ログイン画面に両方のボタンを並列表示
- Supabase Auth の設定:
  - Email provider: 有効化
  - Google provider: 有効化（Google Cloud Console で OAuth 2.0 クライアント作成、`redirect_uri` を Supabase コールバックに設定）
- プライバシー配慮: X（Twitter）OAuth は性的内容NGポリシーのリスクがあるため採用しない
- サインアップ:
  - **誰でも登録可**、Admin 承認不要
  - デフォルトロール: `profiles.role = 'contributor'`
  - メール確認フロー: 有効（Supabase デフォルト）

### 22.6 OGP 画像

- Phase 2 では **OGP/サムネ画像の取得・表示は行わない**
- カードはテキストのみ（名称 + 説明文）
- Phase 4 で OGP 自動取得を検討

### 22.9 管理画面の独立方針（追加確定）

- **一般利用者からは管理画面の存在が分からないように隠蔽する**
  - トップ／サイドバー／ヘッダー／フッター等、公開ページからは `/admin` へのリンクを一切張らない
  - 管理画面URLは推測されにくいパスにする（例: `/admin` ではなく `/sbbm-control` 等、最終パスは実装時に決定）
  - `robots.txt` で該当パスを `Disallow` に追加、`noindex` メタタグ付与
  - 未認証 or 非 admin のアクセスは **404 を返す**（403/ログイン画面リダイレクトは存在を示唆するため避ける）
- Phase 2 で **新規に専用画面として実装**（既存のユーザー向けUIを流用せず、独立レイアウトで構築）
- 管理者専用のヘッダー（ユーザー向けの赤ヘッダーとは別デザイン、「情報を登録」ボタンは非表示、ナビとして `カテゴリ / リスティング / （将来）通報 / ユーザー` リンク）
- ユーザー向けサイドバーは非表示、admin 用の別サイドバー or 上部ナビのみ
- 初期 admin ユーザー `goldenapplepart2@hotmail.com` は **Supabase Auth に未作成**。Step 1 の一環として手動サインアップ → `profiles.role='admin'` 付与
- admin ログインは通常の `/login` とは **別のログイン入口**（例: `/sbbm-control/login`）を用意し、こちらも一般利用者からは分からないようにする

### 22.7 保留項目 → 確定

| # | 項目 | 決定 |
|---|---|---|
| A | モバイルレスポンシブ対応時期 | **Phase 4 に先送り**。Phase 2 は PC レイアウト（固定サイドバー）のみ対応、モバイルでの表示崩れは許容 |
| B | 初期 admin ユーザー | **`goldenapplepart2@hotmail.com`**。Supabase Auth で作成後、SQL で `UPDATE profiles SET role='admin' WHERE email='goldenapplepart2@hotmail.com'` を実行して権限付与 |

> ⚠️ **セキュリティ注意**: パスワードは本ドキュメントに記載しない。初期 admin のパスワードは別途安全な経路（パスワードマネージャ等）で管理し、リポジトリには絶対にコミットしないこと。GitHub に公開されるファイルに平文パスワードが載ることは重大なセキュリティインシデントとなる。

### 22.8 関連セクション

- Section 15.2 サイドバー: マイリスティングリンク
- Section 15.3 ジャンルページ: カテゴリ絞り込み + 所在地ナビ
- Section 15.6 URL設計: カテゴリ OR 条件・ソートパラメータ
- Section 24: ヘッダー再構成

---

## 付録A. 実装着手順序（統合版）

Section 18.8 に 20/21/22 の追加要件を統合した最終的な実装手順。

1. **マイグレーション**
   - `genres` テーブル作成
   - `categories` に `genre_id` 追加
   - `listings` に `genre_id` / `prefecture`(slug) / `ward` / `service_areas text[]` / `created_by` / `updated_by` / `updated_at` 追加
   - `listings.title` CHECK `char_length(title) <= 20`
   - `listings.description` NOT NULL + CHECK `char_length(description) BETWEEN 1 AND 100`
   - `listings.website_url` NOT NULL
   - `listings.friendliness` **DROP**（実施済み: マイグレーション 00003）
   - `listings.click_count integer NOT NULL DEFAULT 0`（実施済み: マイグレーション 00003）
   - `listings.latitude` / `longitude` は残す（NULL許容、フォーム未使用）
   - `profiles.is_disabled boolean default false` 追加
   - `reports.reason` CHECK `char_length(reason) <= 50`、`reporter_user_id` NULL 許容
   - `updated_at` 自動更新トリガー作成
   - FK `ON DELETE CASCADE`（`listing_categories` 等）
2. **シード**: 11ジャンル + 全ジャンルのカテゴリ（Section 23.2 参照）
3. **RPC 関数**
   - `get_genre_counts()` 11ジャンルの件数
   - `get_prefecture_counts_by_genre(genre_slug text)` 47都道府県件数（0件含む）
   - `get_service_area_counts()` マッサージ用48エリア件数
4. **共通定数**
   - `app/src/lib/constants/prefectures.ts` 47都道府県スラッグ + 地域グループ（北海道東北/関東/中部/関西/中国/四国/九州沖縄）
   - `app/src/lib/constants/tokyo-wards.ts` 東京23区
   - `app/src/lib/constants/service-areas.ts` 48エリア（東京23区/23区外+46道府県、地域グループ付き）
   - `app/src/lib/constants/genres.ts` 11ジャンル
5. **認証拡張**
   - Email+Password（既存）+ **Google OAuth** 追加（Supabase設定 + ログイン画面ボタン）
   - `is_disabled` チェックを middleware に追加 → `/account-disabled` へ
6. **サイドバー再設計**（Section 15 + 22.1）
   - 11ジャンル（件数付き、アコーディオン廃止、クリックで `/genres/[slug]`）
   - **「マイリスティング」リンクを常時表示**（ログイン有無に関わらず）。未ログイン時は `/my-listings` 側で認証ゲートを表示
7. **ヘッダー再設計**（22.1）
   - 左: ページタイトル
   - 右: **「情報を登録」ボタン**
8. **ダッシュボード**（18.5）
   - ジャンル別件数カード11個
   - 新着リスティング10件
   - キーワード検索ボックスのみ
9. **リスティング一覧カードコンポーネント**（Section 19 + 20.2）
   - 名称 #B21000 太字 + 外部リンク（新規ウィンドウ）
   - 名称右に「報告」小リンク
   - 説明文（100字以内保証済みなので切り詰め不要）
   - ソート4種・20件ページング
10. **ジャンル別ページ** `/genres/[slug]`
    - ヘッダーにジャンル名
    - カテゴリチェック絞り込み（OR条件）
    - 都道府県地域別アコーディオン（47件、0件はクリック不可）
    - マッサージジャンルはサービス提供地域13件も表示
11. **登録フォーム** `/listings/new`（Section 17 + 20.1）
    - 並び順: ジャンル / 名称(20字必須) / URL(必須) / 説明(100字必須) / カテゴリ(ジャンル連動OR) / 住所(都道府県+東京23区+自由) / サービス提供地域(マッサージのみ)
    - 未ログイン時 `LoginRequired` 表示（Section 16.3）
12. **マイリスティング** `/my/listings` + 編集 `/listings/[id]/edit`（Section 20.3）
    - 物理削除、本人RLS
13. **通報機能**（Section 21.1）
    - `/listings/[id]/report` ログイン不要フォーム
    - `/listings/[id]/report/complete` 完了画面
14. **管理画面**（Section 20.4 + 21.3）
    - `/admin/categories` CRUD
    - `/admin/listings` 全件CRUD + 登録者情報/監査列表示 + ユーザー停止ボタン
    - admin 判定: `profiles.role = 'admin'`
15. **初期データ**
    - `goldenapplepart2@hotmail.com` を admin 化（SQL 手動実行）
16. **feature/age-gate → master マージ**

モバイルレスポンシブは **Phase 4** に先送り。

---

## 付録B. 確定事項クイックリファレンス

| カテゴリ | 項目 | 値 |
|---|---|---|
| デザイン | メインカラー | `#B21000` |
| デザイン | ヘッダー高さ | 約96px（h-24）、白文字 |
| デザイン | サイドバー幅 | 約160px（w-40）、赤背景 |
| デザイン | モバイル対応 | Phase 4 |
| 認証 | 方式 | Email+Password / Google OAuth |
| 認証 | サインアップ | 誰でも可、承認不要 |
| 認証 | 初期 admin | `goldenapplepart2@hotmail.com` |
| 認証 | age-gate Cookie | `age_verified=1`, 24h |
| 入力 | 名称 | 必須・最大20字 |
| 入力 | 説明文 | 必須・最大100字 |
| 入力 | URL | 必須・`https?://` 形式・SNSも可 |
| 入力 | 都道府県保存形式 | スラッグ（`tokyo` 等） |
| 入力 | 東京以外の区 | 自由入力に統合 |
| 表示 | 一覧1ページ | 20件 |
| 表示 | ソート | 登録日昇降 / 更新日昇降 / 名称昇降 / アクセス数順（7種） |
| 表示 | デフォルトソート | 登録日新しい順 |
| 表示 | 詳細ページ | 不要 |
| 表示 | カテゴリ絞り込み | OR条件 |
| 表示 | 所在地絞り込み | 地方→都道府�� 2階層ナビ（hasPrefecture 4ジャンルのみ、0件も表示・クリック可） |
| 表示 | OGP画像 | Phase 2 では無し |
| 機能 | マイリスティング | `/my-listings`（編集・物理削除） |
| 機能 | 通報 | ログイン不要・50字以内・完了画面あり |
| 機能 | アカウント停止 | Admin が実施、復元不可 |
| 機能 | 削除方針 | 全て物理削除 |
| 監査 | 保持項目 | created_at/by, updated_at/by |
| ジャンル | 数 | 11（バー・飲食店/ハッテンバ/マッサージ・売り専/公式動画配信・ギャラリー/個人サイト/団体・相談先/出会い/女装・ニューハーフ/ファッション・美容/マニア系/その他） |
| ジャンル | カテゴリ定義済み | 全11ジャンル（Section 23.2 参照） |
| ジャンル | カテゴリ0件時UI | カテゴリセクション非表示 |
| サービス提供者の年代 | 対象 | マッサージ・売り専のみ（20代/30代/40代/50代/60代〜、複数選択可） |
| サービス提供者の年代 | 登録画面レイアウト | カテゴリブロックの右側 |
| サービス提供者の年代 | 一覧画面レイアウト | カテゴリ絞り込みの下 |
| サービス提供地域 | 対象 | マッサージ・売り専のみ |
| サービス提供地域 | 選択肢 | 関東/東京23区/東京23区外/関西/東海/北海道/東北/中部/中国/四国/九州/沖縄/全国対応 |
| 管理画面 Phase 2 | 範囲 | /admin/categories + /admin/listings（全件CRUD+監査） |
| 管理画面 Phase 3 | 範囲 | /admin/reports + /admin/users |

---

## 変更履歴

| バージョン | 日付 | 内容 |
|---|---|---|
| 1.0 | 2026-04-05 | 初版（Section 1〜14） |
| 1.1 | 2026-04-07 | Section 15 追加（11ジャンル・サイドバー再設計） |
| 1.2 | 2026-04-07 | Section 16 追加（フレンドリー度廃止・検索簡素化・ログイン導線） |
| 1.3 | 2026-04-08 | Section 17〜22 追加・付録 A/B 追加・仕様確定完了 |
| 1.4 | 2026-04-08 | Section 24 追加（ロゴ・ヘッダー再構成・ダッシュボード構成変更） |
| 1.5 | 2026-04-10 | Section 25 追加（マイリスティング画面仕様 — 一覧/編集/削除/ページング） |
| 1.6 | 2026-04-11 | Section 25 更新（削除モーダルボタン構成確定、status非表示、RLS DELETEポリシー確認） |
| 1.7 | 2026-04-12 | 仕様書全体を最新実装に同期（DB変更・ソート7種・クリックカウント・所在地2階層ナビ・モバイルヘッダー反映） |

---

## 23. 全ジャンル・カテゴリ一覧

全11ジャンル分のカテゴリ定義。DBシード投入済み。

### 23.2 カテゴリ一覧（全ジャンル）

| # | ジャンル | スラッグ | カテゴリ |
|---|---|---|---|
| 1 | バー・飲食店 | `bar-restaurant` | ゲイバー / レズバー / ミックスバー / 観光バー / 飲食 / 女性入店可 |
| 2 | ハッテンバ | `hattenba` | ビデオボックス / サウナ / 宿泊 |
| 3 | マッサージ・売り専 | `massage-urisen` | 整体 / オイルマッサージ / タイ古式マッサージ / ニューハーフマッサージ / ゲイマッサージ / 売り専 |
| 4 | 公式動画配信・ギャラリー | `video-gallery` | 日本 / 海外 / アジア / サブスク・PPV / ショップ |
| 5 | 個人サイト | `personal-site` | ブログ / 体験記 / ギャラリー |
| 6 | 団体・相談先 | `org-consult` | NPO / 行政 / サークル / 医療機関 |
| 7 | 出会い | `matching` | マッチングアプリ / サービス / 掲示板 |
| 8 | 女装・ニューハーフ | `crossdress-newhalf` | ドラッグ / ショップ / サロン / ショーパブ |
| 9 | ファッション・美容 | `fashion-beauty` | ヘアサロン / メイク / エステ / 脱毛 / タンニング / フィットネス / 医療機関 / ショップ |
| 10 | マニア系 | `mania` | SM / 露出 / デブ専 / フケ専 / 緊縛 / ゼンタイ / 競パン / 褌 / ブリーフ / ユニフォーム |
| 11 | その他 | `other` | 占い / 出版 / 便利サイト / デッサン |

### 23.3 注意事項

- `categories.slug` はジャンル内で一意（複合ユニーク制約 `UNIQUE (genre_id, slug)`）
- カテゴリの並び順は上記の記載順（`sort_order` カラムで制御）
- 「出会い」ジャンルはスラッグ `matching` を維持（URL互換性のため）

### 23.4 シード SQL

```sql
-- genres
INSERT INTO genres (slug, name, sort_order) VALUES
  ('bar-restaurant',     'バー・飲食店',         1),
  ('hattenba',           'ハッテンバ',           2),
  ('massage-urisen',     'マッサージ・売り専',   3),
  ('video-gallery',      '公式動画配信・ギャラリー', 4),
  ('personal-site',      '個人サイト',           5),
  ('org-consult',        '団体・相談先',         6),
  ('matching',            '出会い',              7),
  ('crossdress-newhalf', '女装・ニューハーフ',   8),
  ('fashion-beauty',     'ファッション・美容',   9),
  ('mania',              'マニア系',            10),
  ('other',              'その他',              11);

-- categories（ジャンル別、スラッグは英数字）
-- bar-restaurant
INSERT INTO categories (genre_id, slug, name) SELECT id, 'gay-bar',      'ゲイバー'       FROM genres WHERE slug='bar-restaurant';
INSERT INTO categories (genre_id, slug, name) SELECT id, 'lesbian-bar',  'レズバー'       FROM genres WHERE slug='bar-restaurant';
INSERT INTO categories (genre_id, slug, name) SELECT id, 'mixed-bar',    'ミックスバー'   FROM genres WHERE slug='bar-restaurant';
INSERT INTO categories (genre_id, slug, name) SELECT id, 'tourist-bar',  '観光バー'       FROM genres WHERE slug='bar-restaurant';
INSERT INTO categories (genre_id, slug, name) SELECT id, 'dining',       '飲食'           FROM genres WHERE slug='bar-restaurant';
INSERT INTO categories (genre_id, slug, name) SELECT id, 'women-ok',     '女性入店可'     FROM genres WHERE slug='bar-restaurant';
-- hattenba
INSERT INTO categories (genre_id, slug, name) SELECT id, 'video-box',    'ビデオボックス' FROM genres WHERE slug='hattenba';
INSERT INTO categories (genre_id, slug, name) SELECT id, 'sauna',        'サウナ'         FROM genres WHERE slug='hattenba';
INSERT INTO categories (genre_id, slug, name) SELECT id, 'lodging',      '宿泊'           FROM genres WHERE slug='hattenba';
-- massage-urisen
INSERT INTO categories (genre_id, slug, name) SELECT id, 'seitai',           '整体'                 FROM genres WHERE slug='massage-urisen';
INSERT INTO categories (genre_id, slug, name) SELECT id, 'oil',              'オイルマッサージ'     FROM genres WHERE slug='massage-urisen';
INSERT INTO categories (genre_id, slug, name) SELECT id, 'thai',             'タイ古式マッサージ'   FROM genres WHERE slug='massage-urisen';
INSERT INTO categories (genre_id, slug, name) SELECT id, 'newhalf',          'ニューハーフマッサージ' FROM genres WHERE slug='massage-urisen';
INSERT INTO categories (genre_id, slug, name) SELECT id, 'gay-massage',      'ゲイマッサージ'       FROM genres WHERE slug='massage-urisen';
INSERT INTO categories (genre_id, slug, name) SELECT id, 'urisen',           '売り専'               FROM genres WHERE slug='massage-urisen';
-- video-gallery
INSERT INTO categories (genre_id, slug, name) SELECT id, 'japan',  '日本'   FROM genres WHERE slug='video-gallery';
INSERT INTO categories (genre_id, slug, name) SELECT id, 'world',  '海外'   FROM genres WHERE slug='video-gallery';
INSERT INTO categories (genre_id, slug, name) SELECT id, 'asia',   'アジア' FROM genres WHERE slug='video-gallery';
-- personal-site
INSERT INTO categories (genre_id, slug, name) SELECT id, 'blog',       'ブログ'   FROM genres WHERE slug='personal-site';
INSERT INTO categories (genre_id, slug, name) SELECT id, 'experience', '体験記'   FROM genres WHERE slug='personal-site';
INSERT INTO categories (genre_id, slug, name) SELECT id, 'gallery',    'ギャラリー' FROM genres WHERE slug='personal-site';
-- org-consult
INSERT INTO categories (genre_id, slug, name) SELECT id, 'npo',        'NPO'     FROM genres WHERE slug='org-consult';
INSERT INTO categories (genre_id, slug, name) SELECT id, 'government', '行政'    FROM genres WHERE slug='org-consult';
INSERT INTO categories (genre_id, slug, name) SELECT id, 'circle',     'サークル' FROM genres WHERE slug='org-consult';
-- matching (出会い)
INSERT INTO categories (genre_id, slug, name) SELECT id, 'app',     'マッチングアプリ' FROM genres WHERE slug='matching';
INSERT INTO categories (genre_id, slug, name) SELECT id, 'service', 'サービス'         FROM genres WHERE slug='matching';
INSERT INTO categories (genre_id, slug, name) SELECT id, 'board',   '掲示板'           FROM genres WHERE slug='matching';
-- crossdress-newhalf
INSERT INTO categories (genre_id, slug, name) SELECT id, 'drag',      'ドラッグ'     FROM genres WHERE slug='crossdress-newhalf';
INSERT INTO categories (genre_id, slug, name) SELECT id, 'shop',      'ショップ'     FROM genres WHERE slug='crossdress-newhalf';
INSERT INTO categories (genre_id, slug, name) SELECT id, 'salon',     'サロン'       FROM genres WHERE slug='crossdress-newhalf';
INSERT INTO categories (genre_id, slug, name) SELECT id, 'show-pub',  'ショーパブ'   FROM genres WHERE slug='crossdress-newhalf';
-- fashion-beauty
INSERT INTO categories (genre_id, slug, name) SELECT id, 'hair',     'ヘアサロン' FROM genres WHERE slug='fashion-beauty';
INSERT INTO categories (genre_id, slug, name) SELECT id, 'makeup',   'メイク'     FROM genres WHERE slug='fashion-beauty';
INSERT INTO categories (genre_id, slug, name) SELECT id, 'esthetic', 'エステ'     FROM genres WHERE slug='fashion-beauty';
INSERT INTO categories (genre_id, slug, name) SELECT id, 'hair-removal', '脱毛'   FROM genres WHERE slug='fashion-beauty';
INSERT INTO categories (genre_id, slug, name) SELECT id, 'tanning',  'タンニング' FROM genres WHERE slug='fashion-beauty';
INSERT INTO categories (genre_id, slug, name) SELECT id, 'fitness',  'フィットネス' FROM genres WHERE slug='fashion-beauty';
INSERT INTO categories (genre_id, slug, name) SELECT id, 'medical',  '医療関係'   FROM genres WHERE slug='fashion-beauty';
-- mania
INSERT INTO categories (genre_id, slug, name) SELECT id, 'sm',       'SM'       FROM genres WHERE slug='mania';
INSERT INTO categories (genre_id, slug, name) SELECT id, 'exposure', '露出'     FROM genres WHERE slug='mania';
INSERT INTO categories (genre_id, slug, name) SELECT id, 'chubby',   'デブ専'   FROM genres WHERE slug='mania';
INSERT INTO categories (genre_id, slug, name) SELECT id, 'mature',   'フケ専'   FROM genres WHERE slug='mania';
INSERT INTO categories (genre_id, slug, name) SELECT id, 'bondage',  '緊縛'     FROM genres WHERE slug='mania';
INSERT INTO categories (genre_id, slug, name) SELECT id, 'zentai',   'ゼンタイ' FROM genres WHERE slug='mania';
-- other
INSERT INTO categories (genre_id, slug, name) SELECT id, 'fortune',     '占い'       FROM genres WHERE slug='other';
INSERT INTO categories (genre_id, slug, name) SELECT id, 'publishing',  '出版'       FROM genres WHERE slug='other';
INSERT INTO categories (genre_id, slug, name) SELECT id, 'useful-site', '便利サイト' FROM genres WHERE slug='other';
```


---

## 24. ヘッダー再構成・ダッシュボード構成変更（ロゴ追加）

### 24.1 ロゴ配置

- **ロゴ画像**: `app/public/images/` 配下に配置（例: `app/public/images/logo.png`）
- サイバーパンク調「sind3ad 300knarks」ロゴ画像を使用
- ヘッダー左側に表示（`next/image` で最適化、クリックで `/` へ遷移）
- ロゴ右横にテキスト「**sindbadbookmarks revival**」を並置（白文字、現状のフォント）

### 24.2 ヘッダー構成

左から順に:

1. **ハンバーガーメニューアイコン**（☰）
   - 押下で左サイドバーを表示/非表示トグル
   - デフォルト状態は **閉じた状態**
2. **ロゴ画像**（24.1 のロゴ）
3. **サイトタイトル**「sindbadbookmarks revival」（テキスト、白文字）
4. （中央余白）
5. **「情報を登録」ボタン**（右端）

#### モバイル表示（sm: 未満）
- ロゴ画像は **非表示**（`hidden sm:block`）
- タイトルは3行表示: 「sindbad」「bookmarks」「revival」
- デスクトップでは1行表示: 「sindbadbookmarks revival」

### 24.3 サイドバー表示トグル

- ハンバーガー押下で `開く/閉じる` を切り替え
- 状態は client-side（useState）で管理、リロードでリセット
- サイドバーが閉じているときはメイン領域がフル幅に広がる
- Phase 2 では PC 前提、オーバーレイではなく **レイアウトシフト**（サイドバー領域ごと消える）

### 24.4 ダッシュボード（トップページ）の構成変更

Section 18.5 を以下で上書き。

トップページ `/` の構成:

- **11ジャンルをカード/セクションで縦または横に並べる**
- 各ジャンルセクション内に、そのジャンルの **カテゴリ名 + (登録件数)** をぶら下げて表示
  - 例: `バー・飲食店`
    - `ゲイバー (12)`
    - `ミックスバー (5)`
    - `観光バー (2)`
- **件数0のカテゴリは非表示**（カウントベースで自動フィルタ）
- カテゴリ名クリック →「**そのジャンルの一覧ページ**（右メイン画面）」を開き、**選択されたカテゴリが既にチェックされた状態**で該当情報を絞り込み表示
  - URL 例: `/genres/bar-restaurant?category=gay-bar`
- ジャンル名自体のクリック → そのジャンルの一覧ページ（カテゴリ絞り込みなし）

### 24.5 削除される要素

- Section 18.5 の「新着リスティング10件」→ **廃止**（ジャンル/カテゴリ型の導線に統一）
- 「ジャンル別件数カード」も 24.4 の構成に置換

### 24.6 影響ファイル（実装時）

| 区分 | パス | 説明 |
|---|---|---|
| 新規 | `app/public/images/logo.png` | ロゴ画像（ユーザー配置済み） |
| 変更 | `app/src/components/header.tsx` | ハンバーガー・ロゴ・タイトル・情報登録ボタンに再構成 |
| 変更 | `app/src/components/sidebar.tsx` | 開閉トグル対応（親から props で制御） |
| 変更 | `app/src/components/site-chrome.tsx` | サイドバー開閉状態を管理 |
| 変更 | `app/src/app/page.tsx` | 11ジャンル×カテゴリ件数ツリー表示 |
| 新規 | RPC `get_category_counts_all()` | 全ジャンル×カテゴリの件数を1クエリで返す |

### 24.7 未決事項（全て確定済み ✅）

| # | 項目 | 決定 |
|---|---|---|
| 1 | ✅ サイドバー初期表示状態 | **閉じた状態**でスタート（実装済み） |
| 2 | ✅ ダッシュボードのジャンル並び | **3列グリッド**（PC想定、11ジャンルを3列で配置） |
| 3 | ✅ ロゴ画像ファイル名 | **`sbbm_logo.jpg`**（実装済み） |
| 4 | ✅ ロゴクリック時の遷移先 | `/`（トップ）（実装済み） |
| 5 | ✅ 「その他」ジャンルのダッシュボード表示 | **カテゴリ0件時は非表示** |
| 6 | ✅ ハンバーガーメニューの位置 | ロゴの左、ヘッダー最左端（実装済み） |

---

## 25. マイリスティング画面仕様（`/my-listings`）

### 25.1 概要

ログインユーザーが自分の登録した情報（リスティング）を一覧表示し、編集・削除できるページ。
サイドバーの「マイリスティング」リンクから遷移。未ログイン時はログイン案内を表示。

### 25.2 画面構成

```
┌──────────────────────────────────────────────────────────┐
│ マイリスティング                        ［新規登録ボタン］ │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ ┌──────────────────────────────────────────────┬───────┐ │
│ │ 名称（リンク→website_url）                   │ 編集  │ │
│ │ 説明文                                       │       │ │
│ │ 登録日: 2026-04-10                            │       │ │
│ └──────────────────────────────────────────────┴───────┘ │
│ ┌──────────────────────────────────────────────┬───────┐ │
│ │ 名称                                         │ 編集  │ │
│ │ ...                                          │       │ │
│ └──────────────────────────────────────────────┴───────┘ │
│                                                          │
│                    < 1  2  3 >                           │
└──────────────────────────────────────────────────────────┘
```

### 25.3 一覧表示仕様

| 項目 | 仕様 |
|---|---|
| 表示対象 | `listings.user_id = ログインユーザーID` |
| 並び順 | **登録日時（`created_at`）の新しい順**（降順） |
| 1ページあたり件数 | **最大20件** |
| ページング | 20件を超える場合にページネーション表示 |

### 25.4 各行の表示項目

左から:
1. **名称**（`title`）— `website_url` へのリンク（新しいタブで開く）
2. **説明文**（`description`）
3. **登録日**（`created_at`）
4. ~~**状態**（`status`）~~ → **非表示**（現時点では全件 published のため不要）

右端:
5. **「編集」ボタン** — クリックで `/listings/[id]/edit` に遷移

### 25.5 編集画面（`/listings/[id]/edit`）

既存の ListingForm を `mode="edit"` で再利用。以下の機能を持つ:

| 機能 | 仕様 |
|---|---|
| 情報変更 | フォームの各項目を変更して「更新する」ボタンで保存。保存後 `/my-listings` に遷移 |
| 削除 | フォーム下部に **「この情報を削除する」ボタン**（赤文字、目立たないデザイン）を配置 |

#### 25.5.1 削除機能

- 「この情報を削除する」ボタンを押すと **確認モーダル**を表示
- 確認メッセージ: 「この登録情報を削除しますか？この操作は取り消せません。」
- モーダルボタン構成:
  - **「削除する」ボタン**（赤系 `bg-red-600 text-white`）
  - **「キャンセル」ボタン**（グレー系 `border-zinc-300 text-zinc-700`）
- 確認後、以下を実行:
  1. `listings` の該当レコードを削除（`listing_categories` は FK `ON DELETE CASCADE` で自動削除）
- 削除成功後、`/my-listings` に遷移
- 削除失敗時はエラーメッセージを表示
- **オーナー本人のみ削除可能** — RLS ポリシー `listings_delete_own` で保証（`user_id = auth.uid()` OR admin）

### 25.6 未ログイン時

- ログイン案内を表示（現在の実装通り）
- 「ログイン」ボタン + **「アカウント新規作成」ボタン**（§16.5 #2 準拠）

### 25.7 影響ファイル（実装時）

| 区分 | パス | 説明 |
|---|---|---|
| 変更 | `app/src/app/my-listings/page.tsx` | 一覧にページング追加、各行に編集ボタン追加 |
| 変更 | `app/src/app/listings/[id]/edit/page.tsx` | 削除ボタン追加 |
| 変更 | `app/src/app/listings/new/ListingForm.tsx` | 削除機能（mode="edit"時のみ表示） |
| 新規 | `app/src/components/listings/Pagination.tsx` | ページネーションコンポーネント（§19.2 と共通化可能） |

### 25.8 RLS ポリシー（確認済み ✅）

`listings` テーブルに DELETE ポリシーが本番適用済み:

```sql
-- ポリシー名: listings_delete_own
-- 条件: オーナー本人 OR 管理者
(user_id = auth.uid()) OR EXISTS (
  SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
)
```

`listing_categories` は FK `ON DELETE CASCADE` により `listings` 削除時に自動削除。
マイグレーション記録: `supabase/migrations/00002_add_listings_delete_policy.sql`

### 25.9 確定事項一覧 ✅

| # | 項目 | 決定 |
|---|---|---|
| 1 | ✅ 削除の確認UI | **モーダルダイアログ**（`window.confirm()` ではなく専用モーダルコンポーネント） |
| 2 | ✅ 論理削除か物理削除か | **物理削除**（`DELETE FROM listings WHERE id = ...`） |
| 3 | ✅ ページネーションUIの共通化 | **ジャンル一覧ページ（§19.2）と共通コンポーネント**（`app/src/components/listings/Pagination.tsx`） |
| 4 | ✅ 削除モーダルのボタン構成 | **「削除する」（赤系）+「キャンセル」（グレー系）** |
| 5 | ✅ 一覧の status 表示 | **非表示**（現時点で全件 published のため不要） |
| 6 | ✅ RLS DELETE ポリシー | **本番適用済み**（`listings_delete_own`: オーナー + admin） |
