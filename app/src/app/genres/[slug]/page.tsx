import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { GENRES } from "@/lib/constants/genres";
import { PREFECTURE_REGIONS } from "@/lib/constants/prefectures";
import { TOKYO_OUTSIDE_SLUG } from "@/lib/constants/tokyo-wards";
import Pagination from "@/components/listings/Pagination";
import SortSelect, { type SortKey } from "@/components/listings/SortSelect";
import ClickableTitle from "@/components/listings/ClickableTitle";
import ReportButton from "@/components/listings/ReportButton";
import SearchBar from "@/components/listings/SearchBar";
import { getGenreBySlug } from "@/lib/db/queries/genres";
import { listCategoriesByGenre } from "@/lib/db/queries/categories";
import {
  getAllPublishedListingIds,
  getCategoriesForListings,
  getListingIdsByCategories,
  getPrefectureCounts,
  getServiceAreasJson,
  getWardCountsTokyo,
  searchGenreListings,
  type SortKey as DbSortKey,
} from "@/lib/db/queries/listings";
import GenreFilters from "./GenreFilters";
import RegionPrefectureNav from "./RegionPrefectureNav";
import ServiceAreaFilter from "./ServiceAreaFilter";
import ProviderAgeFilter from "./ProviderAgeFilter";
import TokyoWardFilter from "./TokyoWardFilter";

