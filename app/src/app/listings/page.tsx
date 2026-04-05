// @ts-nocheck
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import SearchFilters from "./SearchFilters";

const TYPE_LABELS: Record<string, string> = {
  shop: "店舗",
  organization: "団体・コミュニティ",
  media: "メディア・Webサービス",
};

const FRIENDLINESS_LABELS: Record<string, string> = {
  Dedicated: "専門",
  Friendly: "フレンドリー",
  Ally: "アライ",
};

const FRIENDLINESS_COLORS: Record<string, string> = {
  Dedicated: "bg-purple-100 text-purple-700",
  Friendly: "bg-pink-100 text-pink-700",
  Ally: "bg-indigo-100 text-indigo-700",
};

type SearchParams = {
  q?: string;
  type?: string;
  category?: string;
  friendliness?: string;
};

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("listings")
    .select(
      `id, title, type, description, address, website_url, friendliness, created_at,
       listing_categories(categories(id, name, slug, group_type))`
    )
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (params.q) {
    query = query.or(
      `title.ilike.%${params.q}%,description.ilike.%${params.q}%`
    );
  }
  if (params.type && ["shop", "organization", "media"].includes(params.type)) {
    query = query.eq("type", params.type as "shop" | "organization" | "media");
  }
  if (
    params.friendliness &&
    ["Dedicated", "Friendly", "Ally"].includes(params.friendliness)
  ) {
    query = query.eq(
      "friendliness",
      params.friendliness as "Dedicated" | "Friendly" | "Ally"
    );
  }

  const [{ data: allListings }, { data: categories }] = await Promise.all([
    query,
    supabase.from("categories").select("*").order("sort_order"),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let listings: any[] = allListings ?? [];
  if (params.category) {
    listings = listings.filter((l) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      l.listing_categories?.some((lc: any) => lc.categories?.slug === params.category)
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">登録一覧</h1>
        <Link
          href="/listings/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
        >
          + 情報を登録
        </Link>
      </div>

      <SearchFilters categories={categories ?? []} currentParams={params} />

      <p className="text-sm text-gray-500 mb-4">{listings.length}件</p>

      {listings.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg mb-2">該当する情報がありません</p>
          <p className="text-sm">
            <Link href="/listings/new" className="text-blue-600 hover:underline">
              最初の情報を登録してみましょう
            </Link>
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map((listing) => (
            <Link
              key={listing.id}
              href={`/listings/${listing.id}`}
              className="border rounded-xl p-4 hover:shadow-md transition-shadow bg-white flex flex-col gap-2"
            >
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-semibold text-gray-900 line-clamp-2 flex-1">
                  {listing.title}
                </h2>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full whitespace-nowrap shrink-0">
                  {TYPE_LABELS[listing.type]}
                </span>
              </div>

              {listing.description && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {listing.description}
                </p>
              )}

              <div className="flex flex-wrap gap-1 mt-auto pt-1">
                {listing.friendliness && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${FRIENDLINESS_COLORS[listing.friendliness]}`}
                  >
                    {FRIENDLINESS_LABELS[listing.friendliness]}
                  </span>
                )}
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {listing.listing_categories?.slice(0, 3).map((lc: any) =>
                  lc.categories ? (
                    <span
                      key={lc.categories.id}
                      className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full"
                    >
                      {lc.categories.name}
                    </span>
                  ) : null
                )}
              </div>

              {listing.address && (
                <p className="text-xs text-gray-400">📍 {listing.address}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
