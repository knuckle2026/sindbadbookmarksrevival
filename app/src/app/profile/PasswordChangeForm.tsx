"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const MIN_LENGTH = 6;

export default function PasswordChangeForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < MIN_LENGTH) {
      setError(`パスワードは ${MIN_LENGTH} 文字以上にしてください。`);
      return;
    }
    if (password !== confirm) {
      setError("確認用パスワードが一致しません。");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (err) {
      setError(err.message);
      return;
    }

    setDone(true);
    setPassword("");
    setConfirm("");
  };

  if (done) {
    return (
      <div className="space-y-3">
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          パスワードを変更しました。
        </p>
        <Link
          href="/"
          className="inline-block text-sm text-primary hover:underline"
        >
          トップへ戻る
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-500">
          新しいパスワード（{MIN_LENGTH}文字以上）
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          required
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-500">
          確認用（同じパスワードをもう一度）
        </label>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
          required
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
        />
      </div>

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || !password || !confirm}
        className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50"
      >
        {loading ? "変更中..." : "パスワードを変更"}
      </button>
    </form>
  );
}
