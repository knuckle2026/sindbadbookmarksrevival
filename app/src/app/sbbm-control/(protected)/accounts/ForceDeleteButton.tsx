"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  userId: string;
  displayName: string;
  email: string | null;
}

export default function ForceDeleteButton({ userId, displayName, email }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setLoading(true);
    setError("");
    const res = await fetch(`/api/admin/accounts/${userId}/force-delete`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      setError(body.error ?? "削除に失敗しました");
      setLoading(false);
      return;
    }
    setOpen(false);
    setLoading(false);
    setReason("");
    router.refresh();
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded bg-red-50 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
      >
        強制退会
      </button>
    );
  }

  return (
    <div className="space-y-2 rounded border border-red-300 bg-red-50 p-3 text-xs text-red-800">
      <p>
        <strong>{displayName}</strong>
        {email ? ` (${email})` : ""} を強制退会させますか？
      </p>
      <p className="text-[11px]">
        Auth User と profile が削除され、メールアドレスは再登録不可リストに登録されます。
      </p>
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="理由 (任意)"
        rows={2}
        className="w-full rounded border border-red-200 px-2 py-1 text-xs"
      />
      {error && <p className="rounded bg-white px-2 py-1 text-red-700">{error}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleDelete}
          disabled={loading}
          className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? "処理中..." : "強制退会"}
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setReason("");
            setError("");
          }}
          disabled={loading}
          className="rounded border border-red-300 bg-white px-3 py-1 text-red-700 hover:bg-red-100"
        >
          キャンセル
        </button>
      </div>
    </div>
  );
}
