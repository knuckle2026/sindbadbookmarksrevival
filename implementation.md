# sindbadbookmarks 実装仕様書

**バージョン:** 1.5
**最終更新:** 2026-04-08
**ブランチ:** `feature/age-gate`（masterへのマージ待ち）
**ステータス:** 仕様確定完了 → 実装着手待ち

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
- ジャンルを縦に並べ、クリックで中分類を展開（accordion）
- 初期状態: 「情報タイプ」のみ開いている

**ジャンル構成（要件定義書 4章準拠）:**

| ジャンル | 中分類（クリック先） |
|---|---|
| 情報タイプ | 店舗 / 団体・NPO / メディア |
| 目的別 | 交流・出会い / 支援・相談 / ナイトライフ / 文化・アート / 情報・メディア / 暮らし・サービス / 権利・アドボカシー |
| 業態別 | 飲食 / 宿泊 / 美容・ファッション / 医療・メンタルヘルス / 法律・士業 / IT・テクノロジー / エンターテインメント / 教育・研究 / その他 |
| フレンドリー度 | 専門 (Dedicated) / フレンドリー (Friendly) / アライ (Ally) |

中分類クリック → `/listings?type=xxx` or `/listings?category=slug` or `/listings?friendliness=xxx` へ遷移

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

| セクション | データ取得 |
|---|---|
| 掲載情報 総数 | `rpc('get_dashboard_counts')` |
| 情報タイプ別件数（店舗/団体/メディア） | 同上 |
| 目的別カテゴリ件数 | `rpc('get_dashboard_category_counts')` |
| 業態別カテゴリ件数 | 同上 |
| フレンドリー度別件数 | `rpc('get_dashboard_friendliness_counts')` |

各カードは `/listings?type=xxx` or `/listings?category=slug` へのリンク

---

## 8. 登録情報一覧（`/listings`）

**Server Component** + クライアント検索フォーム（`SearchFilters.tsx`）

### URLパラメータ

| パラメータ | 型 | 説明 |
|---|---|---|
| `q` | string | キーワード検索（タイトル部分一致） |
| `type` | shop / organization / media | 情報タイプフィルタ |
| `category` | slug | カテゴリスラッグフィルタ |
| `friendliness` | Dedicated / Friendly / Ally | フレンドリー度フィルタ |

### TypeScript 注意

Supabase のリレーション join クエリで型推論が `never` になる既知問題 → `// @ts-nocheck` で回避中

---

## 9. 情報登録（`/listings/new`）

- **未認証** → `/login` へリダイレクト（Server Component で確認）
- **フォーム:** `ListingForm.tsx`（Client Component）

### 入力項目

| フィールド | 型 | 備考 |
|---|---|---|
| タイトル | text | 必須 |
| 情報タイプ | shop / organization / media | 必須 |
| 説明 | textarea | 任意 |
| WebサイトURL | url | 任意 |
| 住所 | text | 任意 |
| フレンドリー度 | Dedicated / Friendly / Ally / null | 任意 |
| 目的別カテゴリ | 複数選択（toggle buttons） | 任意 |
| 業態別カテゴリ | 複数選択（toggle buttons） | 任意 |

### INSERT フロー

1. `listings` テーブルに INSERT → `listing.id` を取得
2. 選択カテゴリを `listing_categories` テーブルに INSERT

---

## 10. 詳細ページ（`/listings/[id]`）

**Server Component**（`// @ts-nocheck`）

- listing と categories を別クエリで取得（join型推論問題回避）
- 登録者本人のみ「編集」ボタン表示（未実装、ボタンのみ表示）

---

## 11. DBスキーマ（実装済み）

### 主要テーブル

```
profiles          - ユーザープロフィール（id, display_name, role, is_suspended）
listings          - 掲載情報（id, user_id, type, title, description, address, website_url, friendliness, status）
categories        - カテゴリマスタ（id, group_type[purpose|industry], name, slug, sort_order）
listing_categories - 多対多リレーション（listing_id, category_id）
reports           - 通報（id, listing_id, reason, status）
```

