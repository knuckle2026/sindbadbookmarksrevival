import { Suspense } from "react";
import Pagination from "@/components/listings/Pagination";
import ClickableTitle from "@/components/listings/ClickableTitle";
import ReportButton from "@/components/listings/ReportButton";
import SearchBar from "@/components/listings/SearchBar";
import {
  getCategoriesForListings,
  searchListingsByKeyword,
} from "@/lib/db/queries/listings";

export const dynamic = "force-dynamic";

const PER_PAGE = 20;

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { q: qParam, page: pageParam } = await searchParams;
  const q = (qParam ?? "").trim();
  const currentPage = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const offset = (currentPage - 1) * PER_PAGE;

  let listings: Awaited<ReturnType<typeof searchListingsByKeyword>>["rows"] = [];
  let totalCount = 0;
  if (q.length > 0) {
    const result = await searchListingsByKeyword(q, offset, PER_PAGE);
    listings = result.rows;
    totalCount = result.total;
  }

  const catMap =
    listings.length > 0
      ? await getCategoriesForListings(listings.map((l) => l.id))
      : {};

  const totalPages = Math.max(1, Math.ceil(totalCount / PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);

  const extraParams: Record<string, string> = {};
  if (q) extraParams.q = q;

  return (
    <>
      <Suspense>
        <SearchBar />
      </Suspense>

      <div className="mx-auto max-w-5xl px-6 py-8">
      {q.length === 0 ? (
        <p className="rounded-lg border border-zinc-200 bg-white p-6 text-center text-sm text-zinc-500">
          キーワードを入力してください。
        </p>
      ) : listings.length > 0 ? (
        <>
          <p className="mb-3 text-sm text-zinc-500">
            「{q}」に一致する登録情報 {totalCount} 件
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
                  <ReportButton
                    listingId={l.id}
                    listingTitle={l.title}
                    variant="card"
                  />
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
                        style={{ color: "#003A66" }}
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
            basePath="/search"
            extraParams={extraParams}
          />
        </>
      ) : (
        <p className="rounded-lg border border-zinc-200 bg-white p-6 text-center text-sm text-zinc-500">
          「{q}」に一致する登録情報はありませんでした。
        </p>
      )}
      </div>
    </>
  );
}
