import { requireAdmin } from "@/lib/auth/guards";
import {
  countListingsByUser,
  listAllProfiles,
} from "@/lib/db/queries/profiles";
import { listBlockedEmails } from "@/lib/db/queries/blocked-emails";
import { getUserEmailsByIds } from "@/lib/supabase/admin";
import ForceDeleteButton from "./ForceDeleteButton";
import UnblockButton from "./UnblockButton";

export const dynamic = "force-dynamic";

const PER_PAGE = 50;

interface PageProps {
  searchParams: Promise<{ page?: string; q?: string }>;
}

export default async function AdminAccountsPage({ searchParams }: PageProps) {
  const current = await requireAdmin();
  const { page: pageParam, q } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const offset = (currentPage - 1) * PER_PAGE;

  const { rows: profiles, total } = await listAllProfiles({
    search: q ?? null,
    limit: PER_PAGE,
    offset,
  });
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);

  const userIds = profiles.map((p) => p.id);
  const [emailMap, listingCounts] = await Promise.all([
    getUserEmailsByIds(userIds),
    Promise.all(userIds.map((id) => countListingsByUser(id))).then((nums) =>
      Object.fromEntries(userIds.map((id, i) => [id, nums[i]])),
    ),
  ]);

  const { rows: blocked } = await listBlockedEmails(100, 0);
  const blockerIds = [
    ...new Set(blocked.map((b) => b.blocked_by).filter((x): x is string => !!x)),
  ];
  const blockerEmailMap = await getUserEmailsByIds(blockerIds);

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="mb-6 text-2xl font-bold text-zinc-900">Account Management</h1>

      <form method="GET" action="/sbbm-control/accounts" className="mb-6 flex items-end gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-500">Search (display name)</label>
          <input
            type="text"
            name="q"
            defaultValue={q ?? ""}
            placeholder="display name..."
            className="w-64 rounded-md border border-zinc-300 px-3 py-1.5 text-sm"
          />
        </div>
        <button
          type="submit"
          className="rounded-md bg-zinc-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Filter
        </button>
      </form>

      <p className="mb-3 text-sm text-zinc-500">{total} accounts</p>

      <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50">
              <th className="px-4 py-2 text-left font-medium text-zinc-500">Display name</th>
              <th className="px-4 py-2 text-left font-medium text-zinc-500">Email</th>
              <th className="px-4 py-2 text-left font-medium text-zinc-500">Role</th>
              <th className="px-4 py-2 text-left font-medium text-zinc-500">Suspended</th>
              <th className="px-4 py-2 text-right font-medium text-zinc-500">Listings</th>
              <th className="px-4 py-2 text-left font-medium text-zinc-500">Created</th>
              <th className="px-4 py-2 text-right font-medium text-zinc-500">Action</th>
            </tr>
          </thead>
          <tbody>
            {profiles.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-zinc-400">
                  No accounts found
                </td>
              </tr>
            ) : (
              profiles.map((p) => {
                const isSelf = p.id === current.authUser.id;
                const email = emailMap[p.id] ?? null;
                return (
                  <tr key={p.id} className="border-b border-zinc-100 last:border-0 align-top">
                    <td className="px-4 py-2 font-medium text-zinc-900">{p.display_name}</td>
                    <td className="px-4 py-2 text-xs text-zinc-600" title={p.id}>
                      {email ?? "(取得不可)"}
                    </td>
                    <td className="px-4 py-2 text-xs text-zinc-600">{p.role}</td>
                    <td className="px-4 py-2 text-xs text-zinc-600">
                      {p.is_suspended ? "yes" : "-"}
                    </td>
                    <td className="px-4 py-2 text-right text-xs text-zinc-600">
                      {listingCounts[p.id] ?? 0}
                    </td>
                    <td className="px-4 py-2 text-xs text-zinc-500 whitespace-nowrap">
                      {new Date(p.created_at).toLocaleDateString("ja-JP")}
                    </td>
                    <td className="px-4 py-2 text-right whitespace-nowrap">
                      {isSelf ? (
                        <span className="text-xs text-zinc-400">(自分)</span>
                      ) : (
                        <ForceDeleteButton
                          userId={p.id}
                          displayName={p.display_name}
                          email={email}
                        />
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-zinc-500">
          {safePage} / {totalPages}
        </div>
      )}

      <h2 className="mt-12 mb-3 text-lg font-bold text-zinc-900">Blocked Emails</h2>
      <p className="mb-3 text-xs text-zinc-500">
        ここに登録されたメールアドレスは新規登録 / OAuth ログインができません。
      </p>
      <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50">
              <th className="px-4 py-2 text-left font-medium text-zinc-500">Email</th>
              <th className="px-4 py-2 text-left font-medium text-zinc-500">Blocked by</th>
              <th className="px-4 py-2 text-left font-medium text-zinc-500">Reason</th>
              <th className="px-4 py-2 text-left font-medium text-zinc-500">Created</th>
              <th className="px-4 py-2 text-right font-medium text-zinc-500">Action</th>
            </tr>
          </thead>
          <tbody>
            {blocked.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-zinc-400">
                  No blocked emails
                </td>
              </tr>
            ) : (
              blocked.map((b) => (
                <tr key={b.email} className="border-b border-zinc-100 last:border-0">
                  <td className="px-4 py-2 font-mono text-xs text-zinc-900">{b.email}</td>
                  <td className="px-4 py-2 text-xs text-zinc-600">
                    {b.blocked_by ? blockerEmailMap[b.blocked_by] ?? "(不明)" : "-"}
                  </td>
                  <td className="px-4 py-2 text-xs text-zinc-600">{b.reason ?? "-"}</td>
                  <td className="px-4 py-2 text-xs text-zinc-500 whitespace-nowrap">
                    {new Date(b.created_at).toLocaleDateString("ja-JP")}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <UnblockButton email={b.email} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