### RPC関数（ダッシュボード用）

```
get_dashboard_counts()           → 総数・タイプ別件数
get_dashboard_category_counts()  → カテゴリ別件数
get_dashboard_friendliness_counts() → フレンドリー度別件数
```

---

## 12. ファビコン

- `src/app/icon.png`（192×192）- PWA / ブラウザタブ
- `src/app/apple-icon.png`（180×180）- iOS ホーム画面
- 元画像: `images/hRRVNL4n_400x400.jpeg`（キャラクター画像）

---

## 13. 既知の課題・TODO

| # | 内容 | 優先度 |
|---|---|---|
| 1 | Supabase join クエリの TypeScript 型推論が `never` → `@ts-nocheck` で暫定対応 | 中 |
| 2 | ~~`/listings/[id]/edit` 編集ページ未実装~~ ✅ 実装済み | ~~高~~ |
| 3 | 検索: キーワード全文検索未実装（タイトル部分一致のみ） | 中 |
| 4 | ページネーション未実装 | 中 |
| 5 | 画像アップロード未実装 | 中 |
| 6 | 管理者パネル（`/admin`）未実装 | 低 |
| 7 | プロフィール設定ページ（`/profile`）未実装 | 低 |
| 8 | 地域フィルタ未実装 | 低 |

---

## 14. ブランチ・デプロイ状態

| ブランチ | 状態 | 説明 |
|---|---|---|
| `master` | 本番デプロイ済み（READY） | age-gate・新レイアウト**未適用** |
| `feature/age-gate` | プレビューデプロイ済み（READY） | 年齢確認・新レイアウト実装済み |

→ `feature/age-gate` を master にマージすると本番に適用される

---

## 15. 追加要件（未実装）— 左サイドバー / ジャンル一覧画面の刷新

