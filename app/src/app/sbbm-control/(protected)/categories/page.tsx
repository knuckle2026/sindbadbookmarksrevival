// @ts-nocheck
import { getAdminClient } from "@/lib/supabase/admin";
import { GENRES } from "@/lib/constants/genres";
import CategoryManager from "./CategoryManager";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ genre?: string }>;
}

export default async function AdminCategoriesPage({ searchParams }: PageProps) {
  const { genre: genreSlug } = await searchParams;
  const selectedSlug = genreSlug || GENRES[0].slug;

  const { supabase } = await getAdminClient();

  // Get all genres from DB
  const { data: genres } = await supabase
    .from("genres")
    .select("id, slug, name")
    .order("sort_order", { ascending: true });

  // Get categories for selected genre
  const selectedGenre = (genres ?? []).find((g) => g.slug === selectedSlug);
  let categories: { id: string; slug: string; name: string; sort_order: number }[] = [];

  if (selectedGenre) {
    const { data: cats } = await supabase
      .from("categories")
      .select("id, slug, name, sort_order")
      .eq("genre_id", selectedGenre.id)
      .order("sort_order", { ascending: true });
    categories = cats ?? [];
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="mb-6 text-2xl font-bold text-zinc-900">Category Management</h1>

      {/* Genre selector tabs */}
      <div className="mb-6 flex flex-wrap gap-1 rounded-lg border border-zinc-200 bg-white p-1">
        {(genres ?? []).map((g) => (
          <a
            key={g.slug}
            href={`/sbbm-control/categories?genre=${g.slug}`}
            className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
              g.slug === selectedSlug
                ? "bg-zinc-900 text-white"
                : "text-zinc-600 hover:bg-zinc-100"
            }`}
          >
            {g.name}
          </a>
        ))}
      </div>

      {/* Category manager */}
      {selectedGenre ? (
        <CategoryManager
          genreId={selectedGenre.id}
          genreSlug={selectedGenre.slug}
          genreName={selectedGenre.name}
          initialCategories={categories}
        />
      ) : (
        <p className="text-sm text-zinc-500">Genre not found</p>
      )}
    </div>
  );
}
