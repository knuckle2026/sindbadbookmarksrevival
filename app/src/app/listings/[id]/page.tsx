import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";

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

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: listingRaw } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .single();

  if (!listingRaw) notFound();

  const listing = listingRaw as typeof listingRaw & {
    listing_categories?: { categories: { id: string; name: string; group_type: string } | null }[];
  };

  const { data: lcData } = await supabase
    .from("listing_categories")
    .select("categories(id, name, group_type)")
    .eq("listing_id", id);

  listing.listing_categories = (lcData ?? []) as typeof listing.listing_categories;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isOwner = user?.id === listing.user_id;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const purposeCategories = listing.listing_categories
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ?.filter((lc: any) => lc.categories?.group_type === "purpose")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((lc: any) => lc.categories)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter(Boolean) as { id: string; name: string }[];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const industryCategories = listing.listing_categories
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ?.filter((lc: any) => lc.categories?.group_type === "industry")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((lc: any) => lc.categories)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter(Boolean) as { id: string; name: string }[];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/listings" className="text-sm text-blue-600 hover:underline">
          ← 一覧に戻る
        </Link>
      </div>

      <div className="bg-white border rounded-xl p-6 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900">{listing.title}</h1>
          {isOwner && (
            <Link
              href={`/listings/${listing.id}/edit`}
              className="shrink-0 text-sm border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
            >
              編集
            </Link>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
            {TYPE_LABELS[listing.type]}
          </span>
          {listing.friendliness && (
            <span
              className={`text-sm px-3 py-1 rounded-full ${FRIENDLINESS_COLORS[listing.friendliness]}`}
            >
              {FRIENDLINESS_LABELS[listing.friendliness]}
            </span>
          )}
        </div>

        {listing.description && (
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
            {listing.description}
          </p>
        )}

        {listing.website_url && (
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              ウェブサイト
            </p>
            <a
              href={listing.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline break-all text-sm"
            >
              {listing.website_url}
            </a>
          </div>
        )}

        {listing.address && (
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              所在地
            </p>
            <p className="text-sm text-gray-700">📍 {listing.address}</p>
          </div>
        )}

        {(purposeCategories.length > 0 || industryCategories.length > 0) && (
          <div className="space-y-3 pt-1">
            {purposeCategories.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  目的別カテゴリ
                </p>
                <div className="flex flex-wrap gap-2">
                  {purposeCategories.map((cat) => (
                    <span
                      key={cat.id}
                      className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full"
                    >
                      {cat.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {industryCategories.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  業態別カテゴリ
                </p>
                <div className="flex flex-wrap gap-2">
                  {industryCategories.map((cat) => (
                    <span
                      key={cat.id}
                      className="text-sm bg-green-50 text-green-700 px-3 py-1 rounded-full"
                    >
                      {cat.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="text-xs text-gray-400 pt-3 border-t">
          登録日:{" "}
          {new Date(listing.created_at).toLocaleDateString("ja-JP", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>
    </div>
  );
}