> ステータス: **要件定義のみ。実装未着手。**
> 既存の左サイドバー（情報タイプ / 目的別 / 業態別 / フレンドリー度の4ジャンル＋アコーディオン）を、以下の11ジャンル構成に置き換える。

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
| 7 | マッチング | `matching` |
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
│ ヘッダー（赤 #B21000、白文字）                       │  ← グローバルヘッダー
│  [sindbadbookmarks]  バー・飲食店                   │  ← 右側にジャンル名を大きく表示
├────────────────────────────────────────────────────┤
│ カテゴリ絞り込み（チェックボックス・横並び）            │  ← ヘッダー直下、複数選択可
│  □ ゲイバー  □ レズバー  □ ミックスバー              │
│  □ 観光バー  □ 食事     □ 軽食                    │
├────────────────────────────────────────────────────┤
│ 一覧表示エリア                                       │
│  ・カード or リスト形式で登録情報を表示                │
│  ・件数表示／ソート                                  │
└────────────────────────────────────────────────────┘
```

#### ヘッダー内ジャンル名表示

- 既存ヘッダー右側（ロゴの右隣／現在の "ページタイトル" 表示位置）に **選択中ジャンル名を表示**
- 例: `sindbadbookmarks ｜ バー・飲食店`
- ジャンル未選択時（トップやその他ページ）は現在のページタイトルを表示

#### ヘッダー下のカテゴリチェックボックス絞り込み

- ヘッダー直下に **そのジャンル専用のカテゴリチェックボックス** を横並びで表示
- カテゴリは **複数選択可能**（OR検索 or AND検索は要決定）
- カテゴリは各ジャンルごとに紐付く（後述 15.5.1 参照）
- チェック変更時に一覧をリアルタイム更新（URLパラメータ同期）
- 「中分類」「サブカテゴリ」概念は **使用しない**。1ジャンル＝1階層のカテゴリ群のみ。

### 15.4 「バー・飲食店」「マッサージ・売り専」専用：都道府県別件数表示

該当ジャンル選択時、一覧表示エリアの上部または横に **都道府県リストと件数** を表示する。

| 表示位置 | 内容 |
|---|---|
| 一覧の住所欄 | リスティングに紐づく都道府県名の右横に **`(該当登録件数)`** を表示 |
| 都道府県をクリック | その都道府県でリスティングを絞り込み（URL: `?prefecture=東京都` 等） |

#### 表示例

```
東京都 (42)    神奈川県 (18)    大阪府 (35)    愛知県 (12)
新潟県 (3)     福岡県 (9)       沖縄県 (5)     ...
```

- 件数は該当ジャンル × 該当都道府県の公開済みリスティング数
- 件数 0 件の都道府県は非表示
- 多い順 or 北から南順（要決定）

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
| マッチング | matching | 7 |
| 女装・ニューハーフ | crossdress-newhalf | 8 |
| ファッション・美容 | fashion-beauty | 9 |
| マニア系 | mania | 10 |
| その他 | other | 11 |

##### 既存 `categories` テーブルの拡張

既存の `categories` テーブルに **ジャンルへの外部キー** を追加し、「どのジャンルに属するカテゴリか」を表現する。

```sql
ALTER TABLE categories ADD COLUMN genre_id uuid REFERENCES genres(id) ON DELETE CASCADE;
```

- 既存の `group_type` カラム（`purpose` / `industry`）は **非推奨化**（マイグレーション対象）
- `genre_id` が NOT NULL のレコードのみ新仕様で使用
- `name` / `slug` / `sort_order` はそのまま利用

##### 初期投入カテゴリ（確定分のみ）

**バー・飲食店（bar-restaurant）配下:**

| name | slug | sort_order |
|---|---|---|
| ゲイバー | gay-bar | 1 |
| レズバー | lesbian-bar | 2 |
| ミックスバー | mixed-bar | 3 |
| 観光バー | tourist-bar | 4 |
| 食事 | meal | 5 |
| 軽食 | light-meal | 6 |

**マッサージ・売り専（massage-urisen）配下:**

| name | slug | sort_order |
|---|---|---|
| 整体 | seitai | 1 |
| オイルマッサージ | oil-massage | 2 |
| ニューハーフマッサージ | newhalf-massage | 3 |
| ゲイマッサージ | gay-massage | 4 |
| タイ古式マッサージ | thai-massage | 5 |
| 売り専 | urisen | 6 |

**その他9ジャンル配下:**

→ **未定**。Phase 実装時または管理画面リリース後に管理者が追加する。

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

#### 15.5.4 件数取得用 RPC（新規 or View）

サイドバーの件数表示用に集計クエリが必要：

```sql
-- ジャンルごとの公開済みリスティング件数
get_genre_counts() RETURNS TABLE (
  genre_id uuid,
  genre_slug text,
  genre_name text,
  listing_count bigint
)

