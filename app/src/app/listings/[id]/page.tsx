import Link from "next/link";
import { notFound } from "next/navigation";
import { PREFECTURE_REGIONS } from "@/lib/constants/prefectures";
import { TOKYO_WARDS } from "@/lib/constants/tokyo-wards";
import { SERVICE_AREA_MAP } from "@/lib/constants/service-areas";
import ReportButton from "@/components/listings/ReportButton";
import { getDB } from "@/lib/db/client";
import {
  getCategoriesForListings,
  getListingById,
} from "@/lib/db/queries/listings";
import type { GenreRow } from "@/lib/db/types";

function prefectureName(slug: string | null): string | null {
  if (!slug) return null;
  for (const r of PREFECTURE_REGIONS) {
    const p = r.prefectures.find((p) => p.slug === slug);
    if (p) return p.name;
  }
  return slug;
}

function wardName(slug: string | null): string | null {
  if (!slug) return null;
  return TOKYO_WARDS.find((w) => w.slug === slug)?.name ?? slug;
}

function parseJsonArray(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [];
  } catch {
    return [];
  }
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const listing = await getListingById(id);
  if (!listing) notFound();

  const db = await getDB();
  const genre = listing.genre_id
    ? await db
        .prepare("SELECT * FROM genres WHERE id = ?")
        .bind(listing.genre_id)
        .first<GenreRow>()
    : null;

  const catMap = await getCategoriesForListings([id]);
  const categoryNames = (catMap[id] ?? []).map((c) => c.name);

  const pref = prefectureName(listing.prefecture);
  const w = wardName(listing.ward);
  const serviceAreaNames = parseJsonArray(listing.service_areas).map(
    (s) => SERVICE_AREA_MAP[s] ?? s
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        {genre ? (
          <Link href={`/genres/${genre.slug}`} className="text-sm text-blue-600 hover:underline">
            ← {genre.name}一覧に戻る
          </Link>
        ) : (
          <Link href="/" className="text-sm text-blue-600 hover:underline">
            ← トップに戻る
          </Link>
        )}
      </div>

      <div className="bg-white border rounded-xl p-6 space-y-5">
        <h1 className="text-2xl font-bold text-gray-900">{listing.title}</h1>

        {genre && (
          <div className="flex flex-wrap gap-2">
            <span className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
              {genre.name}
            </span>
          </div>
        )}

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

        {(pref || listing.address) && (
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              所在地
            </p>
            <p className="text-sm text-gray-700">
              {[pref, w, listing.address].filter(Boolean).join(" ")}
            </p>
          </div>
        )}

        {serviceAreaNames.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              出張エリア
            </p>
            <div className="flex flex-wrap gap-2">
              {serviceAreaNames.map((name) => (
                <span key={name} className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                  {name}
                </span>
              ))}
            </div>
          </div>
        )}

        {categoryNames.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              カテゴリ
            </p>
            <div className="flex flex-wrap gap-2">
              {categoryNames.map((name) => (
                <span
                  key={name}
                  className="text-sm bg-green-50 text-green-700 px-3 py-1 rounded-full"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t">
          <div className="text-xs text-gray-400">
            登録日:{" "}
            {new Date(listing.created_at).toLocaleDateString("ja-JP", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
          <ReportButton listingId={listing.id} listingTitle={listing.title} variant="detail" />
        </div>
      </div>
    </div>
  );
}
