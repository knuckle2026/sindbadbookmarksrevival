import { getDB } from "../client";

export async function insertFeedback(
  body: string,
  userId: string | null
): Promise<void> {
  const db = await getDB();
  await db
    .prepare(
      "INSERT INTO feedback (id, user_id, body) VALUES (?, ?, ?)"
    )
    .bind(crypto.randomUUID(), userId, body)
    .run();
}
