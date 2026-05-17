# データバックアップ / 復元手順

## バックアップ取得

リモート D1 をローカル `.sql` ダンプとして書き出す:

```powershell
cd C:\Users\copyc\Desktop\sindbadbookmarks\app
$ts = (Get-Date -AsUTC).ToString("yyyyMMdd-HHmmss")  # UTC、または JST にしたければ getlocal
npx wrangler d1 export sindbadbookmarks --remote --output="..\backups\d1-sindbadbookmarks-$ts.sql"
```

成果物は `backups/d1-sindbadbookmarks-<YYYYMMDD-HHMMSS>.sql` に保存される。
ファイル形式は `CREATE TABLE ... INSERT INTO ...` の連なり (D1 公式 export 形式)。

### バックアップ履歴の確認

```powershell
Get-ChildItem ..\backups\d1-sindbadbookmarks-*.sql | Sort-Object LastWriteTime -Descending
```

### バックアップに含まれる行数を確認

```bash
grep -oE '^INSERT INTO "[^"]+"' backups/d1-sindbadbookmarks-<TIMESTAMP>.sql | sort | uniq -c
```

---

## 復元方法

目的によって 3 通り。**3 (Time Travel) が最も安全・高速 / 1 (全面復元) が最も
破壊的**。

### 1. Time Travel (= Cloudflare D1 標準のポイント・イン・タイム復元)

**過去 30 日以内ならファイル不要で任意の瞬間に戻せる。最優先で検討**。

```powershell
cd C:\Users\copyc\Desktop\sindbadbookmarks\app

# 復元可能な bookmark (タイムスタンプ) を確認
npx wrangler d1 time-travel info sindbadbookmarks --remote

# 任意の時刻 (ISO 8601 UTC) に復元
npx wrangler d1 time-travel restore sindbadbookmarks `
  --timestamp="2026-05-17T07:00:00Z" --remote
```

注意:
- DB ID は変わらないので Worker の binding 設定は触る必要なし
- 復元中に listings 等の SELECT は一瞬不整合になりうる、夜間推奨
- アプリ側キャッシュ (`revalidate=60` 等) が切れるまで最大 1 分は古い表示が
  混在する

### 2. 全面復元 (旧バックアップ SQL で完全に上書き)

> ⚠️ **最も破壊的。現在のデータを完全に消す**

```powershell
cd C:\Users\copyc\Desktop\sindbadbookmarks\app

# (a) 安全のため現状を別ファイルに退避
$preTs = (Get-Date -AsUTC).ToString("yyyyMMdd-HHmmss")
npx wrangler d1 export sindbadbookmarks --remote `
  --output="..\backups\d1-pre-restore-$preTs.sql"

# (b) 既存テーブルを全 DROP するための補助 SQL を手で作成
#     (バックアップは CREATE TABLE から始まるので、既存 table と衝突するため)
@'
DROP TABLE IF EXISTS listing_categories;
DROP TABLE IF EXISTS reports;
DROP TABLE IF EXISTS listings;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS genres;
DROP TABLE IF EXISTS profiles;
DROP TABLE IF EXISTS announcements;
DROP TABLE IF EXISTS faqs;
DROP TABLE IF EXISTS feedback;
DROP TABLE IF EXISTS blocked_emails;
DROP TABLE IF EXISTS ad_banners;
DROP TABLE IF EXISTS access_counter;
'@ | Out-File -Encoding utf8 ..\backups\drop-all-app-tables.sql

npx wrangler d1 execute sindbadbookmarks --remote `
  --file=..\backups\drop-all-app-tables.sql

# (c) バックアップを流し込む
npx wrangler d1 execute sindbadbookmarks --remote `
  --file=..\backups\d1-sindbadbookmarks-20260517-073845.sql
```

注意:
- `_cf_KV` テーブル (D1 内部用、Cloudflare 管理) は触らない
- DROP の順序: 外部キーで参照される側 (listings, profiles, genres, categories)
  を後にする (上記 SQL は逆順で安全)
- 復元後に動作確認: listings の件数が想定通りか、admin ログインできるか

### 3. 部分復元 (特定の行だけ復活)

例「うっかり 10 件 listings を消してしまったので戻したい」:

```powershell
cd C:\Users\copyc\Desktop\sindbadbookmarks

# (a) バックアップから listings INSERT 行だけ抽出
Select-String -Pattern '^INSERT INTO "listings"' `
  backups\d1-sindbadbookmarks-<TIMESTAMP>.sql | `
  Select-Object -ExpandProperty Line `
  > backups\listings-only.sql

# (b) 必要なら ID で grep して対象行のみに絞る
Select-String -Pattern "'<lost-listing-id>'" `
  backups\listings-only.sql > backups\restore-subset.sql

# (c) 主キー衝突を避けるため INSERT → INSERT OR IGNORE に書き換える
(Get-Content backups\restore-subset.sql) `
  -replace '^INSERT INTO "listings"', 'INSERT OR IGNORE INTO "listings"' | `
  Set-Content backups\restore-subset.sql

# (d) 実行
cd app
npx wrangler d1 execute sindbadbookmarks --remote `
  --file=..\backups\restore-subset.sql
```

`listing_categories` の関連行も別途同様に復元する場合は同じ手順を繰り返す。

---

## 復元前のチェックリスト

- [ ] **現状を別ファイルに退避** したか (`d1-pre-restore-*.sql`)
- [ ] 復元したい時点が **30 日以内** なら Time Travel を優先検討
- [ ] 復元すべき範囲は **全件** か **特定行のみ** か
- [ ] 復元後にアプリ側キャッシュ (`revalidate=60`) が切れるまで 1 分は古い
      表示が混在することを許容できる時間帯か
- [ ] (本番影響を最小化したい場合) D1 branch DB を一時的に作って復元テストを
      先に流せるか (`wrangler d1 create --branch sindbadbookmarks-test` 系)

## 関連ファイル / 場所

- バックアップ保存: [`backups/`](../backups/)
- D1 database name: `sindbadbookmarks`
- D1 database id: `a37191b1-4993-4938-b2ee-4578b2ec9f86`
- Cloudflare account id: `5f4f4c90fa8774f0dd479e597923ba84`

## ロールバックタグでまるごと戻す手段

コード側の問題で前バージョンに戻したい場合は、git tag と組み合わせる:

```powershell
git checkout v5.0.0  # または該当バージョン
cd app
npm install
npm run cf:deploy

# DB は別途必要に応じて Time Travel で同時刻に復元
```

タグ運用は memory にあるルール通り「ローカル保持・push は手動判断」のため、
GitHub にリリースを残したい場合は `git push origin v6.0.0` を別途実行。
