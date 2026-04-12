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
import GenreFilters from "./GenreFilters";
import RegionPrefectureNav from "./RegionPrefectureNav";
import ServiceAreaFilter from "./ServiceAreaFilter";

export const dynamic = "force-dynamic";

const PER_PAGE = 20;

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    category?: string;
    prefecture?: string;
    service_area?: string;
    region?: string;
    sort?: string;
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

  // Categories of this genre
  const { data: categories } = await supabase
    .from("categories")
    .select("id, slug, name, sort_order")
    .eq("genre_id", genreRow.id)
    .order("sort_order", { ascending: true });

  // === Prefecture counts (hasPrefecture ジャンルのみ) ===
  let prefCountMap: Record<string, number> = {};
  if (genreMeta.hasPrefecture) {
    const { data: prefCounts } = await supabase
      .from("listings")
      .select("prefecture")
      .eq("genre_id", genreRow.id)
      .eq("status", "published")
      .not("prefecture", "is", null);

    (prefCounts ?? []).forEach((row) => {
      const p = row.prefecture;
      if (p) prefCountMap[p] = (prefCountMap[p] ?? 0) + 1;
    });
  }

  // === 出張サービス件数 (マッサージ・売り専のみ) ===
  let serviceListingCount = 0;
  if (genreMeta.hasServiceAreas) {
    const { count: svcCount } = await supabase
      .from("listings")
      .select("id", { count: "exact", head: true })
      .eq("genre_id", genreRow.id)
      .eq("status", "published")
      .not("service_areas", "is", null)
      .neq("service_areas", "{}");
    serviceListingCount = svcCount ?? 0;
  }

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
  const newhalfExplicitlySelected = selectedCategorySlugs.includes("newhalf");

  // ニューハーフ除外対象IDを取得（マッサージ & ニューハーフ未選択時に使用）
  let excludeNewhalfIds: Set<string> = new Set();
  if (isMassage && newhalfCat && !newhalfExplicitlySelected) {
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
  } else if (isMassage && excludeNewhalfIds.size > 0) {
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
  const { count } = await countQuery;

  const totalCount = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const from = (safePage - 1) * PER_PAGE;
  const to = from + PER_PAGE - 1;

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

  let query = supabase
    .from("listings")
    .select("id, title, description, website_url, prefecture")
    .eq("genre_id", genreRow.id)
    .eq("status", "published")
    .order(sortColumn, { ascending: sortAsc })
    .range(from, to);
  if (listingIds) query = query.in("id", listingIds);
  if (prefectureFilter) {
    query = query.eq("prefecture", prefectureFilter);
  } else if (regionPrefectureSlugs) {
    query = query.in("prefecture", regionPrefectureSlugs);
  }
  if (selectedServiceAreas.length > 0)
    query = query.overlaps("service_areas", selectedServiceAreas);
  const { data: listings } = await query;

  // extraParams for pagination links
  const extraParams: Record<string, string> = {};
  if (categoryParam) extraParams.category = categoryParam;
  if (regionParam) extraParams.region = regionParam;
  if (prefectureFilter) extraParams.prefecture = prefectureFilter;
  if (serviceAreaParam) extraParams.service_area = serviceAreaParam;
  if (currentSort !== "created_desc") extraParams.sort = currentSort;

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <nav className="mb-2 text-xs text-zinc-500">
        <Link href="/" className="hover:underline">
          ダッシュボード
        </Link>
        <span className="mx-1">/</span>
        <span>{genreRow.name}</span>
      </nav>

      <h1 className="mb-4 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        {genreRow.name}
      </h1>

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
          <ServiceAreaFilter serviceListingCount={serviceListingCount} />
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
                className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <ClickableTitle
                  listingId={l.id}
                  title={l.title}
                  websiteUrl={l.website_url}
                />
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                  {l.description}
                </p>
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
        <p className="rounded-lg border border-zinc-200 bg-white p-6 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
          登録情報はまだありません
        </p>
      )}
    </div>
  );
}
