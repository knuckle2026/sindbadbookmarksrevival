import { getDB } from "../client";

export async function incrementAndGetCount(id: string): Promise<number> {
  const db = await getDB();
  const row = await db
    .prepare(
      `INSERT INTO access_counter (id, count, updated_at)
       VALUES (?, 1, datetime('now'))
       ON CONFLICT(id) DO UPDATE
         SET count = count + 1,
             updated_at = datetime('now')
       RETURNING count`,
    )
    .bind(id)
    .first<{ count: number }>();
  return row?.count ?? 0;
}
