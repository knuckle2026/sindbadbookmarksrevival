import { Suspense } from "react";
import { notFound } from "next/navigation";
import { GENRES } from "@/lib/constants/genres";
import { PREFECTURE_REGIONS } from "@/lib/constants/prefectures";
import { TOKYO_OUTSIDE_SLUG } from "@/lib/constants/tokyo-wards";
import { OSAKA_OUTSIDE_SLUG } from "@/lib/constants/osaka-areas";
import Pagination from "@/components/listings/Pagination";
import SortSelect, { type SortKey } from "@/components/listings/SortSelect";
import ClickableTitle from "@/components/listings/ClickableTitle";
import ReportButton from "@/components/listings/ReportButton";
import SearchBar from "@/components/listings/SearchBar";
import { getGenreBySlug } from "@/lib/db/queries/genres";
import { listCategoriesByGenre } from "@/lib/db/queries/categories";
import {
  countGenreListings,
  getCategoriesForListings,
  getPrefectureCounts,
  getServiceAreasJson,
  getWardCounts,
  searchGenreListings,
  type SortKey as DbSortKey,
} from "@/lib/db/queries/listings";
import GenreFilters from "./GenreFilters";
import RegionPrefectureNav from "./RegionPrefectureNav";
import ServiceAreaFilter from "./ServiceAreaFilter";
import ProviderAgeFilter from "./ProviderAgeFilter";
import TokyoWardFilter from "./TokyoWardFilter";
import OsakaAreaFilter from "./OsakaAreaFilter";

export const revalidate = 60;

