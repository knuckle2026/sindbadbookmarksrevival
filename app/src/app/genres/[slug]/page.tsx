// @ts-nocheck
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GENRES } from "@/lib/constants/genres";
import { PREFECTURE_REGIONS } from "@/lib/constants/prefectures";
import Pagination from "@/components/listings/Pagination";
import SortSelect, { type SortKey } from "@/components/listings/SortSelect";
import ClickableTitle from "@/components/listings/ClickableTitle";
import ReportButton from "@/components/listings/ReportButton";
import GenreFilters from "./GenreFilters";
import RegionPrefectureNav from "./RegionPrefectureNav";
import ServiceAreaFilter from "./ServiceAreaFilter";
import ProviderAgeFilter from "./ProviderAgeFilter";

export const revalidate = 60; // 1分キャッシュ

const PER_PAGE = 20;

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    category?: string;
    prefecture?: string;
    service_area?: string;
    region?: string;
    sort?: string;
    exclude_nh?: string;
    provider_age?: string;
    page?: string;
  }>;
}

export default async function GenrePage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const {
    category: categoryParam,
    prefecture: prefectureParam,
    service_area: serviceAreaParam,
    region: regionParam,
    sort: sortParam,
    exclude_nh: excludeNhParam,
    provider_age: providerAgeParam,
    page: pageParam,
  } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  // Resolve sort key
  const validSorts: SortKey[] = [
    "created_desc", "created_asc", "updated_desc", "updated_asc",
    "title_asc", "title_desc", "popular",
  ];
  const currentSort: SortKey = validSorts.includes(sortParam as SortKey)
    ? (sortParam as SortKey)
    : "created_desc";

  const genreMeta = GENRES.find((g) => g.slug === slug);
  if (!genreMeta) notFound();

  const supabase = await createClient();

  // Resolve genre_id
  const { data: genreRow } = await supabase
    .from("genres")
    .select("id, name, slug")
    .eq("slug", slug)
    .maybeSingle();

  if (!genreRow) notFound();

  // === 並列クエリ: カテゴリ・都道府県件数・出張エリア件数を同時取得 ===
  const [
    { data: categories },
    { data: prefCounts },
    { data: svcListings },
  ] = await Promise.all([
    // Categories of this genre
    supabase
      .from("categories")
      .select("id, slug, name, sort_order")
      .eq("genre_id", genreRow.id)
      .order("sort_order", { ascending: true }),
    // Prefecture counts (hasPrefecture ジャンルのみ)
    genreMeta.hasPrefecture
      ? supabase
          .from("listings")
          .select("prefecture")
          .eq("genre_id", genreRow.id)
          .eq("status", "published")
          .not("prefecture", "is", null)
      : Promise.resolve({ data: null }),
    // 出張サービス件数 (マッサージ・売り専のみ)
    genreMeta.hasServiceAreas
      ? supabase
          .from("listings")
          .select("service_areas")
          .eq("genre_id", genreRow.id)
          .eq("status", "published")
          .not("service_areas", "is", null)
      : Promise.resolve({ data: null }),
  ]);

  // 都道府県カウント集計
  const prefCountMap: Record<string, number> = {};
  (prefCounts ?? []).forEach((row) => {
    const p = row.prefecture;
    if (p) prefCountMap[p] = (prefCountMap[p] ?? 0) + 1;
  });

  // 出張エリアカウント集計
  const validListings = (svcListings ?? []).filter(
    (r) => r.service_areas && r.service_areas.length > 0,
  );
  const serviceListingCount = validListings.length;
  const areaCountMap: Record<string, number> = {};
  validListings.forEach((r) => {
    (r.service_areas as string[]).forEach((area) => {
      areaCountMap[area] = (areaCountMap[area] ?? 0) + 1;
    });
  });

  // === Region resolution ===
  const selectedRegion = regionParam
    ? PREFECTURE_REGIONS.find((r) => r.slug === regionParam)
    : null;

  // === フィルタ処理 ===

  // 1. カテゴリフィルタ (OR検索、ニューハーフマッサージ除外の特殊ルール)
  const selectedCategorySlugs = (categoryParam ?? "")
    .split(",")
    .filter(Boolean);

  let listingIds: string[] | null = null;
  const isMassage = slug === "massage-urisen";
  const newhalfCat = isMassage
    ? (categories ?? []).find((c) => c.slug === "newhalf")
    : null;
  const excludeNhActive = excludeNhParam === "1";

  // ニューハーフ除外対象IDを取得（exclude_nh=1 のときのみ）
  let excludeNewhalfIds: Set<string> = new Set();
  if (isMassage && newhalfCat && excludeNhActive) {
    const { data: nhLc } = await supabase
      .from("listing_categories")
      .select("listing_id")
      .eq("category_id", newhalfCat.id);
    excludeNewhalfIds = new Set((nhLc ?? []).map((r) => r.listing_id));
  }

  if (selectedCategorySlugs.length > 0) {
    const matchedCats = (categories ?? []).filter((c) =>
      selectedCategorySlugs.includes(c.slug),
    );
    if (matchedCats.length > 0) {
      const { data: lc } = await supabase
        .from("listing_categories")
        .select("listing_id")
        .in(
          "category_id",
          matchedCats.map((c) => c.id),
        );
      let ids = [...new Set((lc ?? []).map((r) => r.listing_id))];
      if (excludeNewhalfIds.size > 0) {
        ids = ids.filter((id) => !excludeNewhalfIds.has(id));
      }
      listingIds = ids.length > 0 ? ids : ["00000000-0000-0000-0000-000000000000"];
    }
  } else if (isMassage && excludeNhActive && excludeNewhalfIds.size > 0) {
    const { data: allListings } = await supabase
      .from("listings")
      .select("id")
      .eq("genre_id", genreRow.id)
      .eq("status", "published");
    const ids = (allListings ?? [])
      .map((l) => l.id)
      .filter((id) => !excludeNewhalfIds.has(id));
    listingIds = ids.length > 0 ? ids : ["00000000-0000-0000-0000-000000000000"];
  }

  // 2. 都道府県 / 地方フィルタ
  const prefectureFilter = prefectureParam ?? "";
  const regionPrefectureSlugs = selectedRegion
    ? selectedRegion.prefectures.map((p) => p.slug)
    : null;

  // 3. 出張エリアフィルタ
  const selectedServiceAreas = (serviceAreaParam ?? "")
    .split(",")
    .filter(Boolean);

  // 4. サービス提供者の年代フィルタ
  const selectedProviderAges = (providerAgeParam ?? "")
    .split(",")
    .filter(Boolean);

  // === クエリ構築 ===

  // 総件数
  let countQuery = supabase
    .from("listings")
    .select("id", { count: "exact", head: true })
    .eq("genre_id", genreRow.id)
    .eq("status", "published");
  if (listingIds) countQuery = countQuery.in("id", listingIds);
  if (prefectureFilter) {
    countQuery = countQuery.eq("prefecture", prefectureFilter);
  } else if (regionPrefectureSlugs) {
    countQuery = countQuery.in("prefecture", regionPrefectureSlugs);
  }
  if (selectedServiceAreas.length > 0)
    countQuery = countQuery.overlaps("service_areas", selectedServiceAreas);
  if (selectedProviderAges.length > 0)
    countQuery = countQuery.overlaps("provider_ages", selectedProviderAges);

  // Sort mapping
  const sortConfig: Record<SortKey, { column: string; ascending: boolean }> = {
    created_desc: { column: "created_at", ascending: false },
    created_asc: { column: "created_at", ascending: true },
    updated_desc: { column: "updated_at", ascending: false },
    updated_asc: { column: "updated_at", ascending: true },
    title_asc: { column: "title", ascending: true },
    title_desc: { column: "title", ascending: false },
    popular: { column: "click_count", ascending: false },
  };
  const { column: sortColumn, ascending: sortAsc } = sortConfig[currentSort];

  // currentPage ベースで range を先に計算（件数超過時は空結果になるだけ）
  const from = (currentPage - 1) * PER_PAGE;
  const to = from + PER_PAGE - 1;

  let listingsQuery = supabase
    .from("listings")
    .select("id, title, description, website_url, prefecture, listing_categories(categories(id, name))")
    .eq("genre_id", genreRow.id)
    .eq("status", "published")
    .order(sortColumn, { ascending: sortAsc })
    .range(from, to);
  if (listingIds) listingsQuery = listingsQuery.in("id", listingIds);
  if (prefectureFilter) {
    listingsQuery = listingsQuery.eq("prefecture", prefectureFilter);
  } else if (regionPrefectureSlugs) {
    listingsQuery = listingsQuery.in("prefecture", regionPrefectureSlugs);
  }
  if (selectedServiceAreas.length > 0)
    listingsQuery = listingsQuery.overlaps("service_areas", selectedServiceAreas);
  if (selectedProviderAges.length > 0)
    listingsQuery = listingsQuery.overlaps("provider_ages", selectedProviderAges);

  // === 並列クエリ: 件数とリスティングを同時取得 ===
  const [{ count }, { data: listings }] = await Promise.all([
    countQuery,
    listingsQuery,
  ]);

  const totalCount = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);

  // extraParams for pagination links
  const extraParams: Record<string, string> = {};
  if (categoryParam) extraParams.category = categoryParam;
  if (regionParam) extraParams.region = regionParam;
  if (prefectureFilter) extraParams.prefecture = prefectureFilter;
  if (serviceAreaParam) extraParams.service_area = serviceAreaParam;
  if (currentSort !== "created_desc") extraParams.sort = currentSort;
  if (excludeNhParam === "1") extraParams.exclude_nh = "1";
  if (providerAgeParam) extraParams.provider_age = providerAgeParam;

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">

      {/* 1. カテゴリ絞り込み */}
      <Suspense>
        <GenreFilters
          slug={slug}
          categories={(categories ?? []).map((c) => ({
            id: c.id,
            slug: c.slug,
            name: c.name,
          }))}
        />
      </Suspense>

      {/* 1.5 サービス提供者の年代 (マッサージ・売り専のみ) */}
      {genreMeta.hasProviderAges && (
        <Suspense>
          <ProviderAgeFilter />
        </Suspense>
      )}

      {/* 2. 所在地絞り込み (hasPrefecture ジャンルのみ) */}
      {genreMeta.hasPrefecture && (
        <RegionPrefectureNav
          slug={slug}
          prefCountMap={prefCountMap}
          selectedRegion={regionParam ?? null}
          selectedPrefecture={prefectureFilter}
          categoryParam={categoryParam ?? ""}
          serviceAreaParam={serviceAreaParam ?? ""}
        />
      )}

      {/* 3. 出張サービス (マッサージ・売り専のみ) */}
      {genreMeta.hasServiceAreas && (
        <Suspense>
          <ServiceAreaFilter serviceListingCount={serviceListingCount} areaCountMap={areaCountMap} />
        </Suspense>
      )}

      {/* 並び順 */}
      <SortSelect
        currentSort={currentSort}
        basePath={`/genres/${slug}`}
        extraParams={extraParams}
      />

      {/* Listings */}
      {listings && listings.length > 0 ? (
        <>
          <p className="mb-3 text-sm text-zinc-500">
            {totalCount}件の登録情報
          </p>
          <ul className="space-y-3">
            {listings.map((l) => (
              <li
                key={l.id}
                className="rounded-lg border border-zinc-200 bg-white p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <ClickableTitle
                    listingId={l.id}
                    title={l.title}
                    websiteUrl={l.website_url}
                  />
                  <ReportButton listingId={l.id} listingTitle={l.title} variant="card" />
                </div>
                {l.description && (
                  <p className="mt-1 text-sm text-zinc-600">
                    {l.description}
                  </p>
                )}
                {l.listing_categories?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {l.listing_categories.map((lc) =>
                      lc.categories ? (
                        <span
                          key={lc.categories.id}
                          className="rounded-full bg-red-50 px-2 py-0.5 text-xs"
                          style={{ color: "#B21000" }}
                        >
                          {lc.categories.name}
                        </span>
                      ) : null
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
          <Pagination
            currentPage={safePage}
            totalPages={totalPages}
            basePath={`/genres/${slug}`}
            extraParams={extraParams}
          />
        </>
      ) : (
        <p className="rounded-lg border border-zinc-200 bg-white p-6 text-center text-sm text-zinc-500">
          登録情報はまだありません
        </p>
      )}
    </div>
  );
}
