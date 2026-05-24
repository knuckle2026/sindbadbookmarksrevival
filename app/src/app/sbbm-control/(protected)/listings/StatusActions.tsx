"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ListingStatus } from "@/lib/db/types";

interface Props {
  listingId: string;
  currentStatus: ListingStatus;
}

const STATUS_LABEL: Record<ListingStatus, string> = {
  pending: "承認待ち",
  published: "公開中",
  hidden: "非表示",
  rejected: "却下",
};

const STATUS_BADGE_CLASS: Record<ListingStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  published: "bg-emerald-100 text-emerald-800",
  hidden: "bg-zinc-200 text-zinc-700",
  rejected: "bg-rose-100 text-rose-800",
};

export default function StatusActions({ listingId, currentStatus }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const setStatus = async (status: ListingStatus) => {
    setError(null);
    const res = await fetch(`/api/admin/listings/${listingId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      setError("失敗");
      return;
    }
    startTransition(() => router.refresh());
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <span
        className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${STATUS_BADGE_CLASS[currentStatus]}`}
      >
        {STATUS_LABEL[currentStatus]}
      </span>
      {currentStatus === "pending" && (
        <div className="flex gap-1">
          <button
            type="button"
            disabled={pending}
            onClick={() => setStatus("published")}
            className="rounded bg-emerald-600 px-2 py-0.5 text-xs text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            承認
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => setStatus("rejected")}
            className="rounded bg-rose-600 px-2 py-0.5 text-xs text-white hover:bg-rose-700 disabled:opacity-50"
          >
            却下
          </button>
        </div>
      )}
      {error && <span className="text-xs text-rose-600">{error}</span>}
    </div>
  );
}
