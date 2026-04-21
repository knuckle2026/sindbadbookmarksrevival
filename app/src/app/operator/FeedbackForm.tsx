// @ts-nocheck
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function FeedbackForm() {
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) return;

    setLoading(true);
    setError("");

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error: err } = await supabase.from("feedback").insert({
      body: trimmed,
      user_id: user?.id ?? null,
    });

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    setBody("");
    setDone(true);
    setLoading(false);
  };

  if (done) {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
        ご意見ご要望をお送りいただきありがとうございました。
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        maxLength={200}
        required
        rows={5}
        placeholder="ご意見・ご要望をお聞かせください（200文字以内）"
        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-red-600 focus:outline-none"
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-400">{body.length} / 200</span>
        <button
          type="submit"
          disabled={loading || !body.trim()}
          className="rounded-lg px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-40"
          style={{ backgroundColor: "#B21000" }}
        >
          {loading ? "送信中..." : "送信する"}
        </button>
      </div>
      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </form>
  );
}
