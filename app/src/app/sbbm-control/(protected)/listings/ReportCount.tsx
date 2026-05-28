"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

interface Report {
  id: string;
  reason: string;
  status: string;
  created_at: string;
}

interface Props {
  reports: Report[];
}

export default function ReportCount({ reports }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);

  const count = reports.length;
  const pendingCount = reports.filter((r) => r.status !== "reviewed").length;

  if (count === 0) {
    return <span className="text-zinc-300">0</span>;
  }

  const handleToggle = async (id: string, currentStatus: string) => {
    const next = currentStatus === "reviewed" ? "pending" : "reviewed";
    setBusyId(id);
    try {
      const res = await fetch(`/api/reports/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) {
        alert("更新に失敗しました");
        return;
      }
      startTransition(() => router.refresh());
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("この通報を削除しますか?")) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/reports/${id}`, { method: "DELETE" });
      if (!res.ok) {
        alert("削除に失敗しました");
        return;
      }
      startTransition(() => router.refresh());
    } finally {
      setBusyId(null);
    }
  };

  // 未対応があれば赤、全て対応済なら緑
  const badgeClass =
    pendingCount > 0
      ? "bg-red-50 text-red-600 hover:bg-red-100"
      : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100";

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors ${badgeClass}`}
        title={`未対応 ${pendingCount} / 全 ${count}`}
      >
        {count}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setOpen(false)}
        >
          <div
            className="mx-4 w-full max-w-lg rounded-lg bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-zinc-900">
                通報一覧（{count}件 / 未対応 {pendingCount}件）
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="rounded p-1 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            </div>

            <div className="max-h-[60vh] space-y-3 overflow-y-auto">
              {reports.map((r) => {
                const isReviewed = r.status === "reviewed";
                const isBusy = busyId === r.id || pending;
                return (
                  <div
                    key={r.id}
                    className="rounded-md border border-zinc-200 p-3"
                  >
                    <div className="mb-1.5 flex items-center gap-2 text-xs text-zinc-500">
                      <span>
                        {new Date(r.created_at).toLocaleString("ja-JP")}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          isReviewed
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {isReviewed ? "対応済" : "未対応"}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-700">{r.reason}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggle(r.id, r.status)}
                        disabled={isBusy}
                        className={`rounded px-2 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                          isReviewed
                            ? "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                            : "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                        }`}
                      >
                        {isReviewed ? "未対応に戻す" : "対応済にする"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(r.id)}
                        disabled={isBusy}
                        className="ml-auto rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        削除
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
