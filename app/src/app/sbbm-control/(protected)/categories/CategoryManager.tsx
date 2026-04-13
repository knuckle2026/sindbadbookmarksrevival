// @ts-nocheck
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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

// --- Sortable Row Component ---
function SortableRow({
  cat,
  onEdit,
  onDelete,
  disabled,
}: {
  cat: Category;
  onEdit: (cat: Category) => void;
  onDelete: (id: string, name: string) => void;
  disabled: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: cat.id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className="border-b border-zinc-100 last:border-0 bg-white"
    >
      <td className="px-2 py-2 w-10">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab touch-none rounded p-1 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 active:cursor-grabbing"
          title="ドラッグで並べ替え"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="5" cy="3" r="1.5" />
            <circle cx="11" cy="3" r="1.5" />
            <circle cx="5" cy="8" r="1.5" />
            <circle cx="11" cy="8" r="1.5" />
            <circle cx="5" cy="13" r="1.5" />
            <circle cx="11" cy="13" r="1.5" />
          </svg>
        </button>
      </td>
      <td className="px-4 py-2 font-medium text-zinc-900">{cat.name}</td>
      <td className="px-4 py-2 text-zinc-500">{cat.slug}</td>
      <td className="px-4 py-2 text-right">
        <button
          onClick={() => onEdit(cat)}
          className="mr-2 rounded bg-zinc-100 px-3 py-1 text-xs text-zinc-700 hover:bg-zinc-200"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(cat.id, cat.name)}
          className="rounded bg-red-50 px-3 py-1 text-xs text-red-600 hover:bg-red-100"
        >
          Delete
        </button>
      </td>
    </tr>
  );
}

// --- Editing Row Component ---
function EditingRow({
  editName,
  editSlug,
  onNameChange,
  onSlugChange,
  onSave,
  onCancel,
  loading,
}: {
  editName: string;
  editSlug: string;
  onNameChange: (v: string) => void;
  onSlugChange: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <tr className="border-b border-zinc-100 last:border-0 bg-amber-50">
      <td className="px-2 py-2 w-10" />
      <td className="px-4 py-2">
        <input
          type="text"
          value={editName}
          onChange={(e) => onNameChange(e.target.value)}
          className="w-full rounded border border-zinc-300 px-2 py-1 text-sm"
        />
      </td>
      <td className="px-4 py-2">
        <input
          type="text"
          value={editSlug}
          onChange={(e) => onSlugChange(e.target.value)}
          className="w-full rounded border border-zinc-300 px-2 py-1 text-sm"
        />
      </td>
      <td className="px-4 py-2 text-right">
        <button
          onClick={onSave}
          disabled={loading}
          className="mr-2 rounded bg-emerald-600 px-3 py-1 text-xs text-white hover:bg-emerald-700"
        >
          Save
        </button>
        <button
          onClick={onCancel}
          className="rounded bg-zinc-200 px-3 py-1 text-xs text-zinc-700 hover:bg-zinc-300"
        >
          Cancel
        </button>
      </td>
    </tr>
  );
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

  // New category form
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const supabase = createClient();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // --- Drag End ---
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = categories.findIndex((c) => c.id === active.id);
    const newIndex = categories.findIndex((c) => c.id === over.id);
    const reordered = arrayMove(categories, oldIndex, newIndex);

    // Assign new sort_order based on position
    const updated = reordered.map((c, i) => ({ ...c, sort_order: i + 1 }));
    setCategories(updated);

    // Batch update to DB
    setLoading(true);
    setError("");
    try {
      await Promise.all(
        updated.map((c) =>
          supabase
            .from("categories")
            .update({ sort_order: c.sort_order })
            .eq("id", c.id)
        )
      );
      router.refresh();
    } catch (e: any) {
      setError(e.message || "Failed to save order");
    } finally {
      setLoading(false);
    }
  };

  // --- Add ---
  const handleAdd = async () => {
    if (!newName.trim() || !newSlug.trim()) return;
    setLoading(true);
    setError("");

    const nextSortOrder =
      categories.length > 0
        ? Math.max(...categories.map((c) => c.sort_order)) + 1
        : 1;

    const { data, error: err } = await supabase
      .from("categories")
      .insert({
        genre_id: genreId,
        name: newName.trim(),
        slug: newSlug.trim(),
        sort_order: nextSortOrder,
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
    setShowAdd(false);
    setLoading(false);
    router.refresh();
  };

  // --- Edit ---
  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditSlug(cat.slug);
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
      })
      .eq("id", editingId);

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    setCategories((prev) =>
      prev.map((c) =>
        c.id === editingId
          ? { ...c, name: editName.trim(), slug: editSlug.trim() }
          : c
      )
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

      {loading && (
        <div className="mb-4 text-xs text-zinc-400">Saving...</div>
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
            <div className="flex items-end">
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
      )}

      {/* Category table with drag-and-drop */}
      <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50">
              <th className="px-2 py-2 w-10" />
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
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={categories.map((c) => c.id)}
              strategy={verticalListSortingStrategy}
            >
              <tbody>
                {categories.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-6 text-center text-zinc-400"
                    >
                      No categories
                    </td>
                  </tr>
                ) : (
                  categories.map((cat) =>
                    editingId === cat.id ? (
                      <EditingRow
                        key={cat.id}
                        editName={editName}
                        editSlug={editSlug}
                        onNameChange={setEditName}
                        onSlugChange={setEditSlug}
                        onSave={handleUpdate}
                        onCancel={() => setEditingId(null)}
                        loading={loading}
                      />
                    ) : (
                      <SortableRow
                        key={cat.id}
                        cat={cat}
                        onEdit={startEdit}
                        onDelete={handleDelete}
                        disabled={!!editingId || loading}
                      />
                    )
                  )
                )}
              </tbody>
            </SortableContext>
          </DndContext>
        </table>
      </div>
    </div>
  );
}
