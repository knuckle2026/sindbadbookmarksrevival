export const revalidate = 300; // 5分キャッシュ

import { Suspense } from "react";
import { PressableLink } from "@/components/PressableLink";
import SearchBar from "@/components/listings/SearchBar";
import { GENRES } from "@/lib/constants/genres";
import { getCategoryCountsAll } from "@/lib/db/queries/categories";

export default async function DashboardPage() {
  const rows = await getCategoryCountsAll();

  const byGenre = new Map<
    string,
    {
      name: string;
      sort: number;
      categories: { slug: string; name: string; count: number; sort: number }[];
    }
  >();

  for (const g of GENRES) {
    byGenre.set(g.slug, { name: g.name, sort: g.sortOrder, categories: [] });
  }

  for (const row of rows) {
    const entry = byGenre.get(row.genre_slug);
    if (!entry) continue;
    if (row.category_slug && row.category_name && Number(row.listing_count) > 0) {
      entry.categories.push({
        slug: row.category_slug,
        name: row.category_name,
        count: Number(row.listing_count),
        sort: row.category_sort ?? 0,
      });
    }
  }

  for (const entry of byGenre.values()) {
    entry.categories.sort((a, b) => a.sort - b.sort);
  }

  const visibleGenres = Array.from(byGenre.entries()).sort(
    ([, a], [, b]) => a.sort - b.sort,
  );

  return (
    <>
      <Suspense>
        <SearchBar targetPath="/search" />
      </Suspense>
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {visibleGenres.map(([slug, genre]) => (
          <section
            key={slug}
            className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm"
          >
            <PressableLink
              href={`/genres/${slug}`}
              className="block px-4 py-3 text-base font-bold text-white hover:opacity-90 active:opacity-70"
              pendingClassName="block px-4 py-3 text-base font-bold text-white opacity-70"
              style={{ backgroundColor: "#003A66" }}
            >
              {genre.name}
            </PressableLink>
            {genre.categories.length > 0 ? (
              <ul className="divide-y divide-zinc-100">
                {genre.categories.map((cat) => (
                  <li key={cat.slug}>
                    <PressableLink
                      href={`/genres/${slug}?category=${cat.slug}`}
                      className="flex items-center justify-between px-4 py-2 text-sm text-zinc-800 hover:bg-zinc-50 active:bg-zinc-100"
                      pendingClassName="flex items-center justify-between px-4 py-2 text-sm text-zinc-800 bg-zinc-100"
                    >
                      <span>{cat.name}</span>
                      <span className="text-xs text-zinc-500">
                        ({cat.count})
                      </span>
                    </PressableLink>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-4 py-4 text-sm text-zinc-500">
                登録情報はまだありません
              </p>
            )}
          </section>
        ))}
        </div>
      </div>
    </>
  );
}
