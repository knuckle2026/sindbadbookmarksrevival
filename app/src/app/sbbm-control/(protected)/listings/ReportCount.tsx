"use client";

import { useState } from "react";

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
  const [open, setOpen] = useState(false);
  const count = reports.length;

  if (count === 0) {
    return <span className="text-zinc-300">0</span>;
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors"
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
                通報一覧（{count}件）
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
              {reports.map((r) => (
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
                        r.status === "reviewed"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {r.status === "reviewed" ? "確認済" : "未確認"}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-700">{r.reason}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
