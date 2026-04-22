import { getDB } from "../client";
import type { CategoryRow } from "../types";

export async function listCategoriesByGenre(genreId: string): Promise<CategoryRow[]> {
  const db = await getDB();
  const { results } = await db
    .prepare("SELECT * FROM categories WHERE genre_id = ? ORDER BY sort_order")
    .bind(genreId)
    .all<CategoryRow>();
  return results;
}
