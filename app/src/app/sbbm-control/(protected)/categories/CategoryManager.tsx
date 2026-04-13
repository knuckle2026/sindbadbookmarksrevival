// @ts-nocheck
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Category {
  id: string;
  slug: string;
  name: string;
  sort_order: number;
}

interface Props {
  genreId: string;
  genreSlug: string;
  genreName: string;
  initialCategories: Category[];
}

export default function CategoryManager({
  genreId,
  genreSlug,
  genreName,
  initialCategories,
}: Props) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editSortOrder, setEditSortOrder] = useState(0);

  // New category form
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newSortOrder, setNewSortOrder] = useState(
    categories.length > 0
      ? Math.max(...categories.map((c) => c.sort_order)) + 1
      : 1
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const supabase = createClient();

  // --- Add ---
  const handleAdd = async () => {
    if (!newName.trim() || !newSlug.trim()) return;
    setLoading(true);
    setError("");

    const { data, error: err } = await supabase
      .from("categories")
      .insert({
        genre_id: genreId,
        name: newName.trim(),
        slug: newSlug.trim(),
        sort_order: newSortOrder,
      })
      .select("id, slug, name, sort_order")
      .single();

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    setCategories((prev) =>
      [...prev, data].sort((a, b) => a.sort_order - b.sort_order)
    );
    setNewName("");
    setNewSlug("");
    setNewSortOrder(newSortOrder + 1);
    setShowAdd(false);
    setLoading(false);
    router.refresh();
  };

  // --- Edit ---
  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditSlug(cat.slug);
    setEditSortOrder(cat.sort_order);
  };

  const handleUpdate = async () => {
    if (!editingId || !editName.trim()) return;
    setLoading(true);
    setError("");

    const { error: err } = await supabase
      .from("categories")
      .update({
        name: editName.trim(),
        slug: editSlug.trim(),
        sort_order: editSortOrder,
      })
      .eq("id", editingId);

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    setCategories((prev) =>
      prev
        .map((c) =>
          c.id === editingId
            ? { ...c, name: editName.trim(), slug: editSlug.trim(), sort_order: editSortOrder }
            : c
        )
        .sort((a, b) => a.sort_order - b.sort_order)
    );
    setEditingId(null);
    setLoading(false);
    router.refresh();
  };

  // --- Delete ---
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"?`)) return;
    setLoading(true);
    setError("");

    const { error: err } = await supabase
      .from("categories")
      .delete()
      .eq("id", id);

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    setCategories((prev) => prev.filter((c) => c.id !== id));
    setLoading(false);
    router.refresh();
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900">{genreName}</h2>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          {showAdd ? "Cancel" : "+ Add Category"}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Add form */}
      {showAdd && (
        <div className="mb-4 rounded-lg border border-zinc-200 bg-white p-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500">
                Name
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Category name"
                className="w-full rounded-md border border-zinc-300 px-3 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500">
                Slug
              </label>
              <input
                type="text"
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value)}
                placeholder="category-slug"
                className="w-full rounded-md border border-zinc-300 px-3 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500">
                Sort Order
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={newSortOrder}
                  onChange={(e) => setNewSortOrder(Number(e.target.value))}
                  className="w-20 rounded-md border border-zinc-300 px-3 py-1.5 text-sm"
                />
                <button
                  onClick={handleAdd}
                  disabled={loading}
                  className="rounded-md bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category table */}
      <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50">
              <th className="px-4 py-2 text-left font-medium text-zinc-500">
                Sort
              </th>
              <th className="px-4 py-2 text-left font-medium text-zinc-500">
                Name
              </th>
              <th className="px-4 py-2 text-left font-medium text-zinc-500">
                Slug
              </th>
              <th className="px-4 py-2 text-right font-medium text-zinc-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-zinc-400">
                  No categories
                </td>
              </tr>
            ) : (
              categories.map((cat) => (
                <tr
                  key={cat.id}
                  className="border-b border-zinc-100 last:border-0"
                >
                  {editingId === cat.id ? (
                    <>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          value={editSortOrder}
                          onChange={(e) =>
                            setEditSortOrder(Number(e.target.value))
                          }
                          className="w-16 rounded border border-zinc-300 px-2 py-1 text-sm"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full rounded border border-zinc-300 px-2 py-1 text-sm"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={editSlug}
                          onChange={(e) => setEditSlug(e.target.value)}
                          className="w-full rounded border border-zinc-300 px-2 py-1 text-sm"
                        />
                      </td>
                      <td className="px-4 py-2 text-right">
                        <button
                          onClick={handleUpdate}
                          disabled={loading}
                          className="mr-2 rounded bg-emerald-600 px-3 py-1 text-xs text-white hover:bg-emerald-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="rounded bg-zinc-200 px-3 py-1 text-xs text-zinc-700 hover:bg-zinc-300"
                        >
                          Cancel
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-2 text-zinc-600">
                        {cat.sort_order}
                      </td>
                      <td className="px-4 py-2 font-medium text-zinc-900">
                        {cat.name}
                      </td>
                      <td className="px-4 py-2 text-zinc-500">{cat.slug}</td>
                      <td className="px-4 py-2 text-right">
                        <button
                          onClick={() => startEdit(cat)}
                          className="mr-2 rounded bg-zinc-100 px-3 py-1 text-xs text-zinc-700 hover:bg-zinc-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id, cat.name)}
                          disabled={loading}
                          className="rounded bg-red-50 px-3 py-1 text-xs text-red-600 hover:bg-red-100"
                        >
                          Delete
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
