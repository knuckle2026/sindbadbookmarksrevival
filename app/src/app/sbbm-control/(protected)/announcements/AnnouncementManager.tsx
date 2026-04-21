// @ts-nocheck
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Announcement {
  id: string;
  title: string;
  body: string;
  sort_order: number;
  created_at: string;
}

interface Props {
  initialItems: Announcement[];
}

export default function AnnouncementManager({ initialItems }: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [items, setItems] = useState<Announcement[]>(initialItems);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [editSortOrder, setEditSortOrder] = useState(0);

  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAdd = async () => {
    if (!newTitle.trim() || !newBody.trim()) return;
    setLoading(true);
    setError("");

    const nextSortOrder =
      items.length > 0 ? Math.max(...items.map((i) => i.sort_order)) + 1 : 1;

    const { data, error: err } = await supabase
      .from("announcements")
      .insert({
        title: newTitle.trim(),
        body: newBody.trim(),
        sort_order: nextSortOrder,
      })
      .select("id, title, body, sort_order, created_at")
      .single();

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    setItems((prev) => [...prev, data as Announcement].sort((a, b) => a.sort_order - b.sort_order));
    setNewTitle("");
    setNewBody("");
    setShowAdd(false);
    setLoading(false);
    router.refresh();
  };

  const startEdit = (item: Announcement) => {
    setEditingId(item.id);
    setEditTitle(item.title);
    setEditBody(item.body);
    setEditSortOrder(item.sort_order);
  };

  const handleUpdate = async () => {
    if (!editingId || !editTitle.trim() || !editBody.trim()) return;
    setLoading(true);
    setError("");

    const { error: err } = await supabase
      .from("announcements")
      .update({
        title: editTitle.trim(),
        body: editBody.trim(),
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
            ? { ...i, title: editTitle.trim(), body: editBody.trim(), sort_order: editSortOrder }
            : i
        )
        .sort((a, b) => a.sort_order - b.sort_order)
    );
    setEditingId(null);
    setLoading(false);
    router.refresh();
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`お知らせ「${title}」を削除しますか？`)) return;
    setLoading(true);
    setError("");

    const { error: err } = await supabase.from("announcements").delete().eq("id", id);

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
              タイトル（最大100文字）
            </label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              maxLength={100}
              className="w-full rounded-md border border-zinc-300 px-3 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">
              本文（最大2000文字）
            </label>
            <textarea
              value={newBody}
              onChange={(e) => setNewBody(e.target.value)}
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
            お知らせはまだありません
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
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  maxLength={100}
                  className="w-full rounded-md border border-zinc-300 px-3 py-1.5 text-sm"
                />
                <textarea
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
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
                  <h3 className="font-semibold text-zinc-900">{item.title}</h3>
                  <span className="shrink-0 text-xs text-zinc-400">
                    順序: {item.sort_order}
                  </span>
                </div>
                <p className="mb-3 whitespace-pre-wrap text-sm text-zinc-700">
                  {item.body}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(item)}
                    className="rounded bg-zinc-100 px-3 py-1 text-xs text-zinc-700 hover:bg-zinc-200"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => handleDelete(item.id, item.title)}
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
