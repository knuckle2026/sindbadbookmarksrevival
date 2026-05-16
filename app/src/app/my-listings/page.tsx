import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Pagination from "@/components/listings/Pagination";
import { listMyListings } from "@/lib/db/queries/listings";
import DeleteAccountButton from "./DeleteAccountButton";
import LogoutLink from "./LogoutLink";

export const dynamic = "force-dynamic";

const PER_PAGE = 20;

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function MyListingsPage({ searchParams }: PageProps) {
  const { page: pageParam } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <p className="mb-8 text-sm text-zinc-600">
          登録した情報を表示するにはログインが必要です。
        </p>
        <div className="flex justify-center gap-3">
          <Link
            href="/login?next=/my-listings"
            className="inline-block rounded-lg px-5 py-2.5 text-sm font-medium text-white hover:opacity-90"
            style={{ backgroundColor: "#005766" }}
          >
            ログイン
          </Link>
          <Link
            href="/signup?next=/my-listings"
            className="inline-block rounded-lg border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            アカウント新規作成
          </Link>
        </div>
      </div>
    );
  }

  const totalPages = 1;
  const safePageInitial = Math.min(currentPage, totalPages);
  const offset = (currentPage - 1) * PER_PAGE;
  const { rows: listings, total } = await listMyListings(
    user.id,
    offset,
    PER_PAGE
  );

  const realTotalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const safePage = Math.min(safePageInitial, realTotalPages);

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      {listings.length > 0 ? (
        <>
          <ul className="space-y-3">
            {listings.map((l) => (
              <li
                key={l.id}
                className="flex items-start justify-between rounded-lg border border-zinc-200 bg-white p-4"
              >
                <div className="min-w-0 flex-1">
                  <a
                    href={l.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block truncate text-base font-semibold text-zinc-900 hover:underline"
                  >
                    {l.title}
                  </a>
                  <p className="mt-1 text-sm text-zinc-600">{l.description}</p>
                  <p className="mt-1 text-xs text-zinc-400">
                    登録日: {new Date(l.created_at).toLocaleDateString("ja-JP")}
                  </p>
                </div>
                <Link
                  href={`/listings/${l.id}/edit`}
                  className="ml-4 shrink-0 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
                >
                  編集
                </Link>
              </li>
            ))}
          </ul>

          <Pagination
            currentPage={safePage}
            totalPages={realTotalPages}
            basePath="/my-listings"
          />
        </>
      ) : (
        <p className="rounded-lg border border-zinc-200 bg-white p-6 text-center text-sm text-zinc-500">
          まだ登録したリスティングがありません。
        </p>
      )}

      <div className="mt-12 flex flex-col items-start gap-3">
        <LogoutLink />
        <DeleteAccountButton />
      </div>
    </div>
  );
}
