import { getDB } from "../client";
import type { FaqRow } from "../types";

export type FaqListRow = Pick<
  FaqRow,
  "id" | "question" | "answer" | "sort_order" | "created_at"
>;

export async function listFaqs(): Promise<FaqListRow[]> {
  const db = await getDB();
  const { results } = await db
    .prepare(
      `SELECT id, question, answer, sort_order, created_at
       FROM faqs
       ORDER BY sort_order ASC, created_at ASC`
    )
    .all<FaqListRow>();
  return results;
}

export async function createFaq(input: {
  question: string;
  answer: string;
  sort_order: number;
}): Promise<FaqListRow> {
  const db = await getDB();
  const id = crypto.randomUUID();
  await db
    .prepare(
      `INSERT INTO faqs (id, question, answer, sort_order)
       VALUES (?, ?, ?, ?)`
    )
    .bind(id, input.question, input.answer, input.sort_order)
    .run();
  const row = await db
    .prepare(
      `SELECT id, question, answer, sort_order, created_at
       FROM faqs WHERE id = ?`
    )
    .bind(id)
    .first<FaqListRow>();
  if (!row) throw new Error("Failed to read inserted faq");
  return row;
}

export async function updateFaq(
  id: string,
  input: { question: string; answer: string; sort_order: number }
): Promise<void> {
  const db = await getDB();
  await db
    .prepare(
      `UPDATE faqs
       SET question = ?, answer = ?, sort_order = ?, updated_at = (datetime('now'))
       WHERE id = ?`
    )
    .bind(input.question, input.answer, input.sort_order, id)
    .run();
}

export async function deleteFaq(id: string): Promise<void> {
  const db = await getDB();
  await db.prepare("DELETE FROM faqs WHERE id = ?").bind(id).run();
}
