import Link from "next/link";
import {
  adminCountListings,
  adminSearchListings,
  getCategoriesForListings,
  type AdminSortColumn,
} from "@/lib/db/queries/listings";
import { listGenres } from "@/lib/db/queries/genres";
import { listAllCategoriesWithGenre } from "@/lib/db/queries/categories";
import { getReportsByListingIds } from "@/lib/db/queries/reports";
import { getUserEmailsByIds } from "@/lib/supabase/admin";
import ListingActions from "./ListingActions";
import ReportCount from "./ReportCount";

export const dynamic = "force-dynamic";

const PER_PAGE = 30;

type SortOrder = "asc" | "desc";

const SORT_COLUMNS: { key: AdminSortColumn | "genre"; label: string }[] = [
  { key: "genre", label: "Genre" },
  { key: "title", label: "Title" },
  { key: "url", label: "URL" },
  { key: "description", label: "Description" },
  { key: "created_at", label: "Created" },
];

interface PageProps {
  searchParams: Promise<{
    genre?: string;
    category?: string;
    page?: string;
    q?: string;
    sort?: string;
    order?: string;
  }>;
}

export default async function AdminListingsPage({ searchParams }: PageProps) {
  const {
    genre: genreFilter,
    category: categoryFilter,
    page: pageParam,
    q: searchQuery,
    sort: sortParam,
    order: orderParam,
  } = await searchParams;

  const sortColumn: AdminSortColumn | "genre" = SORT_COLUMNS.some(
    (c) => c.key === sortParam
  )
    ? (sortParam as AdminSortColumn | "genre")
    : "created_at";
  const sortOrder: SortOrder = orderParam === "asc" ? "asc" : "desc";

  const currentPage = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const [genres, allCategories] = await Promise.all([
    listGenres(),
    listAllCategoriesWithGenre(),
  ]);
  const genreMap = Object.fromEntries(genres.map((g) => [g.id, g]));
  const filterGenre = genreFilter
    ? genres.find((g) => g.slug === genreFilter)
    : null;
  const filterGenreId = filterGenre?.id ?? null;

  // category フィルタは UUID で受ける (slug は genre 間で重複しうるため)
  const filterCategory =
    categoryFilter && allCategories.find((c) => c.id === categoryFilter)
      ? allCategories.find((c) => c.id === categoryFilter)!
      : null;
  // genre フィルタと矛盾する category は無視する
  const filterCategoryId =
    filterCategory &&
    (!filterGenreId || filterCategory.genre_id === filterGenreId)
      ? filterCategory.id
      : null;

  // 表示するカテゴリ選択肢: genre フィルタが効いていればそのジャンル内のみ、
  // 効いてなければ全カテゴリ (ジャンル名でグルーピング表示)
  const visibleCategories = filterGenreId
    ? allCategories.filter((c) => c.genre_id === filterGenreId)
    : allCategories;

  const totalCount = await adminCountListings({
    q: searchQuery ?? null,
    genreId: filterGenreId,
    categoryId: filterCategoryId,
  });
  const totalPages = Math.max(1, Math.ceil(totalCount / PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const offset = (safePage - 1) * PER_PAGE;

  // For DB-side sorts, fetch with the requested order. For "genre", fetch by
  // created_at then sort client-side (mirrors original behavior).
  const dbSortColumn: AdminSortColumn =
    sortColumn === "genre" ? "created_at" : sortColumn;
  const dbSortOrder: SortOrder = sortColumn === "genre" ? "desc" : sortOrder;

  let listings = await adminSearchListings({
    q: searchQuery ?? null,
    genreId: filterGenreId,
    categoryId: filterCategoryId,
    sortColumn: dbSortColumn,
    sortOrder: dbSortOrder,
    limit: PER_PAGE,
    offset,
  });

  if (sortColumn === "genre") {
    listings = [...listings].sort((a, b) => {
      const aName = genreMap[a.genre_id ?? ""]?.name ?? "";
      const bName = genreMap[b.genre_id ?? ""]?.name ?? "";
      return sortOrder === "asc"
        ? aName.localeCompare(bName, "ja")
        : bName.localeCompare(aName, "ja");
    });
  }

  const listingIds = listings.map((l) => l.id);
  const userIds = [
    ...new Set(listings.map((l) => l.user_id).filter((u): u is string => !!u)),
  ];
  const [categoriesByListing, reportsByListing, emailMap] = await Promise.all([
    getCategoriesForListings(listingIds),
    getReportsByListingIds(listingIds),
    getUserEmailsByIds(userIds),
  ]);

  const buildBaseParams = () => {
    const params = new URLSearchParams();
    if (genreFilter) params.set("genre", genreFilter);
    if (filterCategoryId) params.set("category", filterCategoryId);
    if (searchQuery) params.set("q", searchQuery);
    if (sortColumn !== "created_at" || sortOrder !== "desc") {
      params.set("sort", sortColumn);
      params.set("order", sortOrder);
    }
    return params;
  };

  const buildUrl = (page: number) => {
    const params = buildBaseParams();
    if (page > 1) params.set("page", String(page));
    const qs = params.toString();
    return `/sbbm-control/listings${qs ? `?${qs}` : ""}`;
  };

  // 編集ページから戻ってくるときに同じ画面状態を再現するため、現在の URL を from として渡す
  const currentListUrl = (() => {
    const params = buildBaseParams();
    if (currentPage > 1) params.set("page", String(currentPage));
    const qs = params.toString();
    return `/sbbm-control/listings${qs ? `?${qs}` : ""}`;
  })();

  const buildEditUrl = (listingId: string) => {
    const params = new URLSearchParams();
    params.set("from", currentListUrl);
    return `/sbbm-control/listings/${listingId}/edit?${params.toString()}`;
  };

  const buildSortUrl = (col: AdminSortColumn | "genre") => {
    const params = new URLSearchParams();
    if (genreFilter) params.set("genre", genreFilter);
    if (filterCategoryId) params.set("category", filterCategoryId);
    if (searchQuery) params.set("q", searchQuery);
    const newOrder = col === sortColumn && sortOrder === "asc" ? "desc" : "asc";
    params.set("sort", col);
    params.set("order", newOrder);
    const qs = params.toString();
    return `/sbbm-control/listings${qs ? `?${qs}` : ""}`;
  };

  const sortIndicator = (col: AdminSortColumn | "genre") => {
    if (col !== sortColumn) return " ↕";
    return sortOrder === "asc" ? " ↑" : " ↓";
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="mb-6 text-2xl font-bold text-zinc-900">Listing Management</h1>

      <form method="GET" action="/sbbm-control/listings" className="mb-6 flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-500">Search</label>
          <input
            type="text"
            name="q"
            defaultValue={searchQuery ?? ""}
            placeholder="Title / URL..."
            className="w-48 rounded-md border border-zinc-300 px-3 py-1.5 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-500">Genre</label>
          <select
            name="genre"
            defaultValue={genreFilter ?? ""}
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm"
          >
            <option value="">All genres</option>
            {genres.map((g) => (
              <option key={g.slug} value={g.slug}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-500">Category</label>
          <select
            name="category"
            defaultValue={filterCategoryId ?? ""}
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm"
          >
            <option value="">All categories</option>
            {visibleCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {filterGenreId ? c.name : `${c.genre_name} / ${c.name}`}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="rounded-md bg-zinc-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Filter
        </button>
      </form>

      <p className="mb-3 text-sm text-zinc-500">{totalCount} listings</p>

      <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50">
              {SORT_COLUMNS.map((col) => (
                <th key={col.key} className="px-4 py-2 text-left font-medium text-zinc-500">
                  <Link
                    href={buildSortUrl(col.key)}
                    className="inline-flex items-center gap-0.5 hover:text-zinc-900 transition-colors"
                  >
                    {col.label}
                    <span className={`text-xs ${col.key === sortColumn ? "text-zinc-900" : "text-zinc-300"}`}>
                      {sortIndicator(col.key)}
                    </span>
                  </Link>
                </th>
              ))}
              <th className="px-4 py-2 text-left font-medium text-zinc-500">登録者</th>
              <th className="px-4 py-2 text-left font-medium text-zinc-500">Categories</th>
              <th className="px-4 py-2 text-right font-medium text-zinc-500">Actions</th>
              <th className="px-4 py-2 text-center font-medium text-zinc-500">通報</th>
            </tr>
          </thead>
          <tbody>
            {listings.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-6 text-center text-zinc-400">
                  No listings found
                </td>
              </tr>
            ) : (
              listings.map((listing) => {
                const genre = listing.genre_id ? genreMap[listing.genre_id] : null;
                const cats = categoriesByListing[listing.id] ?? [];
                const catNames = cats.map((c) => c.name).join(", ");
                const desc = listing.description ?? "";
                const shortDesc = desc.length > 20 ? desc.slice(0, 20) + "…" : desc;
                const reports = reportsByListing[listing.id] ?? [];

                return (
                  <tr
                    key={listing.id}
                    className="border-b border-zinc-100 last:border-0"
                  >
                    <td className="px-4 py-2 text-zinc-600 whitespace-nowrap">
                      {genre?.name ?? "-"}
                    </td>
                    <td className="max-w-[180px] truncate px-4 py-2 font-medium text-zinc-900">
                      {listing.title}
                    </td>
                    <td className="max-w-[180px] truncate px-4 py-2 text-xs">
                      {listing.website_url ? (
                        <a
                          href={listing.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                          title={listing.website_url}
                        >
                          {listing.website_url}
                        </a>
                      ) : "-"}
                    </td>
                    <td className="max-w-[150px] truncate px-4 py-2 text-zinc-600 text-xs" title={desc}>
                      {shortDesc || "-"}
                    </td>
                    <td className="px-4 py-2 text-xs text-zinc-500 whitespace-nowrap">
                      {new Date(listing.created_at).toLocaleDateString("ja-JP")}
                    </td>
                    <td
                      className="max-w-[180px] truncate px-4 py-2 text-xs text-zinc-500"
                      title={listing.user_id ?? ""}
                    >
                      {listing.user_id
                        ? emailMap[listing.user_id] ?? "(不明)"
                        : "-"}
                    </td>
                    <td className="max-w-[150px] truncate px-4 py-2 text-xs text-zinc-500">
                      {catNames || "-"}
                    </td>
                    <td className="px-4 py-2 text-right whitespace-nowrap">
                      <Link
                        href={buildEditUrl(listing.id)}
                        className="mr-2 rounded bg-zinc-100 px-3 py-1 text-xs text-zinc-700 hover:bg-zinc-200"
                      >
                        Edit
                      </Link>
                      <ListingActions listingId={listing.id} title={listing.title} />
                    </td>
                    <td className="px-4 py-2 text-center">
                      <ReportCount reports={reports} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          {safePage > 1 && (
            <Link
              href={buildUrl(safePage - 1)}
              className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100"
            >
              Prev
            </Link>
          )}
          <span className="text-sm text-zinc-500">
            {safePage} / {totalPages}
          </span>
          {safePage < totalPages && (
            <Link
              href={buildUrl(safePage + 1)}
              className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
