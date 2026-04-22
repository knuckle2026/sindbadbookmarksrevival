import { getDB } from "../client";
import type { GenreRow } from "../types";

export async function listGenres(): Promise<GenreRow[]> {
  const db = await getDB();
  const { results } = await db
    .prepare("SELECT * FROM genres ORDER BY sort_order, slug")
    .all<GenreRow>();
  return results;
}

export async function getGenreBySlug(slug: string): Promise<GenreRow | null> {
  const db = await getDB();
  return db.prepare("SELECT * FROM genres WHERE slug = ?").bind(slug).first<GenreRow>();
}
