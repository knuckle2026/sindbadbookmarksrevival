import { getDB } from "../client";

export async function incrementClickCount(id: string): Promise<void> {
  const db = await getDB();
  await db
    .prepare(
      "UPDATE listings SET click_count = click_count + 1 WHERE id = ? AND status = 'published'"
    )
    .bind(id)
    .run();
}
