import { getDB } from "../client";
import type { CategoryRow } from "../types";

export type CategoryWithGenreSlug = CategoryRow & { genre_slug: string };

export async function listAllCategoriesWithGenreSlug(): Promise<CategoryWithGenreSlug[]> {
  const db = await getDB();
  const { results } = await db
    .prepare(
      `SELECT c.*, g.slug AS genre_slug
       FROM categories c
       JOIN genres g ON g.id = c.genre_id
       ORDER BY c.sort_order, c.slug`
    )
    .all<CategoryWithGenreSlug>();
  return results;
}

export async function listCategoriesByGenre(genreId: string): Promise<CategoryRow[]> {
  const db = await getDB();
  const { results } = await db
    .prepare("SELECT * FROM categories WHERE genre_id = ? ORDER BY sort_order")
    .bind(genreId)
    .all<CategoryRow>();
  return results;
}

export type CategoryCountRow = {
  genre_slug: string;
  genre_name: string;
  genre_sort: number;
  category_slug: string | null;
  category_name: string | null;
  category_sort: number | null;
  listing_count: number;
};

export async function getCategoryCountsAll(): Promise<CategoryCountRow[]> {
  const db = await getDB();
  const { results } = await db
    .prepare(
      `SELECT
         g.slug       AS genre_slug,
         g.name       AS genre_name,
         g.sort_order AS genre_sort,
         c.slug       AS category_slug,
         c.name       AS category_name,
         c.sort_order AS category_sort,
         COUNT(DISTINCT l.id) AS listing_count
       FROM genres g
       LEFT JOIN categories c ON c.genre_id = g.id
       LEFT JOIN listing_categories lc ON lc.category_id = c.id
       LEFT JOIN listings l
         ON l.id = lc.listing_id AND l.status = 'published'
       GROUP BY g.id, g.slug, g.name, g.sort_order,
                c.id, c.slug, c.name, c.sort_order
       ORDER BY g.sort_order, c.sort_order`
    )
    .all<CategoryCountRow>();
  return results;
}

export type CategoryWithGenre = CategoryRow & {
  genre_slug: string;
  genre_name: string;
};

export async function listAllCategoriesWithGenre(): Promise<CategoryWithGenre[]> {
  const db = await getDB();
  const { results } = await db
    .prepare(
      `SELECT c.*, g.slug AS genre_slug, g.name AS genre_name
       FROM categories c
       JOIN genres g ON g.id = c.genre_id
       ORDER BY g.sort_order, c.sort_order`
    )
    .all<CategoryWithGenre>();
  return results;
}

export async function createCategory(input: {
  genre_id: string;
  name: string;
  slug: string;
  sort_order: number;
}): Promise<CategoryRow> {
  const db = await getDB();
  const id = crypto.randomUUID();
  await db
    .prepare(
      `INSERT INTO categories (id, genre_id, name, slug, sort_order)
       VALUES (?, ?, ?, ?, ?)`
    )
    .bind(id, input.genre_id, input.name, input.slug, input.sort_order)
    .run();
  const row = await db
    .prepare("SELECT * FROM categories WHERE id = ?")
    .bind(id)
    .first<CategoryRow>();
  if (!row) throw new Error("Failed to read inserted category");
  return row;
}

export async function updateCategory(
  id: string,
  input: { name: string; slug: string }
): Promise<void> {
  const db = await getDB();
  await db
    .prepare("UPDATE categories SET name = ?, slug = ? WHERE id = ?")
    .bind(input.name, input.slug, id)
    .run();
}

export async function deleteCategory(id: string): Promise<void> {
  const db = await getDB();
  await db.prepare("DELETE FROM categories WHERE id = ?").bind(id).run();
}

export async function reorderCategories(
  items: { id: string; sort_order: number }[]
): Promise<void> {
  if (items.length === 0) return;
  const db = await getDB();
  const stmts = items.map((it) =>
    db
      .prepare("UPDATE categories SET sort_order = ? WHERE id = ?")
      .bind(it.sort_order, it.id)
  );
  await db.batch(stmts);
}
