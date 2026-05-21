import { getDB } from "../client";
import type { ProfileRow } from "../types";

export async function getProfile(id: string): Promise<ProfileRow | null> {
  const db = await getDB();
  return db.prepare("SELECT * FROM profiles WHERE id = ?").bind(id).first<ProfileRow>();
}

export async function upsertProfileOnSignIn(
  id: string,
  displayName: string
): Promise<void> {
  const db = await getDB();
  await db
    .prepare(
      `INSERT INTO profiles (id, display_name) VALUES (?, ?)
       ON CONFLICT(id) DO NOTHING`
    )
    .bind(id, displayName)
    .run();
}

export async function listAllProfiles(opts: {
  search?: string | null;
  limit: number;
  offset: number;
}): Promise<{ rows: ProfileRow[]; total: number }> {
  const db = await getDB();
  const where: string[] = [];
  const binds: unknown[] = [];
  if (opts.search) {
    where.push("display_name LIKE ?");
    binds.push(`%${opts.search}%`);
  }
  const whereSql = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";
  const countRow = await db
    .prepare(`SELECT COUNT(*) AS c FROM profiles ${whereSql}`)
    .bind(...binds)
    .first<{ c: number }>();
  const total = countRow?.c ?? 0;
  const { results } = await db
    .prepare(
      `SELECT id, display_name, role, is_suspended, created_at, updated_at
       FROM profiles
       ${whereSql}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
    )
    .bind(...binds, opts.limit, opts.offset)
    .all<ProfileRow>();
  return { rows: results, total };
}

export async function deleteProfile(id: string): Promise<void> {
  const db = await getDB();
  await db.prepare("DELETE FROM profiles WHERE id = ?").bind(id).run();
}

export async function countListingsByUser(userId: string): Promise<number> {
  const db = await getDB();
  const row = await db
    .prepare("SELECT COUNT(*) AS c FROM listings WHERE user_id = ?")
    .bind(userId)
    .first<{ c: number }>();
  return row?.c ?? 0;
}

/**
 * 指定ユーザの listings 件数を since 以降に作成されたものに限ってカウント。
 * since は D1 の created_at と比較できる "YYYY-MM-DD HH:MM:SS" 形式。
 */
export async function countListingsByUserSince(
  userId: string,
  since: string,
): Promise<number> {
  const db = await getDB();
  const row = await db
    .prepare(
      "SELECT COUNT(*) AS c FROM listings WHERE user_id = ? AND created_at >= ?",
    )
    .bind(userId, since)
    .first<{ c: number }>();
  return row?.c ?? 0;
}

export async function getSuspendedFlag(id: string): Promise<boolean> {
  const db = await getDB();
  const row = await db
    .prepare("SELECT is_suspended FROM profiles WHERE id = ?")
    .bind(id)
    .first<{ is_suspended: 0 | 1 }>();
  return row?.is_suspended === 1;
}
