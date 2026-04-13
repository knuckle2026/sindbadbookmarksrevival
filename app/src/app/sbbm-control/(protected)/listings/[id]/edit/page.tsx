// @ts-nocheck
import { notFound } from "next/navigation";
import { getAdminClient } from "@/lib/supabase/admin";
import ListingForm from "@/app/listings/new/ListingForm";

export const dynamic = "force-dynamic";

type CategoryRow = {
  id: string;
  slug: string;
  name: string;
  sort_order: number;
  genre_id: string;
  genres: { slug: string } | { slug: string }[] | null;
};

export default async function AdminEditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase } = await getAdminClient();

  // Admin can edit any listing (RLS allows via admin policy)
  const { data: listing } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .single();

  if (!listing) notFound();

  // Get existing category selections
  const { data: existingCats } = await supabase
    .from("listing_categories")
    .select("category_id")
    .eq("listing_id", id);

  const selectedCategoryIds = (existingCats ?? []).map((c: any) => c.category_id);

  // Get all categories
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
    }
  );

  // Get all genres
  const { data: genres } = await supabase
    .from("genres")
    .select("id, slug, name, sort_order")
    .order("sort_order", { ascending: true });

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold text-zinc-900">
        Edit Listing (Admin)
      </h1>
      <ListingForm
        genres={(genres ?? []).map((g) => ({ id: g.id, slug: g.slug, name: g.name }))}
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
          serviceAreas: listing.service_areas ?? [],
          providerAges: listing.provider_ages ?? [],
          address: listing.address ?? "",
        }}
        redirectTo="/sbbm-control/listings"
      />
    </div>
  );
}
