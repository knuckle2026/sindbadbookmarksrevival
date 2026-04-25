import { getDB } from "../client";
import type { ReportRow } from "../types";

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
