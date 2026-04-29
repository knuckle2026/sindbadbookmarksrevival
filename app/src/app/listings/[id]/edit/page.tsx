import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { listGenres } from "@/lib/db/queries/genres";
import { listAllCategoriesWithGenreSlug } from "@/lib/db/queries/categories";
import {
  getListingById,
  getListingCategoryIds,
} from "@/lib/db/queries/listings";
import ListingForm from "../../new/ListingForm";

export const dynamic = "force-dynamic";

function parseJsonArray(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [];
  } catch {
    return [];
  }
}

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/listings/${id}/edit`);

  const listing = await getListingById(id);
  if (!listing) notFound();
  if (listing.user_id !== user.id) redirect(`/listings/${id}`);

  const [selectedCategoryIds, genres, rawCategories] = await Promise.all([
    getListingCategoryIds(id),
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

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <ListingForm
        genres={genres.map((g) => ({ id: g.id, slug: g.slug, name: g.name }))}
        categories={categories}
        mode="edit"
        initialValues={{
          id: listing.id,
          title: listing.title ?? "",
          description: listing.description ?? "",
          websiteUrl: listing.website_url ?? "",
          genreId: listing.genre_id ?? "",
          selectedCategories: selectedCategoryIds,
          prefecture: listing.prefecture ?? "",
          ward: listing.ward ?? "",
          serviceAreas: parseJsonArray(listing.service_areas),
          providerAges: parseJsonArray(listing.provider_ages),
          address: listing.address ?? "",
        }}
      />
    </div>
  );
}
