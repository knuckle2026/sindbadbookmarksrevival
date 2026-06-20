import { getDB } from "../client";
import type { ListingRow, ListingStatus } from "../types";

export async function incrementClickCount(id: string): Promise<void> {
  const db = await getDB();
  await db
    .prepare(
      "UPDATE listings SET click_count = click_count + 1 WHERE id = ? AND status = 'published'"
    )
    .bind(id)
    .run();
}

export async function getListingById(id: string): Promise<ListingRow | null> {
  const db = await getDB();
  return db
    .prepare("SELECT * FROM listings WHERE id = ?")
    .bind(id)
    .first<ListingRow>();
}

export type MyListingRow = Pick<
  ListingRow,
  "id" | "title" | "description" | "website_url" | "created_at"
>;

export async function listMyListings(
  userId: string,
  offset: number,
  limit: number
): Promise<{ rows: MyListingRow[]; total: number }> {
  const db = await getDB();
  const countRow = await db
    .prepare("SELECT COUNT(*) AS c FROM listings WHERE user_id = ?")
    .bind(userId)
    .first<{ c: number }>();
  const total = countRow?.c ?? 0;
  const { results } = await db
    .prepare(
      `SELECT id, title, description, website_url, created_at
       FROM listings
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`
    )
    .bind(userId, limit, offset)
    .all<MyListingRow>();
  return { rows: results, total };
}

export interface CountFilterOpts {
  /** カテゴリ ID のいずれかに紐づく listing のみ集計（OR） */
  categoryIdsInclude?: string[] | null;
  /** カテゴリ ID 全てに紐づいている listing のみ集計（AND） */
  categoryIdsAndAll?: string[] | null;
  /** カテゴリ ID のいずれかに紐づく listing を除外 */
  categoryIdsExclude?: string[] | null;
  /** "YYYY-MM-DD HH:MM:SS" 形式。これ以降に作られた listing のみ集計 (新着フィルタ用) */
  createdSince?: string | null;
  /** サービス提供者の年代 slug (provider_ages JSON 配列のいずれかに含まれる listing のみ集計、OR) */
  providerAges?: string[] | null;
}

function buildCountFilter(opts?: CountFilterOpts): { sql: string; binds: unknown[] } {
  const parts: string[] = [];
  const binds: unknown[] = [];
  if (opts?.createdSince) {
    parts.push("created_at >= ?");
    binds.push(opts.createdSince);
  }
  if (opts?.categoryIdsInclude && opts.categoryIdsInclude.length > 0) {
    const ph = opts.categoryIdsInclude.map(() => "?").join(",");
    parts.push(
      `id IN (SELECT listing_id FROM listing_categories WHERE category_id IN (${ph}))`,
    );
    binds.push(...opts.categoryIdsInclude);
  }
  if (opts?.categoryIdsAndAll && opts.categoryIdsAndAll.length > 0) {
    const ph = opts.categoryIdsAndAll.map(() => "?").join(",");
    parts.push(
      `id IN (SELECT listing_id FROM listing_categories WHERE category_id IN (${ph}) GROUP BY listing_id HAVING COUNT(DISTINCT category_id) = ${opts.categoryIdsAndAll.length})`,
    );
    binds.push(...opts.categoryIdsAndAll);
  }
  if (opts?.categoryIdsExclude && opts.categoryIdsExclude.length > 0) {
    const ph = opts.categoryIdsExclude.map(() => "?").join(",");
    parts.push(
      `id NOT IN (SELECT listing_id FROM listing_categories WHERE category_id IN (${ph}))`,
    );
    binds.push(...opts.categoryIdsExclude);
  }
  if (opts?.providerAges && opts.providerAges.length > 0) {
    // provider_ages は JSON.stringify(string[]) で保存されているため、
    // 各 slug を '"<slug>"' でラップした部分一致 (LIKE) を OR 連結する。
    // buildGenreFilter の同一実装と整合させる。
    const sub = opts.providerAges
      .map(() => "provider_ages LIKE ?")
      .join(" OR ");
    parts.push(`(${sub})`);
    for (const a of opts.providerAges) binds.push(`%"${a}"%`);
  }
  return { sql: parts.length > 0 ? " AND " + parts.join(" AND ") : "", binds };
}

