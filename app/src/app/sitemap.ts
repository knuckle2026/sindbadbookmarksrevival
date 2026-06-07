import type { MetadataRoute } from "next";
import { getDB } from "@/lib/db/client";
import { listGenres } from "@/lib/db/queries/genres";

export const dynamic = "force-dynamic";

const BASE_URL = "https://g-ankers.com";

type ListingSitemapRow = { id: string; updated_at: string };

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // 静的ページ (admin / age-gate は含めない)
  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/genres`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/search`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/listings/new`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/operator`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // ジャンル別ページ
  const genres = await listGenres();
  const genreEntries: MetadataRoute.Sitemap = genres.map((g) => ({
    url: `${BASE_URL}/genres/${g.slug}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.9,
  }));

  // 公開済みの listing 詳細ページ
  const db = await getDB();
  const { results: listings } = await db
    .prepare(
      `SELECT id, updated_at FROM listings WHERE status = 'published' ORDER BY updated_at DESC`,
    )
    .all<ListingSitemapRow>();

  const listingEntries: MetadataRoute.Sitemap = listings.map((l) => ({
    url: `${BASE_URL}/listings/${l.id}`,
    lastModified: parseD1Timestamp(l.updated_at) ?? now,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticEntries, ...genreEntries, ...listingEntries];
}

/** D1 の "YYYY-MM-DD HH:MM:SS" UTC 文字列を Date に変換 */
function parseD1Timestamp(s: string | null | undefined): Date | null {
  if (!s) return null;
  // SQLite/D1 の datetime('now') は ISO 風だが T 区切りでないので補正
  const iso = s.includes("T") ? s : s.replace(" ", "T") + "Z";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? null : d;
}