export const revalidate = 60;

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
    ward?: string;
    page?: string;
    q?: string;
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
    ward: wardParam,
    page: pageParam,
    q: qParam,
  } = await searchParams;
  const keyword = (qParam ?? "").trim();
  const currentPage = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const validSorts: SortKey[] = [
    "created_desc",
    "created_asc",
    "updated_desc",
    "updated_asc",
    "title_asc",
    "title_desc",
    "popular",
  ];
  const currentSort: SortKey = validSorts.includes(sortParam as SortKey)
    ? (sortParam as SortKey)
    : "created_desc";

  const genreMeta = GENRES.find((g) => g.slug === slug);
  if (!genreMeta) notFound();

  if (genreMeta.hasPrefecture && !regionParam && !prefectureParam) {
    const p = new URLSearchParams();
    p.set("prefecture", "tokyo");
    if (categoryParam) p.set("category", categoryParam);
    if (serviceAreaParam) p.set("service_area", serviceAreaParam);
    if (sortParam) p.set("sort", sortParam);
    if (excludeNhParam) p.set("exclude_nh", excludeNhParam);
    if (providerAgeParam) p.set("provider_age", providerAgeParam);
    if (wardParam) p.set("ward", wardParam);
    if (pageParam) p.set("page", pageParam);
    if (keyword) p.set("q", keyword);
    redirect(`/genres/${slug}?${p.toString()}`);
  }

  const genreRow = await getGenreBySlug(slug);
  if (!genreRow) notFound();

  const [categories, prefCountMap, svcJsonRows, wardCountRawMap] =
    await Promise.all([
      listCategoriesByGenre(genreRow.id),
      genreMeta.hasPrefecture
        ? getPrefectureCounts(genreRow.id)
        : Promise.resolve({} as Record<string, number>),
      genreMeta.hasServiceAreas
        ? getServiceAreasJson(genreRow.id)
        : Promise.resolve<string[]>([]),
      genreMeta.hasPrefecture && prefectureParam === "tokyo"
        ? getWardCountsTokyo(genreRow.id)
        : Promise.resolve({} as Record<string, number>),
    ]);

  const areaCountMap: Record<string, number> = {};
  let serviceListingCount = 0;
  for (const json of svcJsonRows) {
    let arr: unknown;
    try {
      arr = JSON.parse(json);
    } catch {
      continue;
    }
    if (!Array.isArray(arr) || arr.length === 0) continue;
    serviceListingCount++;
    for (const v of arr) {
      if (typeof v === "string") areaCountMap[v] = (areaCountMap[v] ?? 0) + 1;
    }
  }

  const wardCountMap: Record<string, number> = {};
  for (const [k, v] of Object.entries(wardCountRawMap)) {
    wardCountMap[k === "__null" ? TOKYO_OUTSIDE_SLUG : k] = v;
  }

  const selectedRegion = regionParam
    ? PREFECTURE_REGIONS.find((r) => r.slug === regionParam)
    : null;

  const selectedCategorySlugs = (categoryParam ?? "")
    .split(",")
    .filter(Boolean);

  const isMassage = slug === "massage-urisen";
  const newhalfCat = isMassage
    ? categories.find((c) => c.slug === "newhalf")
    : null;
  const excludeNhActive = excludeNhParam === "1";

  let excludeNewhalfIds = new Set<string>();
  if (isMassage && newhalfCat && excludeNhActive) {
    excludeNewhalfIds = new Set(
      await getListingIdsByCategories([newhalfCat.id])
    );
  }

  let listingIds: string[] | null = null;
  if (selectedCategorySlugs.length > 0) {
    const matchedCats = categories.filter((c) =>
      selectedCategorySlugs.includes(c.slug)
    );
    if (matchedCats.length > 0) {
      let ids = await getListingIdsByCategories(matchedCats.map((c) => c.id));
      if (excludeNewhalfIds.size > 0) {
        ids = ids.filter((id) => !excludeNewhalfIds.has(id));
      }
      listingIds = ids.length > 0 ? ids : ["__none__"];
    }
  } else if (isMassage && excludeNhActive && excludeNewhalfIds.size > 0) {
    const allIds = await getAllPublishedListingIds(genreRow.id);
    const ids = allIds.filter((id) => !excludeNewhalfIds.has(id));
    listingIds = ids.length > 0 ? ids : ["__none__"];
  }

  const prefectureFilter = prefectureParam ?? "";
  const regionPrefectureSlugs = selectedRegion
    ? selectedRegion.prefectures.map((p) => p.slug)
    : null;
  const prefectures = prefectureFilter
    ? [prefectureFilter]
    : regionPrefectureSlugs;

  const selectedServiceAreas = (serviceAreaParam ?? "")
    .split(",")
    .filter(Boolean);
  const selectedProviderAges = (providerAgeParam ?? "")
    .split(",")
    .filter(Boolean);

  const selectedWardsRaw = (wardParam ?? "").split(",").filter(Boolean);
  const wardFilterActive =
    prefectureFilter === "tokyo" && selectedWardsRaw.length > 0;
  const wardIncludesOutside = selectedWardsRaw.includes(TOKYO_OUTSIDE_SLUG);
  const wardSpecificSlugs = selectedWardsRaw.filter(
    (w) => w !== TOKYO_OUTSIDE_SLUG
  );

  const from = (currentPage - 1) * PER_PAGE;
  const { rows: listings, total: totalCount } = await searchGenreListings({
    genreId: genreRow.id,
    sort: currentSort as DbSortKey,
    limit: PER_PAGE,
    offset: from,
    listingIds,
    prefectures,
    serviceAreas: selectedServiceAreas.length > 0 ? selectedServiceAreas : null,
    providerAges: selectedProviderAges.length > 0 ? selectedProviderAges : null,
    wardSpecific: wardFilterActive && wardSpecificSlugs.length > 0
      ? wardSpecificSlugs
      : null,
    wardIncludesNull: wardFilterActive ? wardIncludesOutside : false,
    keyword: keyword || null,
  });

  const catMap = await getCategoriesForListings(listings.map((l) => l.id));

  const totalPages = Math.max(1, Math.ceil(totalCount / PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);

  const extraParams: Record<string, string> = {};
  if (categoryParam) extraParams.category = categoryParam;
  if (regionParam) extraParams.region = regionParam;
  if (prefectureFilter) extraParams.prefecture = prefectureFilter;
  if (serviceAreaParam) extraParams.service_area = serviceAreaParam;
  if (currentSort !== "created_desc") extraParams.sort = currentSort;
  if (excludeNhParam === "1") extraParams.exclude_nh = "1";
  if (providerAgeParam) extraParams.provider_age = providerAgeParam;
  if (wardParam) extraParams.ward = wardParam;
  if (keyword) extraParams.q = keyword;

  return (
    <>
      <Suspense>
        <SearchBar />
      </Suspense>

      <div className="mx-auto max-w-5xl px-6 py-8">
        <Suspense>
          <GenreFilters
            slug={slug}
            categories={categories.map((c) => ({
              id: c.id,
              slug: c.slug,
              name: c.name,
            }))}
          />
        </Suspense>

      {genreMeta.hasProviderAges && (
        <Suspense>
          <ProviderAgeFilter />
        </Suspense>
      )}

      {genreMeta.hasPrefecture && (
        <>
          <RegionPrefectureNav
            slug={slug}
            prefCountMap={prefCountMap}
            selectedRegion={regionParam ?? null}
            selectedPrefecture={prefectureFilter}
            categoryParam={categoryParam ?? ""}
            serviceAreaParam={serviceAreaParam ?? ""}
          />
          {prefectureFilter === "tokyo" && (
            <TokyoWardFilter wardCountMap={wardCountMap} />
          )}
        </>
      )}

      {genreMeta.hasServiceAreas && (
        <Suspense>
          <ServiceAreaFilter
            serviceListingCount={serviceListingCount}
            areaCountMap={areaCountMap}
          />
        </Suspense>
      )}

      <SortSelect
        currentSort={currentSort}
        basePath={`/genres/${slug}`}
        extraParams={extraParams}
      />

        {listings.length > 0 ? (
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
                    <p className="mt-1 text-sm text-zinc-600">{l.description}</p>
                  )}
                  {(catMap[l.id]?.length ?? 0) > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {catMap[l.id].map((c) => (
                        <span
                          key={c.id}
                          className="rounded-full bg-red-50 px-2 py-0.5 text-xs"
                          style={{ color: "#B21000" }}
                        >
                          {c.name}
                        </span>
                      ))}
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
    </>
  );
}