-- 指定ジャンル × 都道府県の件数（バー・飲食店／マッサージ・売り専用）
get_prefecture_counts_by_genre(genre_slug text) RETURNS TABLE (
  prefecture text,
  listing_count bigint
)
```

### 15.6 ルーティング（URL設計）

| URL | 説明 |
|---|---|
| `/listings?genre=bar-restaurant` | バー・飲食店一覧（カテゴリ絞り込みなし） |
| `/listings?genre=bar-restaurant&category=gay-bar,mixed-bar` | バー・飲食店 × ゲイバー＋ミックスバー（複数カテゴリ） |
| `/listings?genre=bar-restaurant&prefecture=東京都` | バー・飲食店 × 東京都 |
| `/listings?genre=bar-restaurant&prefecture=東京都&category=gay-bar` | 複合絞り込み |
| `/listings?genre=massage-urisen&category=urisen,gay-massage` | マッサージ・売り専 × 売り専＋ゲイマッサージ |

- `category` パラメータは **カンマ区切りで複数指定可能**
- カテゴリのスラッグはジャンル内でユニーク（DB全体ではジャンルをまたいで重複可）

### 15.7 影響範囲

以下のファイルを変更／追加予定（実装フェーズ時）:

| 種別 | パス |
|---|---|
| 変更 | `app/src/components/sidebar.tsx` — 11ジャンル＋件数表示、アコーディオン廃止 |
| 変更 | `app/src/components/header.tsx` — 選択ジャンル名表示の連動 |
| 変更 | `app/src/app/listings/page.tsx` — `genre` / `category[]` / `prefecture` パラメータ対応 |
| 新規 | `app/src/app/listings/CategoryCheckboxes.tsx` — ジャンル別カテゴリのチェックボックス絞り込み |
| 新規 | `app/src/app/listings/PrefectureCounts.tsx` — 都道府県別件数表示（バー・マッサージ系） |
| 新規 | `app/src/app/admin/categories/page.tsx` — 管理画面：カテゴリ追加・編集・削除 |
| 変更 | `app/src/app/listings/new/ListingForm.tsx` — ジャンル選択必須化＋ジャンル別カテゴリ表示 |
| 変更 | `app/src/lib/supabase/types.ts` — `Genre` 型新規、`Category` に `genre_id` |
| 新規 | `supabase/migrations/xxx_add_genres_and_categories.sql` — `genres` テーブル作成、`categories.genre_id` 追加、`listings.genre_id`／`prefecture` 追加、RPC、初期データ投入 |

### 15.8 未決事項（確定済みは ✅ マーク）

| # | 項目 | 決定 |
|---|---|---|
| 1 | ✅ 全11ジャンルのカテゴリ定義 | **確定**: Section 23.2 参照 |
| 2 | ✅ 都道府県リストの並び順 | **北から南順** |
| 3 | 既存の `categories.group_type`（purpose/industry）の扱い | 廃止 / 併存 / マイグレーション |
| 4 | 既存リスティングの `prefecture` 欠損データの扱い | バッチ補完 or 段階的に手動入力 |
| 5 | ✅ カテゴリチェックの検索方式 | **OR検索**。ただしマッサージ・売り専の「ニューハーフマッサージ」は特殊扱い（後述 §15.8.1） |
| 6 | ✅ カテゴリ未選択時の挙動 | **全件表示**（ジャンルのみで絞り込み） |
| 7 | ✅ 件数 0 ジャンルの表示有無 | **0件でも表示、クリック可能**（ジャンル一覧画面を表示） |
| 8 | 管理画面 `/admin/categories` の権限制御 | RLS or Service Role Key |
| 9 | リスティング登録時のジャンル変更時、カテゴリの扱い | 旧カテゴリを自動削除 or 警告のみ |

#### 15.8.1 マッサージ・売り専のニューハーフマッサージ除外ロジック

マッサージ・売り専ジャンルのカテゴリ絞り込みには **特殊ルール** がある:

- **基本**: カテゴリ絞り込みは OR 検索（いずれかに該当すれば表示）
- **例外**: 「ニューハーフマッサージ」カテゴリを **選択していない** 場合、ニューハーフマッサージに該当するリスティングは **検索結果から除外される（AND NOT 条件）**
- つまり、ニューハーフマッサージの結果を見るには、ユーザーが明示的に「ニューハーフマッサージ」チェックボックスをONにする必要がある
- 何もカテゴリを選択していない状態（全件表示）でも、ニューハーフマッサージは除外される
- ニューハーフマッサージ **のみ** を選択した場合は、ニューハーフマッサージのリスティングだけが表示される

**実装方針**: クエリ側で `category != 'newhalf'` 条件をデフォルトで付与し、「ニューハーフマッサージ」チェック時のみ解除する

---

## 16. 仕様変更（未実装）— フレンドリー度廃止 / トップ検索簡素化 / 未ログイン時の登録導線

> ステータス: **要件定義のみ。実装未着手。**
> 15章の追加要件を受けた調整。

### 16.1 「フレンドリー度（Friendliness）」分類の廃止

**変更内容:**

- **分類軸としての「フレンドリー度」を完全廃止**
- サイドバー・ヘッダー下・トップ検索いずれからも削除
- リスティング登録フォームの「フレンドリー度」入力欄を削除
- DBカラム `listings.friendliness` は **非推奨**（当面は残置、将来マイグレーションで削除可）
- RPC `get_dashboard_friendliness_counts()` の呼び出し停止
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

### 16.5 未決事項（16章固有）

| # | 項目 | 備考 |
|---|---|---|
| 1 | `listings.friendliness` カラムの最終処理 | いつマイグレーションで DROP するか |
| 2 | ログイン案内画面で「新規登録」ボタンを出すか | 15分以内にアカウント作成できるなら出す |
| 3 | `/login?redirect=...` の URLパラメータ仕様 | オープンリダイレクト脆弱性対策（allowlist チェック） |
| 4 | ダッシュボードの「フレンドリー度別」カード削除後の代替コンテンツ | 何を表示するか（新着リスティング？ジャンル別カード？） |

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
5. **住所・所在地**
   - **都道府県**（必須・セレクト）47都道府県
   - **市区町村**（条件付き）
     - 都道府県が「東京都」の場合のみ **23区セレクト** を表示（必須）
     - それ以外の都道府県では非表示、または自由入力欄に統合
   - **それ以降の住所**（任意・テキスト）番地・建物名など自由入力
   - 保存先:
     - `listings.prefecture`（例: `"tokyo"`）
     - `listings.ward`（新規カラム案、東京23区のみ使用）
     - `listings.address`（番地以降の自由入力）
6. **サービス提供地域（出張エリア）**（条件付き・複数選択可・チェックボックス）
   - **ジャンルが「マッサージ・売り専」の場合のみ表示**
   - 選択肢: **東京23区 / 東京23区外 + 46道府県**（全48エリア、地域グループ別にチェックボックス表示）
   - 保存先: `listings.service_areas`（`text[]` 配列）
   - マッサージ以外のジャンルでは DB に NULL/空配列を保存

### 17.2 削除される項目

以前の仕様にあった以下は **廃止**：

- **目的別カテゴリ**（複数選択可）← 廃止
- **業態別カテゴリ**（複数選択可）← 廃止
- **フレンドリー度**（Section 16.1 で既に廃止済み）

カテゴリは「ジャンルに紐づく単一のカテゴリ群」に統一され、目的別／業態別の二軸は使用しない。

### 17.3 DB スキーマ追加・変更（案）

| テーブル | カラム | 型 | 説明 |
|---|---|---|---|
| `listings` | `genre_id` | `uuid FK genres.id` | 選択ジャンル（必須） |
| `listings` | `prefecture` | `text` | 都道府県コード/スラッグ |
| `listings` | `ward` | `text NULL` | 東京23区の区名（東京都の場合のみ） |
| `listings` | `service_areas` | `text[] NULL` | マッサージ・売り専ジャンル専用 |

既存の `listings.address` は「番地・建物名」の自由入力欄として継続利用。

### 17.4 バリデーションとUX

- ジャンルを変更するとカテゴリチェック状態はリセットする（紐づきが変わるため）
- 都道府県が東京都以外になったら `ward` を自動クリア
- ジャンルがマッサージ・売り専以外になったら `service_areas` を自動クリア
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

### 17.6 未決事項

| # | 項目 | 備考 |
|---|---|---|
| 1 | 東京以外の政令指定都市（大阪市/横浜市 等）も区選択を出すか | 現仕様では東京23区のみ |
| 2 | サービス提供地域の選択肢マスタ化 | 固定配列 vs `service_areas` テーブル化 |
| 3 | 都道府県の保存形式 | スラッグ（`tokyo`）か日本語（`東京都`）か ISO コードか |
| 4 | マッサージ・売り専以外でも将来サービス提供地域が欲しくなった場合の拡張方針 | ジャンル別フラグで有効化 |
| 5 | 同一ジャンル内でカテゴリ未定義の場合の UI | セクションごと非表示 or 「カテゴリなし」注記 |

---

## 18. 実装前 確定事項（2026-04-08 決定）

Section 15〜17 の未決事項および追加論点について、以下のとおり確定。実装はこの決定に従う。

### 18.1 データ形式・スキーマ確定

| # | 項目 | 決定 |
|---|---|---|
| 1 | 都道府県の保存形式 | **スラッグ**（例: `tokyo`, `osaka`, `hokkaido`） |
| 2 | 東京以外の市区町村 | **東京23区のみ特別扱い**。他都道府県は `ward` 未使用、番地以降を `address` 自由入力に統合 |
| 3 | `listings.friendliness` カラム | **即DROP**（本番データ未投入のためマイグレーションで削除） |
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

11ジャンル中、カテゴリ定義済みは「バー・飲食店」「マッサージ・売り専」の2つのみ。残り9ジャンル（ハッテンバ／公式動画・ギャラリー／個人サイト／団体・相談先／マッチング／女装・ニューハーフ／ファッション・美容／マニア系／その他）では：

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

- 一覧上部に **ソート用コンボボックス（select）** を配置
- 選択肢（4種）:
  | value | 表示ラベル | Supabase order |
  |---|---|---|
  | `created_asc` | 登録日（古い順） | `.order('created_at', { ascending: true })` |
  | `created_desc` | 登録日（新しい順） | `.order('created_at', { ascending: false })` |
  | `title_asc` | 名称（昇順） | `.order('title', { ascending: true })` |
  | `title_desc` | 名称（降順） | `.order('title', { ascending: false })` |
- **デフォルト**: `created_desc`（新しい順）
- URL クエリパラメータ: `?sort=created_desc` 形式
- 並び替え操作時は `page=1` にリセット

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

### 19.6 未決事項

| # | 項目 | 備考 |
|---|---|---|
| 1 | ~~説明文の行数制限~~ | **確定: 入力時点で100文字以内必須のため切り詰め不要** |
| 2 | カード内の補助メタ情報 | 都道府県／カテゴリタグ／登録日などの表示有無 |
| 3 | URL未登録時の名称表示 | 黒字にする or #B21000 のままリンク無しにする |
| 4 | ページング最大ページ数 UI | 省略表示（`1 ... 5 6 7 ... 20`）の要否 |

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

### 22.2 バー・飲食店 都道府県リスト 表示方針

- **47都道府県すべて表示**
- 件数0の都道府県も表示するが **クリック不可**（`disabled`、グレーアウト）
- **地域別に折りたたみ**表示:
  - 北海道・東北 / 関東 / 中部 / 関西 / 中国 / 四国 / 九州・沖縄
  - 各地域をアコーディオンで開閉
- 件数は都道府県名の右に `（12）` 形式で表示

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

### 22.8 影響する既存セクション

- Section 15.2 サイドバー: 22.1 の「マイリスティング」リンクを追記
- Section 15.3 ジャンルページ: 22.2 の都道府県折りたたみ仕様を反映
- Section 15.6 URL設計: カテゴリ OR 条件を明記（`?category=a,b,c` は OR）
- Section 3 認証: Google OAuth 追加
- Section 6 レイアウト: ヘッダー右「情報を登録」ボタン追加

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
   - `listings.friendliness` **DROP**
   - `listings.latitude` / `longitude` は残す（NULL許容、フォーム未使用）
   - `profiles.is_disabled boolean default false` 追加
   - `reports.reason` CHECK `char_length(reason) <= 50`、`reporter_user_id` NULL 許容
   - `updated_at` 自動更新トリガー作成
   - FK `ON DELETE CASCADE`（`listing_categories` 等）
2. **シード**: 11ジャンル + バー・飲食店6カテゴリ + マッサージ・売り専6カテゴリ
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
| 表示 | ソート | 登録日昇降 / 名称昇降 |
| 表示 | デフォルトソート | 登録日新しい順 |
| 表示 | 詳細ページ | 不要 |
| 表示 | カテゴリ絞り込み | OR条件 |
| 表示 | 都道府県リスト | 47件全表示・地域別アコーディオン・0件はクリック不可 |
| 表示 | OGP画像 | Phase 2 では無し |
| 機能 | マイリスティング | `/my/listings`（編集・物理削除） |
| 機能 | 通報 | ログイン不要・50字以内・完了画面あり |
| 機能 | アカウント停止 | Admin が実施、復元不可 |
| 機能 | 削除方針 | 全て物理削除 |
| 監査 | 保持項目 | created_at/by, updated_at/by |
| ジャンル | 数 | 11（バー・飲食店/ハッテンバ/マッサージ・売り専/公式動画・ギャラリー/個人サイト/団体・相談先/マッチング/女装・ニューハーフ/ファッション・美容/マニア系/その他） |
| ジャンル | カテゴリ定義済み | バー・飲食店 / マッサージ・売り専 のみ |
| ジャンル | 未定義時UI | カテゴリセクション非表示 |
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
| 1.4 | 2026-04-08 | Section 23 追加（全11ジャンルのカテゴリ確定） |
| 1.5 | 2026-04-08 | Section 24 追加（ロゴ・ヘッダー再構成・ダッシュボード構成変更） |

---

## 23. 各ジャンルのカテゴリ 確定一覧

Section 15/17/18.3 で「カテゴリ定義済みはバー・飲食店とマッサージ・売り専のみ」としていたが、本セクションで **全11ジャンル分のカテゴリを確定**。シード投入対象。

### 23.1 ジャンル名変更

| 旧（Section 15.1） | 新 |
|---|---|
| マッチング | **出会い** |

スラッグは `matching` を維持（URL互換性のため）。表示名のみ「出会い」に変更。

### 23.2 カテゴリ一覧（全ジャンル）

| # | ジャンル | スラッグ | カテゴリ |
|---|---|---|---|
| 1 | バー・飲食店 | `bar-restaurant` | ゲイバー / レズバー / ミックスバー / 観光バー / 飲食 / 女性入店可 |
| 2 | ハッテンバ | `hattenba` | ビデオボックス / サウナ / 宿泊 |
| 3 | マッサージ・売り専 | `massage-urisen` | 整体 / オイルマッサージ / タイ古式マッサージ / ジャップカサイ / 出張 / ストレッチ / カイロプラクティック / ニューハーフマッサージ |
| 4 | 公式動画配信・ギャラリー | `video-gallery` | 日本 / 海外 / アジア |
| 5 | 個人サイト | `personal-site` | ブログ / 体験記 / ギャラリー |
| 6 | 団体・相談先 | `org-consult` | NPO / 行政 |
| 7 | 出会い | `matching` | マッチングアプリ / サービス / 掲示板 |
| 8 | 女装・ニューハーフ | `crossdress-newhalf` | ドラッグ / ショップ / サロン / ショーパブ |
| 9 | ファッション・美容 | `fashion-beauty` | ヘアサロン / メイク / エステ / 脱毛 / タンニング |
| 10 | マニア系 | `mania` | SM / 露出 / デブ専 / フケ専 / 緊縛 / ゼンタイ |
| 11 | その他 | `other` | （未定・管理画面から追加） |

### 23.3 変更点のまとめ

- Section 18.3 の「カテゴリ定義済みは2ジャンルのみ」は解消 → **10ジャンル分をシード投入**（その他のみ未定）
- Section 15.1 の旧ジャンル名「マッチング」→「出会い」に修正（スラッグは維持）
- Section 17.1 の「バー・飲食店」カテゴリ例を以下のとおり更新:
  - 旧: ゲイバー/レズバー/ミックスバー/観光バー/食事/軽食
  - 新: **ゲイバー/レズバー/ミックスバー/観光バー/飲食/女性入店可**
- Section 17.1 の「マッサージ・売り専」カテゴリ例を以下のとおり更新:
  - 旧: 整体/オイルマッサージ/ニューハーフマッサージ/ゲイマッサージ/タイ古式マッサージ/売り専
  - 新: **整体/オイルマッサージ/タイ古式マッサージ/ジャップカサイ/出張/ストレッチ/カイロプラクティック/ニューハーフマッサージ**
- 「団体・相談先」カテゴリを更新:
  - 旧: NPO法人 / ボランティア
  - 新: **NPO / 行政**
- 「その他」ジャンルは 18.3 に従い **カテゴリセクション非表示**（管理画面から追加され次第表示）

> **注意**: DB上の「団体・相談先」カテゴリは旧データ（NPO法人/ボランティア）のまま。マイグレーションで「NPO / 行政」に更新が必要。

### 23.4 シード SQL（案）

```sql
-- genres
INSERT INTO genres (slug, name, sort_order) VALUES
  ('bar-restaurant',     'バー・飲食店',         1),
  ('hattenba',           'ハッテンバ',           2),
  ('massage-urisen',     'マッサージ・売り専',   3),
  ('video-gallery',      '公式動画配信・ギャラリー', 4),
  ('personal-site',      '個人サイト',           5),
  ('org-consult',        '団体・相談先',         6),
  ('matching',           '出会い',               7),
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
INSERT INTO categories (genre_id, slug, name) SELECT id, 'jap-kasai',        'ジャップカサイ'       FROM genres WHERE slug='massage-urisen';
INSERT INTO categories (genre_id, slug, name) SELECT id, 'outcall',          '出張'                 FROM genres WHERE slug='massage-urisen';
INSERT INTO categories (genre_id, slug, name) SELECT id, 'stretch',          'ストレッチ'           FROM genres WHERE slug='massage-urisen';
INSERT INTO categories (genre_id, slug, name) SELECT id, 'chiropractic',     'カイロプラクティック' FROM genres WHERE slug='massage-urisen';
INSERT INTO categories (genre_id, slug, name) SELECT id, 'newhalf',          'ニューハーフマッサージ' FROM genres WHERE slug='massage-urisen';
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
-- mania
INSERT INTO categories (genre_id, slug, name) SELECT id, 'sm',       'SM'       FROM genres WHERE slug='mania';
INSERT INTO categories (genre_id, slug, name) SELECT id, 'exposure', '露出'     FROM genres WHERE slug='mania';
INSERT INTO categories (genre_id, slug, name) SELECT id, 'chubby',   'デブ専'   FROM genres WHERE slug='mania';
INSERT INTO categories (genre_id, slug, name) SELECT id, 'mature',   'フケ専'   FROM genres WHERE slug='mania';
INSERT INTO categories (genre_id, slug, name) SELECT id, 'bondage',  '緊縛'     FROM genres WHERE slug='mania';
INSERT INTO categories (genre_id, slug, name) SELECT id, 'zentai',   'ゼンタイ' FROM genres WHERE slug='mania';
-- other: 未定（シードなし）
```

### 23.5 注意事項

- `categories.slug` はジャンル内で一意（複合ユニーク制約 `UNIQUE (genre_id, slug)`）
- 名称に記号・長音を含むものは UTF-8 保存
- 「SM」「NPO法人」など大文字・英数字混在はそのまま保存
- カテゴリの並び順は上記の記載順（必要なら `sort_order` カラムで制御）

---

## 24. ヘッダー再構成・ダッシュボード構成変更（ロゴ追加）

### 24.1 ロゴ配置

- **ロゴ画像**: `app/public/images/` 配下に配置（例: `app/public/images/logo.png`）
- サイバーパンク調「sind3ad 300knarks」ロゴ画像を使用
- ヘッダー左側に表示（`next/image` で最適化、クリックで `/` へ遷移）
- ロゴ右横にテキスト「**sindbadbookmarks revival**」を並置（白文字、現状のフォント）

### 24.2 ヘッダー構成（上書き仕様）

Section 6 / Section 22.1 を以下で上書き。

左から順に:

1. **ハンバーガーメニューアイコン**（☰）
   - 押下で左サイドバーを表示/非表示トグル
   - デフォルト状態は **「非表示（閉じた状態）」で確定**（§24.7 #1）
   - モバイル対応は Phase 4 だが、ハンバーガー自体は Phase 2 で実装
2. **ロゴ画像**（24.1 のロゴ）
3. **サイトタイトル**「sindbadbookmarks revival」（テキスト、白文字）
4. （中央余白）
5. **「情報を登録」ボタン**（右端、Section 22.1 踏襲）

従来の「ページタイトル中央表示」は廃止 → タイトルはサイト名固定、ジャンル名などは左サイドバー/メイン領域で表現。

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
