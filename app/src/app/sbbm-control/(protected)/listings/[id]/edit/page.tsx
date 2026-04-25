import { notFound } from "next/navigation";
import {
  getListingById,
  getListingCategoryIds,
} from "@/lib/db/queries/listings";
import {
  listAllCategoriesWithGenre,
} from "@/lib/db/queries/categories";
import { listGenres } from "@/lib/db/queries/genres";
import ListingForm from "@/app/listings/new/ListingForm";

export const dynamic = "force-dynamic";

export default async function AdminEditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [listing, selectedCategoryIds, allCategories, genres] = await Promise.all([
    getListingById(id),
    getListingCategoryIds(id),
    listAllCategoriesWithGenre(),
    listGenres(),
  ]);

  if (!listing) notFound();

  const categories = allCategories.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    sortOrder: c.sort_order,
    genreSlug: c.genre_slug,
  }));

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold text-zinc-900">
        Edit Listing (Admin)
      </h1>
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
          serviceAreas: listing.service_areas
            ? (JSON.parse(listing.service_areas) as string[])
            : [],
          providerAges: listing.provider_ages
            ? (JSON.parse(listing.provider_ages) as string[])
            : [],
          address: listing.address ?? "",
        }}
        redirectTo="/sbbm-control/listings"
      />
    </div>
  );
}
