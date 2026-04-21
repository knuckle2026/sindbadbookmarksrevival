// @ts-nocheck
import { getAdminClient } from "@/lib/supabase/admin";
import Pagination from "@/components/listings/Pagination";

export const dynamic = "force-dynamic";

const PER_PAGE = 20;

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function AdminFeedbackPage({ searchParams }: PageProps) {
  const { page: pageParam } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const { supabase } = await getAdminClient();

  const { count } = await supabase
    .from("feedback")
    .select("id", { count: "exact", head: true });

  const totalCount = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const from = (safePage - 1) * PER_PAGE;
  const to = from + PER_PAGE - 1;

  const { data: feedbacks } = await supabase
    .from("feedback")
    .select("id, user_id, body, created_at")
    .order("created_at", { ascending: false })
    .range(from, to);

  // 送信者のメールをまとめて取得
  const userIds = Array.from(
    new Set((feedbacks ?? []).map((f) => f.user_id).filter(Boolean))
  ) as string[];

  let emailMap: Record<string, string> = {};
  if (userIds.length > 0) {
    const { data: emails } = await supabase.rpc("get_user_emails", {
      user_ids: userIds,
    });
    emailMap = (emails ?? []).reduce<Record<string, string>>((acc, row: { id: string; email: string }) => {
      acc[row.id] = row.email;
      return acc;
    }, {});
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="mb-6 text-2xl font-bold text-zinc-900">ご意見ご要望</h1>

      <p className="mb-4 text-sm text-zinc-500">全{totalCount}件</p>

      {feedbacks && feedbacks.length > 0 ? (
        <>
          <ul className="space-y-3">
            {feedbacks.map((f) => (
              <li
                key={f.id}
                className="rounded-lg border border-zinc-200 bg-white p-4"
              >
                <div className="mb-2 flex items-baseline justify-between gap-3 text-xs text-zinc-500">
                  <span>
                    {f.user_id ? emailMap[f.user_id] ?? "（不明ユーザー）" : "（匿名）"}
                  </span>
                  <time>
                    {new Date(f.created_at).toLocaleString("ja-JP")}
                  </time>
                </div>
                <p className="whitespace-pre-wrap text-sm text-zinc-800">
                  {f.body}
                </p>
              </li>
            ))}
          </ul>

          <Pagination
            currentPage={safePage}
            totalPages={totalPages}
            basePath="/sbbm-control/feedback"
          />
        </>
      ) : (
        <p className="rounded-lg border border-zinc-200 bg-white p-6 text-center text-sm text-zinc-500">
          まだご意見ご要望はありません。
        </p>
      )}
    </div>
  );
}
