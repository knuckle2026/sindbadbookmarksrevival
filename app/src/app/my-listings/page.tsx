// @ts-nocheck
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function MyListingsPage() {
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
            新規登録
          </Link>
        </div>
      </div>
    );
  }

  const { data: listings } = await supabase
    .from("listings")
    .select("id, title, description, website_url, status, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

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
        <ul className="space-y-3">
          {listings.map((l) => (
            <li
              key={l.id}
              className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
            >
              {l.website_url ? (
                <a
                  href={l.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-base font-semibold text-zinc-900 hover:underline dark:text-zinc-50"
                >
                  {l.title}
                </a>
              ) : (
                <span className="block text-base font-semibold text-zinc-900 dark:text-zinc-50">
                  {l.title}
                </span>
              )}
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                {l.description}
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                状態: {l.status}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-lg border border-zinc-200 bg-white p-6 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
          まだ登録したリスティングがありません。
        </p>
      )}
    </div>
  );
}
