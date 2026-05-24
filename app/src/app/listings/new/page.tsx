import { listGenres } from "@/lib/db/queries/genres";
import { listAllCategoriesWithGenreSlug } from "@/lib/db/queries/categories";
import ListingForm from "./ListingForm";

export const dynamic = "force-dynamic";

export default async function NewListingPage({
  searchParams,
}: {
  searchParams: Promise<{ genre?: string; from?: string }>;
}) {
  const { genre: genreSlug, from: fromParam } = await searchParams;

  const [genres, rawCategories] = await Promise.all([
    listGenres(),
    listAllCategoriesWithGenreSlug(),
  ]);

  const categories = rawCategories.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    sortOrder: c.sort_order,
    genreSlug: c.genre_slug,
  }));

  let defaultGenreId: string | undefined;
  if (genreSlug) {
    const match = genres.find((g) => g.slug === genreSlug);
    if (match) defaultGenreId = match.id;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <ListingForm
        genres={genres.map((g) => ({ id: g.id, slug: g.slug, name: g.name }))}
        categories={categories}
        defaultGenreId={defaultGenreId}
        cancelHref={fromParam}
      />
    </div>
  );
}
