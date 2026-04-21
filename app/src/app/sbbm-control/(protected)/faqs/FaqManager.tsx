// @ts-nocheck
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Faq {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
  created_at: string;
}

interface Props {
  initialItems: Faq[];
}

export default function FaqManager({ initialItems }: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [items, setItems] = useState<Faq[]>(initialItems);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQuestion, setEditQuestion] = useState("");
  const [editAnswer, setEditAnswer] = useState("");
  const [editSortOrder, setEditSortOrder] = useState(0);

  const [showAdd, setShowAdd] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAdd = async () => {
    if (!newQuestion.trim() || !newAnswer.trim()) return;
    setLoading(true);
    setError("");

    const nextSortOrder =
      items.length > 0 ? Math.max(...items.map((i) => i.sort_order)) + 1 : 1;

    const { data, error: err } = await supabase
      .from("faqs")
      .insert({
        question: newQuestion.trim(),
        answer: newAnswer.trim(),
        sort_order: nextSortOrder,
      })
      .select("id, question, answer, sort_order, created_at")
      .single();

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    setItems((prev) => [...prev, data as Faq].sort((a, b) => a.sort_order - b.sort_order));
    setNewQuestion("");
    setNewAnswer("");
    setShowAdd(false);
    setLoading(false);
    router.refresh();
  };

  const startEdit = (item: Faq) => {
    setEditingId(item.id);
    setEditQuestion(item.question);
    setEditAnswer(item.answer);
    setEditSortOrder(item.sort_order);
  };

  const handleUpdate = async () => {
    if (!editingId || !editQuestion.trim() || !editAnswer.trim()) return;
    setLoading(true);
    setError("");

    const { error: err } = await supabase
      .from("faqs")
      .update({
        question: editQuestion.trim(),
        answer: editAnswer.trim(),
        sort_order: editSortOrder,
      })
      .eq("id", editingId);

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    setItems((prev) =>
      prev
        .map((i) =>
          i.id === editingId
            ? {
                ...i,
                question: editQuestion.trim(),
                answer: editAnswer.trim(),
                sort_order: editSortOrder,
              }
            : i
        )
        .sort((a, b) => a.sort_order - b.sort_order)
    );
    setEditingId(null);
    setLoading(false);
    router.refresh();
  };

  const handleDelete = async (id: string, question: string) => {
    if (!confirm(`FAQ「${question}」を削除しますか？`)) return;
    setLoading(true);
    setError("");

    const { error: err } = await supabase.from("faqs").delete().eq("id", id);

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    setItems((prev) => prev.filter((i) => i.id !== id));
    setLoading(false);
    router.refresh();
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-end">
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          {showAdd ? "キャンセル" : "+ 新規作成"}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading && <div className="mb-4 text-xs text-zinc-400">保存中...</div>}

      {showAdd && (
        <div className="mb-4 space-y-3 rounded-lg border border-zinc-200 bg-white p-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">
              質問（最大200文字）
            </label>
            <input
              type="text"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              maxLength={200}
              className="w-full rounded-md border border-zinc-300 px-3 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">
              回答（最大2000文字）
            </label>
            <textarea
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              maxLength={2000}
              rows={4}
              className="w-full rounded-md border border-zinc-300 px-3 py-1.5 text-sm"
            />
          </div>
          <button
            onClick={handleAdd}
            disabled={loading}
            className="rounded-md bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            登録
          </button>
        </div>
      )}

      <ul className="space-y-3">
        {items.length === 0 ? (
          <li className="rounded-lg border border-zinc-200 bg-white p-6 text-center text-sm text-zinc-400">
            FAQはまだありません
          </li>
        ) : (
          items.map((item) =>
            editingId === item.id ? (
              <li
                key={item.id}
                className="space-y-3 rounded-lg border border-amber-300 bg-amber-50 p-4"
              >
                <input
                  type="text"
                  value={editQuestion}
                  onChange={(e) => setEditQuestion(e.target.value)}
                  maxLength={200}
                  className="w-full rounded-md border border-zinc-300 px-3 py-1.5 text-sm"
                />
                <textarea
                  value={editAnswer}
                  onChange={(e) => setEditAnswer(e.target.value)}
                  maxLength={2000}
                  rows={4}
                  className="w-full rounded-md border border-zinc-300 px-3 py-1.5 text-sm"
                />
                <div className="flex items-center gap-3">
                  <label className="text-xs text-zinc-500">並び順</label>
                  <input
                    type="number"
                    value={editSortOrder}
                    onChange={(e) => setEditSortOrder(parseInt(e.target.value, 10) || 0)}
                    className="w-20 rounded-md border border-zinc-300 px-2 py-1 text-sm"
                  />
                  <button
                    onClick={handleUpdate}
                    disabled={loading}
                    className="ml-auto rounded bg-emerald-600 px-3 py-1 text-xs text-white hover:bg-emerald-700"
                  >
                    保存
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="rounded bg-zinc-200 px-3 py-1 text-xs text-zinc-700 hover:bg-zinc-300"
                  >
                    キャンセル
                  </button>
                </div>
              </li>
            ) : (
              <li
                key={item.id}
                className="rounded-lg border border-zinc-200 bg-white p-4"
              >
                <div className="mb-2 flex items-baseline justify-between gap-3">
                  <p className="font-semibold text-zinc-900">
                    Q. {item.question}
                  </p>
                  <span className="shrink-0 text-xs text-zinc-400">
                    順序: {item.sort_order}
                  </span>
                </div>
                <p className="mb-3 whitespace-pre-wrap text-sm text-zinc-700">
                  A. {item.answer}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(item)}
                    className="rounded bg-zinc-100 px-3 py-1 text-xs text-zinc-700 hover:bg-zinc-200"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => handleDelete(item.id, item.question)}
                    className="rounded bg-red-50 px-3 py-1 text-xs text-red-600 hover:bg-red-100"
                  >
                    削除
                  </button>
                </div>
              </li>
            )
          )
        )}
      </ul>
    </div>
  );
}