export async function getPrefectureCounts(
  genreId: string,
  opts?: CountFilterOpts,
): Promise<Record<string, number>> {
  const db = await getDB();
  const { sql: extra, binds } = buildCountFilter(opts);
  const { results } = await db
    .prepare(
      `SELECT prefecture, COUNT(*) AS c
       FROM listings
       WHERE genre_id = ? AND status = 'published' AND prefecture IS NOT NULL${extra}
       GROUP BY prefecture`,
    )
    .bind(genreId, ...binds)
    .all<{ prefecture: string; c: number }>();
  const map: Record<string, number> = {};
  for (const r of results) map[r.prefecture] = r.c;
  return map;
}

export async function getWardCounts(
  genreId: string,
  prefSlug: string,
  opts?: CountFilterOpts,
): Promise<Record<string, number>> {
  const db = await getDB();
  const { sql: extra, binds } = buildCountFilter(opts);
  const { results } = await db
    .prepare(
      `SELECT ward, COUNT(*) AS c
       FROM listings
       WHERE genre_id = ? AND status = 'published' AND prefecture = ?${extra}
       GROUP BY ward`,
    )
    .bind(genreId, prefSlug, ...binds)
    .all<{ ward: string | null; c: number }>();
  const map: Record<string, number> = {};
  for (const r of results) map[r.ward ?? "__null"] = r.c;
  return map;
}

export async function getListingIdsByCategories(
  categoryIds: string[]
): Promise<string[]> {
  if (categoryIds.length === 0) return [];
  const db = await getDB();
  const placeholders = categoryIds.map(() => "?").join(",");
  const { results } = await db
    .prepare(
      `SELECT DISTINCT listing_id FROM listing_categories WHERE category_id IN (${placeholders})`
    )
    .bind(...categoryIds)
    .all<{ listing_id: string }>();
  return results.map((r) => r.listing_id);
}

export async function getAllPublishedListingIds(
  genreId: string
): Promise<string[]> {
  const db = await getDB();
  const { results } = await db
    .prepare(
      `SELECT id FROM listings WHERE genre_id = ? AND status = 'published'`
    )
    .bind(genreId)
    .all<{ id: string }>();
  return results.map((r) => r.id);
}

export type SortKey =
  | "created_desc"
  | "created_asc"
  | "updated_desc"
  | "updated_asc"
  | "title_asc"
  | "title_desc"
  | "popular";

const SORT_SQL: Record<SortKey, string> = {
  created_desc: "created_at DESC",
  created_asc: "created_at ASC",
  updated_desc: "updated_at DESC",
  updated_asc: "updated_at ASC",
  title_asc: "title ASC",
  title_desc: "title DESC",
  popular: "click_count DESC",
};

export interface SearchGenreOpts {
  genreId: string;
  sort: SortKey;
  limit: number;
  offset: number;
  /** 旧方式: 個別の listing_id 配列で絞り込み。大量だと D1 の bind 上限に当たるため非推奨。 */
  listingIds?: string[] | null;
  /** カテゴリ ID で IN サブクエリを使ってフィルタ（OR）。 */
  categoryIdsInclude?: string[] | null;
  /** カテゴリ ID 全てに紐づいている listing のみ通過（AND）。 */
  categoryIdsAndAll?: string[] | null;
  /** カテゴリ ID で NOT IN サブクエリを使って除外。 */
  categoryIdsExclude?: string[] | null;
  prefectures?: string[] | null;
  providerAges?: string[] | null;
  wardSpecific?: string[] | null;
  wardIncludesNull?: boolean;
  keyword?: string | null;
  /** "YYYY-MM-DD HH:MM:SS" 形式。これ以降に作られた listing のみ通過 (新着フィルタ) */
  createdSince?: string | null;
}

