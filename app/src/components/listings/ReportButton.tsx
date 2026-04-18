// @ts-nocheck
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Props {
  listingId: string;
  listingTitle: string;
  variant?: "card" | "detail";
}

const MAX_REASON_LENGTH = 50;

export default function ReportButton({
  listingId,
  listingTitle,
  variant = "card",
}: Props) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleOpen = () => {
    setOpen(true);
    setReason("");
    setDone(false);
    setError("");
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = async () => {
    if (!reason.trim()) return;
    setSubmitting(true);
    setError("");

    try {
      const supabase = createClient();

      // ログイン中ならuser_idを取得
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error: insertError } = await supabase.from("reports").insert({
        listing_id: listingId,
        reason: reason.trim(),
        ...(user ? { reporter_user_id: user.id } : {}),
      });

      if (insertError) {
        setError("送信に失敗しました。もう一度お試しください。");
        return;
      }

      setDone(true);
    } catch {
      setError("送信に失敗しました。もう一度お試しください。");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Trigger button */}
      {variant === "card" ? (
        <button
          onClick={handleOpen}
          className="shrink-0 text-xs text-zinc-400 hover:text-red-500 active:text-red-500 transition-colors"
        >
          ✉ 運営へ報告
        </button>
      ) : (
        <button
          onClick={handleOpen}
          className="text-sm text-zinc-500 hover:text-red-600 active:text-red-600 transition-colors"
        >
          この情報を報告する
        </button>
      )}

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={handleClose}
        >
          <div
            className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {done ? (
              /* 完了表示 */
              <div className="text-center">
                <div className="mb-3 text-3xl">✓</div>
                <h2 className="mb-2 text-lg font-bold text-zinc-900">
                  ご報告ありがとうございました
                </h2>
                <p className="mb-6 text-sm text-zinc-600">
                  内容を確認のうえ対応いたします。
                </p>
                <button
                  onClick={handleClose}
                  className="rounded-lg border border-zinc-300 px-6 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 active:bg-zinc-100"
                >
                  閉じる
                </button>
              </div>
            ) : (
              /* フォーム */
              <>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-zinc-900">
                    この情報を報告する
                  </h2>
                  <button
                    onClick={handleClose}
                    className="rounded p-1 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 active:text-zinc-600 active:bg-zinc-100"
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                    </svg>
                  </button>
                </div>

                <div className="mb-4">
                  <label className="mb-1 block text-xs font-medium text-zinc-500">
                    対象
                  </label>
                  <p className="rounded-md bg-zinc-50 px-3 py-2 text-sm text-zinc-700">
                    {listingTitle}
                  </p>
                </div>

                <div className="mb-1">
                  <label className="mb-1 block text-xs font-medium text-zinc-500">
                    報告理由 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => {
                      if (e.target.value.length <= MAX_REASON_LENGTH) {
                        setReason(e.target.value);
                      }
                    }}
                    placeholder="報告する理由を入力してください"
                    rows={3}
                    className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
                    maxLength={MAX_REASON_LENGTH}
                  />
                </div>

                <div className="mb-4 text-right text-xs text-zinc-400">
                  {reason.length} / {MAX_REASON_LENGTH}
                </div>

                {error && (
                  <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={handleClose}
                    disabled={submitting}
                    className="flex-1 rounded-lg border border-zinc-300 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 active:bg-zinc-100 disabled:opacity-50"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting || !reason.trim()}
                    className="flex-1 rounded-lg bg-red-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 active:bg-red-700 disabled:opacity-50"
                  >
                    {submitting ? "送信中..." : "運営へ報告"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
