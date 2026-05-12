import { getDB } from "../client";

export async function incrementAndGetCount(): Promise<number> {
  const db = await getDB();
  await db
    .prepare(
      "UPDATE access_counter SET count = count + 1, updated_at = datetime('now') WHERE id = 'site'"
    )
    .run();
  const row = await db
    .prepare("SELECT count FROM access_counter WHERE id = 'site'")
    .first<{ count: number }>();
  return row?.count ?? 0;
}
