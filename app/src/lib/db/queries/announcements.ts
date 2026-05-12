import { getDB } from "../client";
import type { AnnouncementRow } from "../types";

export type AnnouncementListRow = Pick<
  AnnouncementRow,
  "id" | "title" | "body" | "sort_order" | "created_at" | "updated_at"
>;

export async function listAnnouncements(): Promise<AnnouncementListRow[]> {
  const db = await getDB();
  const { results } = await db
    .prepare(
      `SELECT id, title, body, sort_order, created_at, updated_at
       FROM announcements
       ORDER BY sort_order ASC, created_at DESC`
    )
    .all<AnnouncementListRow>();
  return results;
}

export async function createAnnouncement(input: {
  title: string;
  body: string;
  sort_order: number;
}): Promise<AnnouncementListRow> {
  const db = await getDB();
  const id = crypto.randomUUID();
  await db
    .prepare(
      `INSERT INTO announcements (id, title, body, sort_order)
       VALUES (?, ?, ?, ?)`
    )
    .bind(id, input.title, input.body, input.sort_order)
    .run();
  const row = await db
    .prepare(
      `SELECT id, title, body, sort_order, created_at, updated_at
       FROM announcements WHERE id = ?`
    )
    .bind(id)
    .first<AnnouncementListRow>();
  if (!row) throw new Error("Failed to read inserted announcement");
  return row;
}

export async function updateAnnouncement(
  id: string,
  input: { title: string; body: string; sort_order: number }
): Promise<void> {
  const db = await getDB();
  await db
    .prepare(
      `UPDATE announcements
       SET title = ?, body = ?, sort_order = ?, updated_at = (datetime('now'))
       WHERE id = ?`
    )
    .bind(input.title, input.body, input.sort_order, id)
    .run();
}

export async function deleteAnnouncement(id: string): Promise<void> {
  const db = await getDB();
  await db.prepare("DELETE FROM announcements WHERE id = ?").bind(id).run();
}
