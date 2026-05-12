"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UnblockButton({ email }: { email: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUnblock = async () => {
    if (!confirm(`${email} のブロックを解除しますか？`)) return;
    setLoading(true);
    setError("");
    const res = await fetch(
      `/api/admin/accounts/blocked/${encodeURIComponent(email)}`,
      { method: "DELETE" },
    );
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      setError(body.error ?? "解除に失敗しました");
      setLoading(false);
      return;
    }
    setLoading(false);
    router.refresh();
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleUnblock}
        disabled={loading}
        className="rounded bg-zinc-100 px-3 py-1 text-xs text-zinc-700 hover:bg-zinc-200 disabled:opacity-50"
      >
        {loading ? "処理中..." : "解除"}
      </button>
      {error && <p className="mt-1 text-xs text-red-700">{error}</p>}
    </div>
  );
}
