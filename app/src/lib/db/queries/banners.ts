import { getDB } from "../client";
import type { BannerRow } from "../types";

const SELECT_COLS =
  "id, storage_key, image_url, link_url, placement, alt, sort_order, enabled, created_at, updated_at";

export async function listBannersForAdmin(): Promise<BannerRow[]> {
  const db = await getDB();
  const { results } = await db
    .prepare(
      `SELECT ${SELECT_COLS} FROM ad_banners
       ORDER BY placement ASC, sort_order ASC, created_at DESC`,
    )
    .all<BannerRow>();
  return results;
}

export async function listEnabledBannersByPlacement(
  placement: string,
): Promise<BannerRow[]> {
  const db = await getDB();
  const { results } = await db
    .prepare(
      `SELECT ${SELECT_COLS} FROM ad_banners
       WHERE placement = ? AND enabled = 1
       ORDER BY sort_order ASC, created_at ASC`,
    )
    .bind(placement)
    .all<BannerRow>();
  return results;
}

export async function getBanner(id: string): Promise<BannerRow | null> {
  const db = await getDB();
  const row = await db
    .prepare(`SELECT ${SELECT_COLS} FROM ad_banners WHERE id = ?`)
    .bind(id)
    .first<BannerRow>();
  return row ?? null;
}

export async function createBanner(input: {
  storage_key: string;
  image_url: string;
  link_url: string;
  placement: string;
  alt: string | null;
  sort_order: number;
  enabled: 0 | 1;
}): Promise<BannerRow> {
  const db = await getDB();
  const id = crypto.randomUUID();
  await db
    .prepare(
      `INSERT INTO ad_banners
         (id, storage_key, image_url, link_url, placement, alt, sort_order, enabled)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      id,
      input.storage_key,
      input.image_url,
      input.link_url,
      input.placement,
      input.alt,
      input.sort_order,
      input.enabled,
    )
    .run();
  const row = await getBanner(id);
  if (!row) throw new Error("Failed to read inserted banner");
  return row;
}

export async function updateBanner(
  id: string,
  input: {
    storage_key: string;
    image_url: string;
    link_url: string;
    placement: string;
    alt: string | null;
    sort_order: number;
    enabled: 0 | 1;
  },
): Promise<void> {
  const db = await getDB();
  await db
    .prepare(
      `UPDATE ad_banners SET
         storage_key = ?,
         image_url   = ?,
         link_url    = ?,
         placement   = ?,
         alt         = ?,
         sort_order  = ?,
         enabled     = ?,
         updated_at  = (datetime('now'))
       WHERE id = ?`,
    )
    .bind(
      input.storage_key,
      input.image_url,
      input.link_url,
      input.placement,
      input.alt,
      input.sort_order,
      input.enabled,
      id,
    )
    .run();
}

export async function deleteBanner(id: string): Promise<void> {
  const db = await getDB();
  await db.prepare("DELETE FROM ad_banners WHERE id = ?").bind(id).run();
}
