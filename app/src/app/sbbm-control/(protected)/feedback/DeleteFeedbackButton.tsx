"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteFeedbackButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    if (!confirm("このご意見を削除しますか？")) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/feedback/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "削除に失敗しました");
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleDelete}
        disabled={loading}
        className="rounded bg-red-50 px-3 py-1 text-xs text-red-600 hover:bg-red-100 disabled:opacity-50"
      >
        {loading ? "削除中..." : "削除"}
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
