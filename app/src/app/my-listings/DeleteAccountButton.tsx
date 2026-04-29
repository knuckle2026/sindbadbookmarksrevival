"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteAccountButton() {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setLoading(true);
    setError("");
    const res = await fetch("/api/account/delete", { method: "DELETE" });
    if (!res.ok) {
      const body = await res.json().catch(() => ({ error: "unknown" }));
      setError(body.error ?? "削除に失敗しました");
      setLoading(false);
      return;
    }
    router.push("/");
    router.refresh();
  };

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="text-xs font-light text-zinc-400 underline hover:text-red-600"
      >
        アカウントを削除する
      </button>
    );
  }

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm">
      <p className="mb-3 text-red-800">
        本当にアカウントを削除しますか？
        <br />
        登録したリスティングは残りますが、アカウントは元に戻せません。
        <br />
        <span className="text-xs text-red-700">
          ※ 同じメールアドレスで再度サインアップは可能ですが、新しいアカウントとして扱われ、削除前のデータには紐づきません。
        </span>
      </p>
      {error && (
        <p className="mb-2 rounded bg-white px-2 py-1 text-xs text-red-700">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleDelete}
          disabled={loading}
          className="rounded-md bg-red-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? "削除中..." : "削除する"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={loading}
          className="rounded-md border border-zinc-300 bg-white px-4 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
        >
          キャンセル
        </button>
      </div>
    </div>
  );
}
