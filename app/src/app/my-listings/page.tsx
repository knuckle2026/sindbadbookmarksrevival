// @ts-nocheck
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Pagination from "@/components/listings/Pagination";

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
        <h1 className="mb-4 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          マイリスティング
        </h1>
        <p className="mb-8 text-sm text-zinc-600 dark:text-zinc-300">
          マイリスティングを表示するにはログインが必要です。
        </p>
        <div className="flex justify-center gap-3">
          <Link
            href="/login?next=/my-listings"
            className="inline-block rounded-lg px-5 py-2.5 text-sm font-medium text-white hover:opacity-90"
            style={{ backgroundColor: "#B21000" }}
          >
            ログイン
          </Link>
          <Link
            href="/signup?next=/my-listings"
            className="inline-block rounded-lg border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            アカウント新規作成
          </Link>
        </div>
      </div>
    );
  }

  // 総件数を取得
  const { count } = await supabase
    .from("listings")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  const totalCount = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const from = (safePage - 1) * PER_PAGE;
  const to = from + PER_PAGE - 1;

  const { data: listings } = await supabase
    .from("listings")
    .select("id, title, description, website_url, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(from, to);

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          マイリスティング
        </h1>
        <Link
          href="/listings/new"
          className="inline-block rounded-lg px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          style={{ backgroundColor: "#B21000" }}
        >
          新規登録
        </Link>
      </div>

      {listings && listings.length > 0 ? (
        <>
          <ul className="space-y-3">
            {listings.map((l) => (
              <li
                key={l.id}
                className="flex items-start justify-between rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="min-w-0 flex-1">
                  <a
                    href={l.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block truncate text-base font-semibold text-zinc-900 hover:underline dark:text-zinc-50"
                  >
                    {l.title}
                  </a>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                    {l.description}
                  </p>
                  <p className="mt-1 text-xs text-zinc-400">
                    登録日: {new Date(l.created_at).toLocaleDateString("ja-JP")}
                  </p>
                </div>
                <Link
                  href={`/listings/${l.id}/edit`}
                  className="ml-4 shrink-0 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  編集
                </Link>
              </li>
            ))}
          </ul>

          <Pagination
            currentPage={safePage}
            totalPages={totalPages}
            basePath="/my-listings"
          />
        </>
      ) : (
        <p className="rounded-lg border border-zinc-200 bg-white p-6 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
          まだ登録したリスティングがありません。
        </p>
      )}
    </div>
  );
}