export type GenreListingRow = Pick<
  ListingRow,
  | "id"
  | "title"
  | "description"
  | "website_url"
  | "prefecture"
  | "provider_ages"
  | "created_at"
  | "updated_at"
>;

function buildGenreFilter(opts: SearchGenreOpts): {
  sql: string;
  binds: unknown[];
} {
  const parts: string[] = [
    "genre_id = ?",
    "status = 'published'",
  ];
  const binds: unknown[] = [opts.genreId];

  if (opts.listingIds) {
    if (opts.listingIds.length === 0) {
      parts.push("1 = 0");
    } else {
      parts.push(
        `id IN (${opts.listingIds.map(() => "?").join(",")})`
      );
      binds.push(...opts.listingIds);
    }
  }
  if (opts.categoryIdsInclude && opts.categoryIdsInclude.length > 0) {
    const ph = opts.categoryIdsInclude.map(() => "?").join(",");
    parts.push(
      `id IN (SELECT listing_id FROM listing_categories WHERE category_id IN (${ph}))`,
    );
    binds.push(...opts.categoryIdsInclude);
  }
  if (opts.categoryIdsAndAll && opts.categoryIdsAndAll.length > 0) {
    const ph = opts.categoryIdsAndAll.map(() => "?").join(",");
    parts.push(
      `id IN (SELECT listing_id FROM listing_categories WHERE category_id IN (${ph}) GROUP BY listing_id HAVING COUNT(DISTINCT category_id) = ${opts.categoryIdsAndAll.length})`,
    );
    binds.push(...opts.categoryIdsAndAll);
  }
  if (opts.categoryIdsExclude && opts.categoryIdsExclude.length > 0) {
    const ph = opts.categoryIdsExclude.map(() => "?").join(",");
    parts.push(
      `id NOT IN (SELECT listing_id FROM listing_categories WHERE category_id IN (${ph}))`,
    );
    binds.push(...opts.categoryIdsExclude);
  }
  if (opts.prefectures && opts.prefectures.length > 0) {
    parts.push(
      `prefecture IN (${opts.prefectures.map(() => "?").join(",")})`
    );
    binds.push(...opts.prefectures);
  }
  if (opts.providerAges && opts.providerAges.length > 0) {
    const sub = opts.providerAges
      .map(() => "provider_ages LIKE ?")
      .join(" OR ");
    parts.push(`(${sub})`);
    for (const a of opts.providerAges) binds.push(`%"${a}"%`);
  }
  if (opts.wardSpecific || opts.wardIncludesNull) {
    const wardParts: string[] = [];
    if (opts.wardSpecific && opts.wardSpecific.length > 0) {
      wardParts.push(
        `ward IN (${opts.wardSpecific.map(() => "?").join(",")})`
      );
      binds.push(...opts.wardSpecific);
    }
    if (opts.wardIncludesNull) wardParts.push("ward IS NULL");
    if (wardParts.length > 0) parts.push(`(${wardParts.join(" OR ")})`);
  }
  if (opts.keyword) {
    parts.push("(title LIKE ? OR description LIKE ?)");
    const pat = `%${opts.keyword}%`;
    binds.push(pat, pat);
  }
  if (opts.createdSince) {
    parts.push("created_at >= ?");
    binds.push(opts.createdSince);
  }

  return { sql: parts.join(" AND "), binds };
}

export async function searchGenreListings(
  opts: SearchGenreOpts
): Promise<{ rows: GenreListingRow[]; total: number }> {
  const db = await getDB();
  const { sql: where, binds } = buildGenreFilter(opts);

  const countRow = await db
    .prepare(`SELECT COUNT(*) AS c FROM listings WHERE ${where}`)
    .bind(...binds)
    .first<{ c: number }>();
  const total = countRow?.c ?? 0;

  const { results } = await db
    .prepare(
      `SELECT id, title, description, website_url, prefecture, provider_ages, created_at, updated_at
       FROM listings
       WHERE ${where}
       ORDER BY ${SORT_SQL[opts.sort]}
       LIMIT ? OFFSET ?`
    )
    .bind(...binds, opts.limit, opts.offset)
    .all<GenreListingRow>();

  return { rows: results, total };
}

