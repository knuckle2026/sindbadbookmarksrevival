// @ts-nocheck
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ListingForm from "./ListingForm";

export const dynamic = "force-dynamic";

type CategoryRow = {
  id: string;
  slug: string;
  name: string;
  sort_order: number;
  genre_id: string;
  genres: { slug: string } | { slug: string }[] | null;
};

export default async function NewListingPage({
  searchParams,
}: {
  searchParams: Promise<{ genre?: string }>;
}) {
  const { genre: genreSlug } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const newPath = genreSlug
      ? `/listings/new?genre=${genreSlug}`
      : "/listings/new";
    redirect(`/login?next=${encodeURIComponent(newPath)}`);
  }

  const { data: rawCategories } = await supabase
    .from("categories")
    .select("id, slug, name, sort_order, genre_id, genres(slug)")
    .order("sort_order", { ascending: true });

  const categories = ((rawCategories ?? []) as unknown as CategoryRow[]).map(
    (c) => {
      const g = Array.isArray(c.genres) ? c.genres[0] : c.genres;
      return {
        id: c.id,
        slug: c.slug,
        name: c.name,
        sortOrder: c.sort_order,
        genreSlug: g?.slug ?? "",
      };
    },
  );

  const { data: genres } = await supabase
    .from("genres")
    .select("id, slug, name, sort_order")
    .order("sort_order", { ascending: true });

  // ジャンルslugからIDを解決
  let defaultGenreId: string | undefined;
  if (genreSlug) {
    const match = (genres ?? []).find((g) => g.slug === genreSlug);
    if (match) defaultGenreId = match.id;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <ListingForm
        genres={(genres ?? []).map((g) => ({ id: g.id, slug: g.slug, name: g.name }))}
        categories={categories}
        defaultGenreId={defaultGenreId}
      />
    </div>
  );
}