const PER_PAGE = 20;

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    category?: string;
    cat_op?: string;
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
    cat_op: catOpParam,
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
  const catOp: "and" | "or" = catOpParam === "and" ? "and" : "or";
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

  const genreRow = await getGenreBySlug(slug);
  if (!genreRow) notFound();

  const categories = await listCategoriesByGenre(genreRow.id);

  const selectedCategorySlugs = (categoryParam ?? "")
    .split(",")
    .filter(Boolean);

  const newhalfCat = categories.find((c) => c.slug === "newhalf");
  const lesCat = categories.find((c) => c.slug === "les");
  const excludeNhActive = excludeNhParam === "1";

  // カテゴリ絞り込み: cat_op=and のときは全カテゴリを AND、そうでなければ OR
  // (D1 の bind 上限を避けるためサブクエリで行う)
  const matchedCats = selectedCategorySlugs.length > 0
    ? categories.filter((c) => selectedCategorySlugs.includes(c.slug))
    : [];
  const matchedIds = matchedCats.map((c) => c.id);

  // OR モードでも特定カテゴリは強制的に AND として扱う (修飾子的カテゴリ)
  const FORCED_AND_BY_GENRE: Record<string, string[]> = {
    "massage-urisen": ["delivery"],
  };
  const forcedAndSlugs = FORCED_AND_BY_GENRE[genreRow.slug] ?? [];
  const forcedAndIds = matchedCats
    .filter((c) => forcedAndSlugs.includes(c.slug))
    .map((c) => c.id);
  const otherIds = matchedCats
    .filter((c) => !forcedAndSlugs.includes(c.slug))
    .map((c) => c.id);

  let categoryIdsInclude: string[] | null = null;
  let categoryIdsAndAll: string[] | null = null;
  if (catOp === "and" && matchedIds.length > 1) {
    categoryIdsAndAll = matchedIds;
  } else if (forcedAndIds.length > 0 && otherIds.length > 0) {
    categoryIdsAndAll = forcedAndIds;
    categoryIdsInclude = otherIds;
  } else if (forcedAndIds.length > 0) {
    categoryIdsAndAll = forcedAndIds;
  } else if (matchedIds.length > 0) {
    categoryIdsInclude = matchedIds;
  }
  const excludeIds = excludeNhActive
    ? [newhalfCat?.id, lesCat?.id].filter((x): x is string => !!x)
    : [];
  const categoryIdsExclude = excludeIds.length > 0 ? excludeIds : null;

  const countOpts = { categoryIdsInclude, categoryIdsAndAll, categoryIdsExclude };

  const [prefCountMap, svcJsonRows, wardCountRawMap] = await Promise.all([
    genreMeta.hasPrefecture
      ? getPrefectureCounts(genreRow.id, countOpts)
      : Promise.resolve({} as Record<string, number>),
    genreMeta.hasServiceAreas
      ? getServiceAreasJson(genreRow.id, countOpts)
      : Promise.resolve<string[]>([]),
    genreMeta.hasPrefecture &&
    (prefectureParam === "tokyo" || prefectureParam === "osaka")
      ? getWardCounts(genreRow.id, prefectureParam, countOpts)
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

  const outsideSlug =
    prefectureParam === "osaka" ? OSAKA_OUTSIDE_SLUG : TOKYO_OUTSIDE_SLUG;
  const wardCountMap: Record<string, number> = {};
  for (const [k, v] of Object.entries(wardCountRawMap)) {
    wardCountMap[k === "__null" ? outsideSlug : k] = v;
  }

  const selectedRegion = regionParam
    ? PREFECTURE_REGIONS.find((r) => r.slug === regionParam)
    : null;

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
  const wardSupportedPref =
    prefectureFilter === "tokyo" || prefectureFilter === "osaka";
  const wardFilterActive = wardSupportedPref && selectedWardsRaw.length > 0;
  const wardIncludesOutside = selectedWardsRaw.includes(outsideSlug);
  const wardSpecificSlugs = selectedWardsRaw.filter(
    (w) => w !== outsideSlug,
  );

  const from = (currentPage - 1) * PER_PAGE;
  const { rows: listings, total: totalCount } = await searchGenreListings({
    genreId: genreRow.id,
    sort: currentSort as DbSortKey,
    limit: PER_PAGE,
    offset: from,
    categoryIdsInclude,
    categoryIdsAndAll,
    categoryIdsExclude,
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

  // 各カテゴリ checkbox の隣に出す件数: そのカテゴリにタグ付けされた listing 数
  // (現在の location / exclude / keyword フィルタは適用するが、カテゴリ選択や AND/OR には依存しない)
  const baseSearchOpts = {
    genreId: genreRow.id,
    sort: currentSort as DbSortKey,
    limit: 0,
    offset: 0,
    prefectures,
    serviceAreas: selectedServiceAreas.length > 0 ? selectedServiceAreas : null,
    providerAges: selectedProviderAges.length > 0 ? selectedProviderAges : null,
    wardSpecific: wardFilterActive && wardSpecificSlugs.length > 0
      ? wardSpecificSlugs
      : null,
    wardIncludesNull: wardFilterActive ? wardIncludesOutside : false,
    keyword: keyword || null,
  };
  const newhalfCatId = categories.find((c) => c.slug === "newhalf")?.id ?? null;
  const lesCatId = lesCat?.id ?? null;

  const [categoryCountMap, allToggleCount, excludeNhToggleCount] =
    await Promise.all([
      (async () => {
        const entries = await Promise.all(
          categories.map(async (c) => {
            return [
              c.slug,
              await countGenreListings({
                ...baseSearchOpts,
                categoryIdsInclude: [c.id],
                categoryIdsAndAll: null,
                categoryIdsExclude,
              }),
            ] as [string, number];
          }),
        );
        return Object.fromEntries(entries) as Record<string, number>;
      })(),
      // 「すべて」: カテゴリ無指定での件数 (= location/exclude フィルタ後の全件)
      countGenreListings({
        ...baseSearchOpts,
        categoryIdsInclude: null,
        categoryIdsAndAll: null,
        categoryIdsExclude,
      }),
      // 「レズ・ニューハーフ以外」: チェックを反転した状態での件数
      (async () => {
        const ids = [newhalfCatId, lesCatId].filter(
          (x): x is string => !!x,
        );
        if (ids.length === 0) return 0;
        return countGenreListings({
          ...baseSearchOpts,
          categoryIdsInclude,
          categoryIdsAndAll,
          categoryIdsExclude: excludeNhActive ? null : ids,
        });
      })(),
    ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);

  const extraParams: Record<string, string> = {};
  if (categoryParam) extraParams.category = categoryParam;
  if (catOp === "and") extraParams.cat_op = "and";
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
            categoryCounts={categoryCountMap}
            allToggleCount={allToggleCount}
            excludeNhToggleCount={excludeNhToggleCount}
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
            catOpParam={catOp === "and" ? "and" : ""}
            serviceAreaParam={serviceAreaParam ?? ""}
          />
          {prefectureFilter === "tokyo" && (
            <TokyoWardFilter wardCountMap={wardCountMap} />
          )}
          {prefectureFilter === "osaka" && (
            <OsakaAreaFilter wardCountMap={wardCountMap} />
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

        {keyword && (
          <p className="mb-3 text-sm text-zinc-700">
            キーワード:「<span className="font-medium">{keyword}</span>」の検索結果 {totalCount} 件
          </p>
        )}
        {listings.length > 0 ? (
          <>
            {!keyword && (
              <p className="mb-3 text-sm text-zinc-500">
                {totalCount}件の登録情報
              </p>
            )}
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
                          style={{ color: "#005766" }}
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
            {keyword
              ? `「${keyword}」に該当する登録情報はありませんでした`
              : "登録情報はまだありません"}
          </p>
        )}
      </div>
    </>
  );
}