export async function countGenreListings(opts: SearchGenreOpts): Promise<number> {
  const db = await getDB();
  const { sql: where, binds } = buildGenreFilter(opts);
  const row = await db
    .prepare(`SELECT COUNT(*) AS c FROM listings WHERE ${where}`)
    .bind(...binds)
    .first<{ c: number }>();
  return row?.c ?? 0;
}

export async function searchListingsByKeyword(
  q: string,
  offset: number,
  limit: number
): Promise<{ rows: GenreListingRow[]; total: number }> {
  const db = await getDB();
  const pat = `%${q}%`;
  const countRow = await db
    .prepare(
      `SELECT COUNT(*) AS c FROM listings
       WHERE status = 'published'
         AND (title LIKE ? OR description LIKE ?)`
    )
    .bind(pat, pat)
    .first<{ c: number }>();
  const total = countRow?.c ?? 0;
  const { results } = await db
    .prepare(
      `SELECT id, title, description, website_url, prefecture, provider_ages, created_at, updated_at
       FROM listings
       WHERE status = 'published'
         AND (title LIKE ? OR description LIKE ?)
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`
    )
    .bind(pat, pat, limit, offset)
    .all<GenreListingRow>();
  return { rows: results, total };
}

export async function getCategoriesForListings(
  listingIds: string[]
): Promise<Record<string, { id: string; name: string }[]>> {
  if (listingIds.length === 0) return {};
  const db = await getDB();
  const placeholders = listingIds.map(() => "?").join(",");
  const { results } = await db
    .prepare(
      `SELECT lc.listing_id, c.id, c.name
       FROM listing_categories lc
       JOIN categories c ON c.id = lc.category_id
       WHERE lc.listing_id IN (${placeholders})
       ORDER BY c.sort_order`
    )
    .bind(...listingIds)
    .all<{ listing_id: string; id: string; name: string }>();
  const map: Record<string, { id: string; name: string }[]> = {};
  for (const r of results) {
    (map[r.listing_id] ??= []).push({ id: r.id, name: r.name });
  }
  return map;
}

export async function getListingCategoryIds(
  listingId: string
): Promise<string[]> {
  const db = await getDB();
  const { results } = await db
    .prepare(
      `SELECT category_id FROM listing_categories WHERE listing_id = ?`
    )
    .bind(listingId)
    .all<{ category_id: string }>();
  return results.map((r) => r.category_id);
}

export interface ListingWrite {
  genre_id: string;
  title: string;
  description: string;
  website_url: string;
  prefecture: string | null;
  ward: string | null;
  provider_ages: string[] | null;
  address: string | null;
}

