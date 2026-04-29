import { getDB } from "../client";
import type { FeedbackRow } from "../types";

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

export type FeedbackListRow = Pick<
  FeedbackRow,
  "id" | "user_id" | "body" | "created_at"
>;

export async function listFeedback(
  offset: number,
  limit: number
): Promise<{ rows: FeedbackListRow[]; total: number }> {
  const db = await getDB();
  const countRow = await db
    .prepare("SELECT COUNT(*) AS c FROM feedback")
    .first<{ c: number }>();
  const total = countRow?.c ?? 0;
  const { results } = await db
    .prepare(
      `SELECT id, user_id, body, created_at
       FROM feedback
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`
    )
    .bind(limit, offset)
    .all<FeedbackListRow>();
  return { rows: results, total };
}
