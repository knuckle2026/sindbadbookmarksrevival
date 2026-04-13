import Link from "next/link";
import { getAdminClient } from "@/lib/supabase/admin";
import ListingActions from "./ListingActions";

export const dynamic = "force-dynamic";

const PER_PAGE = 30;

interface PageProps {
  searchParams: Promise<{
    genre?: string;
    status?: string;
    page?: string;
    q?: string;
  }>;
}

export default async function AdminListingsPage({ searchParams }: PageProps) {
  const {
    genre: genreFilter,
    status: statusFilter,
    page: pageParam,
    q: searchQuery,
  } = await searchParams;

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
    .select("id, title, genre_id, prefecture, status, created_at, user_id");

  // Apply filters
  if (genreFilter) {
    const genre = (genres ?? []).find((g) => g.slug === genreFilter);
    if (genre) {
      countQuery = countQuery.eq("genre_id", genre.id);
      dataQuery = dataQuery.eq("genre_id", genre.id);
    }
  }

  if (statusFilter) {
    countQuery = countQuery.eq("status", statusFilter);
    dataQuery = dataQuery.eq("status", statusFilter);
  }

  if (searchQuery) {
    countQuery = countQuery.ilike("title", `%${searchQuery}%`);
    dataQuery = dataQuery.ilike("title", `%${searchQuery}%`);
  }

  const { count } = await countQuery;
  const totalCount = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const from = (safePage - 1) * PER_PAGE;
  const to = from + PER_PAGE - 1;

  const { data: listings } = await dataQuery
    .order("created_at", { ascending: false })
    .range(from, to);

  // Get user emails via admin-only RPC function
  const userIds = [...new Set((listings ?? []).map((l) => l.user_id).filter(Boolean))];
  let emailMap: Record<string, string> = {};
  if (userIds.length > 0) {
    const { data: emails } = await supabase
      .rpc("get_user_emails", { user_ids: userIds });
    emailMap = Object.fromEntries(
      (emails ?? []).map((e: any) => [e.id, e.email])
    );
  }

  // Build pagination URL params
  const buildUrl = (page: number) => {
    const params = new URLSearchParams();
    if (genreFilter) params.set("genre", genreFilter);
    if (statusFilter) params.set("status", statusFilter);
    if (searchQuery) params.set("q", searchQuery);
    if (page > 1) params.set("page", String(page));
    const qs = params.toString();
    return `/sbbm-control/listings${qs ? `?${qs}` : ""}`;
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
            placeholder="Title..."
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

        {/* Status filter */}
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-500">Status</label>
          <select
            name="status"
            defaultValue={statusFilter ?? ""}
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm"
          >
            <option value="">All</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
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
              <th className="px-4 py-2 text-left font-medium text-zinc-500">Title</th>
              <th className="px-4 py-2 text-left font-medium text-zinc-500">Genre</th>
              <th className="px-4 py-2 text-left font-medium text-zinc-500">Prefecture</th>
              <th className="px-4 py-2 text-left font-medium text-zinc-500">Status</th>
              <th className="px-4 py-2 text-left font-medium text-zinc-500">Creator</th>
              <th className="px-4 py-2 text-left font-medium text-zinc-500">Created</th>
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
                const creatorEmail = listing.user_id ? emailMap[listing.user_id] : null;
                return (
                  <tr
                    key={listing.id}
                    className="border-b border-zinc-100 last:border-0"
                  >
                    <td className="max-w-[200px] truncate px-4 py-2 font-medium text-zinc-900">
                      {listing.title}
                    </td>
                    <td className="px-4 py-2 text-zinc-600">
                      {genre?.name ?? "-"}
                    </td>
                    <td className="px-4 py-2 text-zinc-600">
                      {listing.prefecture ?? "-"}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                          listing.status === "published"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-zinc-100 text-zinc-600"
                        }`}
                      >
                        {listing.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-xs text-zinc-500">
                      {creatorEmail ?? "-"}
                    </td>
                    <td className="px-4 py-2 text-xs text-zinc-500">
                      {new Date(listing.created_at).toLocaleDateString("ja-JP")}
                    </td>
                    <td className="px-4 py-2 text-right">
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