export async function createListing(
  input: ListingWrite,
  userId: string | null,
  categoryIds: string[],
  status: ListingStatus = "published"
): Promise<string> {
  const db = await getDB();
  const id = crypto.randomUUID();
  await db
    .prepare(
      `INSERT INTO listings (
         id, user_id, genre_id, title, description, website_url,
         prefecture, ward, provider_ages, address,
         status, created_by, updated_by
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      id,
      userId,
      input.genre_id,
      input.title,
      input.description,
      input.website_url,
      input.prefecture,
      input.ward,
      input.provider_ages ? JSON.stringify(input.provider_ages) : null,
      input.address,
      status,
      userId,
      userId
    )
    .run();
  await replaceCategories(id, categoryIds);
  return id;
}

export async function updateListing(
  id: string,
  input: ListingWrite,
  userId: string,
  categoryIds: string[]
): Promise<void> {
  const db = await getDB();
  await db
    .prepare(
      `UPDATE listings SET
         genre_id = ?, title = ?, description = ?, website_url = ?,
         prefecture = ?, ward = ?, provider_ages = ?,
         address = ?, updated_by = ?, updated_at = (datetime('now'))
       WHERE id = ?`
    )
    .bind(
      input.genre_id,
      input.title,
      input.description,
      input.website_url,
      input.prefecture,
      input.ward,
      input.provider_ages ? JSON.stringify(input.provider_ages) : null,
      input.address,
      userId,
      id
    )
    .run();
  await replaceCategories(id, categoryIds);
}

async function replaceCategories(
  listingId: string,
  categoryIds: string[]
): Promise<void> {
  const db = await getDB();
  await db
    .prepare("DELETE FROM listing_categories WHERE listing_id = ?")
    .bind(listingId)
    .run();
  if (categoryIds.length === 0) return;
  const stmts = categoryIds.map((cid) =>
    db
      .prepare(
        "INSERT INTO listing_categories (listing_id, category_id) VALUES (?, ?)"
      )
      .bind(listingId, cid)
  );
  await db.batch(stmts);
}

export async function deleteListing(id: string): Promise<void> {
  const db = await getDB();
  await db.prepare("DELETE FROM listings WHERE id = ?").bind(id).run();
}

export type AdminSortColumn = "title" | "url" | "description" | "created_at";

export interface AdminSearchOpts {
  q?: string | null;
  genreId?: string | null;
  categoryId?: string | null;
  status?: ListingStatus | null;
  sortColumn: AdminSortColumn;
  sortOrder: "asc" | "desc";
  limit: number;
  offset: number;
}

export type AdminListingRow = Pick<
  ListingRow,
  "id" | "title" | "genre_id" | "website_url" | "description" | "created_at" | "user_id" | "status"
>;

const ADMIN_SORT_SQL: Record<AdminSortColumn, string> = {
  title: "title",
  url: "website_url",
  description: "description",
  created_at: "created_at",
};

function buildAdminFilter(opts: {
  q?: string | null;
  genreId?: string | null;
  categoryId?: string | null;
  status?: ListingStatus | null;
}): { sql: string; binds: unknown[] } {
  const parts: string[] = [];
  const binds: unknown[] = [];
  if (opts.genreId) {
    parts.push("genre_id = ?");
    binds.push(opts.genreId);
  }
  if (opts.categoryId) {
    parts.push(
      "id IN (SELECT listing_id FROM listing_categories WHERE category_id = ?)",
    );
    binds.push(opts.categoryId);
  }
  if (opts.q) {
    parts.push("(title LIKE ? OR website_url LIKE ?)");
    const pat = `%${opts.q}%`;
    binds.push(pat, pat);
  }
  if (opts.status) {
    parts.push("status = ?");
    binds.push(opts.status);
  }
  return {
    sql: parts.length > 0 ? parts.join(" AND ") : "1 = 1",
    binds,
  };
}

export async function adminCountListings(opts: {
  q?: string | null;
  genreId?: string | null;
  categoryId?: string | null;
  status?: ListingStatus | null;
}): Promise<number> {
  const db = await getDB();
  const { sql: where, binds } = buildAdminFilter(opts);
  const row = await db
    .prepare(`SELECT COUNT(*) AS c FROM listings WHERE ${where}`)
    .bind(...binds)
    .first<{ c: number }>();
  return row?.c ?? 0;
}

export async function adminSearchListings(
  opts: AdminSearchOpts
): Promise<AdminListingRow[]> {
  const db = await getDB();
  const { sql: where, binds } = buildAdminFilter(opts);
  const sortSql = ADMIN_SORT_SQL[opts.sortColumn];
  const dir = opts.sortOrder === "asc" ? "ASC" : "DESC";
  const { results } = await db
    .prepare(
      `SELECT id, title, genre_id, website_url, description, created_at, user_id, status
       FROM listings
       WHERE ${where}
       ORDER BY ${sortSql} ${dir}
       LIMIT ? OFFSET ?`
    )
    .bind(...binds, opts.limit, opts.offset)
    .all<AdminListingRow>();
  return results;
}
