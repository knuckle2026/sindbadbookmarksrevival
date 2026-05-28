import { getDB } from "../client";
import type { ReportRow, ReportStatus } from "../types";

export async function insertReport(
  listingId: string,
  reason: string,
  reporterUserId: string | null
): Promise<void> {
  const db = await getDB();
  await db
    .prepare(
      `INSERT INTO reports (id, listing_id, reporter_user_id, reason)
       VALUES (?, ?, ?, ?)`
    )
    .bind(crypto.randomUUID(), listingId, reporterUserId, reason)
    .run();
}

export type ListingReportRow = Pick<
  ReportRow,
  "id" | "listing_id" | "reason" | "status" | "created_at"
>;

export async function getReportsByListingIds(
  listingIds: string[]
): Promise<Record<string, ListingReportRow[]>> {
  if (listingIds.length === 0) return {};
  const db = await getDB();
  const placeholders = listingIds.map(() => "?").join(",");
  const { results } = await db
    .prepare(
      `SELECT id, listing_id, reason, status, created_at
       FROM reports
       WHERE listing_id IN (${placeholders})
       ORDER BY created_at DESC`
    )
    .bind(...listingIds)
    .all<ListingReportRow>();

  const map: Record<string, ListingReportRow[]> = {};
  for (const r of results) {
    (map[r.listing_id] ??= []).push(r);
  }
  return map;
}

export async function updateReportStatus(
  id: string,
  status: ReportStatus
): Promise<void> {
  const db = await getDB();
  await db
    .prepare(`UPDATE reports SET status = ? WHERE id = ?`)
    .bind(status, id)
    .run();
}

export async function deleteReport(id: string): Promise<void> {
  const db = await getDB();
  await db.prepare(`DELETE FROM reports WHERE id = ?`).bind(id).run();
}
