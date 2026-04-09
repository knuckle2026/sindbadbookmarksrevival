// @ts-nocheck
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GENRES } from "@/lib/constants/genres";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ category?: string }>;
}

export default async function GenrePage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { category: categorySlug } = await searchParams;

  const genreMeta = GENRES.find((g) => g.slug === slug);
  if (!genreMeta) notFound();

  const supabase = await createClient();

  // Resolve genre_id
  const { data: genreRow } = await supabase
    .from("genres")
    .select("id, name, slug")
    .eq("slug", slug)
    .maybeSingle();

  if (!genreRow) notFound();

  // Categories of this genre (for sub-nav)
  const { data: categories } = await supabase
    .from("categories")
    .select("id, slug, name, sort_order")
    .eq("genre_id", genreRow.id)
    .order("sort_order", { ascending: true });

  // Listings: filter by genre, optionally by category via listing_categories join
  let listingIds: string[] | null = null;
  if (categorySlug) {
    const match = (categories ?? []).find((c) => c.slug === categorySlug);
    if (match) {
      const { data: lc } = await supabase
        .from("listing_categories")
        .select("listing_id")
        .eq("category_id", match.id);
      listingIds = (lc ?? []).map((r) => r.listing_id);
      if (listingIds.length === 0) listingIds = ["00000000-0000-0000-0000-000000000000"];
    }
  }

  let query = supabase
    .from("listings")
    .select("id, title, description, website_url, prefecture")
    .eq("genre_id", genreRow.id)
    .eq("status", "published")
    .order("created_at", { ascending: false });
  if (listingIds) {
    query = query.in("id", listingIds);
  }
  const { data: listings } = await query;

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <nav className="mb-2 text-xs text-zinc-500">
        <Link href="/" className="hover:underline">
          ダッシュボード
        </Link>
        <span className="mx-1">/</span>
        <span>{genreRow.name}</span>
      </nav>

      <h1 className="mb-4 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        {genreRow.name}
      </h1>

      {/* Category sub-nav */}
      {categories && categories.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          <Link
            href={`/genres/${slug}`}
            className={`rounded-full border px-3 py-1 text-sm ${
              !categorySlug
                ? "border-red-600 bg-red-600 text-white"
                : "border-zinc-300 bg-white text-zinc-700 hover:border-red-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
            }`}
          >
            すべて
          </Link>
          {categories.map((c) => {
            const active = c.slug === categorySlug;
            return (
              <Link
                key={c.id}
                href={`/genres/${slug}?category=${c.slug}`}
                className={`rounded-full border px-3 py-1 text-sm ${
                  active
                    ? "border-red-600 bg-red-600 text-white"
                    : "border-zinc-300 bg-white text-zinc-700 hover:border-red-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                }`}
              >
                {c.name}
              </Link>
            );
          })}
        </div>
      )}

      {/* Listings */}
      {listings && listings.length > 0 ? (
        <ul className="space-y-3">
          {listings.map((l) => (
            <li
              key={l.id}
              className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
            >
              {l.website_url ? (
                <a
                  href={l.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-base font-semibold text-zinc-900 hover:underline dark:text-zinc-50"
                >
                  {l.title}
                </a>
              ) : (
                <span className="block text-base font-semibold text-zinc-900 dark:text-zinc-50">
                  {l.title}
                </span>
              )}
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                {l.description}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-lg border border-zinc-200 bg-white p-6 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
          登録情報はまだありません
        </p>
      )}
    </div>
  );
}
