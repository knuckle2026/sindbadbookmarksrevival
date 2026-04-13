// @ts-nocheck
import Link from "next/link";
import { getAdminClient } from "@/lib/supabase/admin";
import ListingActions from "./ListingActions";

export const dynamic = "force-dynamic";

const PER_PAGE = 30;

type SortColumn = "genre" | "title" | "url" | "description" | "created_at";
type SortOrder = "asc" | "desc";

const SORT_COLUMNS: { key: SortColumn; label: string }[] = [
  { key: "genre", label: "Genre" },
  { key: "title", label: "Title" },
  { key: "url", label: "URL" },
  { key: "description", label: "Description" },
  { key: "created_at", label: "Created" },
];

interface PageProps {
  searchParams: Promise<{
    genre?: string;
    page?: string;
    q?: string;
    sort?: string;
    order?: string;
  }>;
}

export default async function AdminListingsPage({ searchParams }: PageProps) {
  const {
    genre: genreFilter,
    page: pageParam,
    q: searchQuery,
    sort: sortParam,
    order: orderParam,
  } = await searchParams;

  const sortColumn: SortColumn = SORT_COLUMNS.some((c) => c.key === sortParam)
    ? (sortParam as SortColumn)
    : "created_at";
  const sortOrder: SortOrder = orderParam === "asc" ? "asc" : "desc";

  const currentPage = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const { supabase } = await getAdminClient();

  // Get genres for filter dropdown
  const { data: genres } = await supabase
    .from("genres")
    .select("id, slug, name")
    .order("sort_order", { ascending: true });

  const genreMap = Object.fromEntries(
    (genres ?? []).map((g) => [g.id, g])
  );

  // Build query
  let countQuery = supabase
    .from("listings")
    .select("id", { count: "exact", head: true });

  let dataQuery = supabase
    .from("listings")
    .select("id, title, genre_id, website_url, description, created_at, listing_categories(categories(name))");

  // Apply filters
  if (genreFilter) {
    const genre = (genres ?? []).find((g) => g.slug === genreFilter);
    if (genre) {
      countQuery = countQuery.eq("genre_id", genre.id);
      dataQuery = dataQuery.eq("genre_id", genre.id);
    }
  }

  if (searchQuery) {
    const orFilter = `title.ilike.%${searchQuery}%,website_url.ilike.%${searchQuery}%`;
    countQuery = countQuery.or(orFilter);
    dataQuery = dataQuery.or(orFilter);
  }

  const { count } = await countQuery;
  const totalCount = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const from = (safePage - 1) * PER_PAGE;
  const to = from + PER_PAGE - 1;

  // Apply sort — genre is sorted client-side after fetch
  const dbSortMap: Record<string, string> = {
    title: "title",
    url: "website_url",
    description: "description",
    created_at: "created_at",
  };
  if (dbSortMap[sortColumn]) {
    dataQuery = dataQuery.order(dbSortMap[sortColumn], { ascending: sortOrder === "asc" });
  } else {
    dataQuery = dataQuery.order("created_at", { ascending: false });
  }

  const { data: rawListings } = await dataQuery.range(from, to);
  let listings = rawListings;

  // Client-side sort for genre column
  if (sortColumn === "genre" && listings) {
    listings = [...listings].sort((a, b) => {
      const aName = genreMap[a.genre_id]?.name ?? "";
      const bName = genreMap[b.genre_id]?.name ?? "";
      return sortOrder === "asc"
        ? aName.localeCompare(bName, "ja")
        : bName.localeCompare(aName, "ja");
    });
  }

  // Build URL with params
  const buildBaseParams = () => {
    const params = new URLSearchParams();
    if (genreFilter) params.set("genre", genreFilter);
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

  const buildSortUrl = (col: SortColumn) => {
    const params = new URLSearchParams();
    if (genreFilter) params.set("genre", genreFilter);
    if (searchQuery) params.set("q", searchQuery);
    const newOrder = col === sortColumn && sortOrder === "asc" ? "desc" : "asc";
    params.set("sort", col);
    params.set("order", newOrder);
    const qs = params.toString();
    return `/sbbm-control/listings${qs ? `?${qs}` : ""}`;
  };

  const sortIndicator = (col: SortColumn) => {
    if (col !== sortColumn) return " ↕";
    return sortOrder === "asc" ? " ↑" : " ↓";
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="mb-6 text-2xl font-bold text-zinc-900">Listing Management</h1>

      {/* Filters */}
      <form method="GET" action="/sbbm-control/listings" className="mb-6 flex flex-wrap items-end gap-3">
        {/* Search */}
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

        {/* Genre filter */}
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-500">Genre</label>
          <select
            name="genre"
            defaultValue={genreFilter ?? ""}
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm"
          >
            <option value="">All genres</option>
            {(genres ?? []).map((g) => (
              <option key={g.slug} value={g.slug}>
                {g.name}
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

      {/* Count */}
      <p className="mb-3 text-sm text-zinc-500">{totalCount} listings</p>

      {/* Table */}
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
              <th className="px-4 py-2 text-left font-medium text-zinc-500">Categories</th>
              <th className="px-4 py-2 text-right font-medium text-zinc-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(listings ?? []).length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-zinc-400">
                  No listings found
                </td>
              </tr>
            ) : (
              (listings ?? []).map((listing) => {
                const genre = genreMap[listing.genre_id];
                const catNames = (listing.listing_categories ?? [])
                  .map((lc: any) => {
                    const cat = Array.isArray(lc.categories) ? lc.categories[0] : lc.categories;
                    return cat?.name;
                  })
                  .filter(Boolean)
                  .join(", ");
                const desc = listing.description ?? "";
                const shortDesc = desc.length > 20 ? desc.slice(0, 20) + "…" : desc;

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
                    <td className="max-w-[150px] truncate px-4 py-2 text-xs text-zinc-500">
                      {catNames || "-"}
                    </td>
                    <td className="px-4 py-2 text-right whitespace-nowrap">
                      <Link
                        href={`/sbbm-control/listings/${listing.id}/edit`}
                        className="mr-2 rounded bg-zinc-100 px-3 py-1 text-xs text-zinc-700 hover:bg-zinc-200"
                      >
                        Edit
                      </Link>
                      <ListingActions listingId={listing.id} title={listing.title} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
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
