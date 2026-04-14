// @ts-nocheck
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ListingForm from "../../new/ListingForm";

export const dynamic = "force-dynamic";

type CategoryRow = {
  id: string;
  slug: string;
  name: string;
  sort_order: number;
  genre_id: string;
  genres: { slug: string } | { slug: string }[] | null;
};

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

  if (!user) {
    redirect(`/login?next=/listings/${id}/edit`);
  }

  // 既存のリスティングを取得
  const { data: listing } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .single();

  if (!listing) notFound();

  // オーナーのみ編集可
  if (listing.user_id !== user.id) {
    redirect(`/listings/${id}`);
  }

  // 既存のカテゴリ選択を取得
  const { data: existingCats } = await supabase
    .from("listing_categories")
    .select("category_id")
    .eq("listing_id", id);

  const selectedCategoryIds = (existingCats ?? []).map((c: any) => c.category_id);

  // カテゴリ一覧を取得
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

  // ジャンル一覧を取得
  const { data: genres } = await supabase
    .from("genres")
    .select("id, slug, name, sort_order")
    .order("sort_order", { ascending: true });

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold text-zinc-900">
        登録情報の編集
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
      />
    </div>
  );
}
