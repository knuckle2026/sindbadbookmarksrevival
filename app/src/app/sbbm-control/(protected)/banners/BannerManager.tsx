"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface Banner {
  id: string;
  storage_key: string;
  image_url: string;
  link_url: string;
  placement: string;
  alt: string | null;
  sort_order: number;
  enabled: 0 | 1;
}

interface GenreOpt {
  slug: string;
  name: string;
}

interface Props {
  initialItems: Banner[];
  genres: GenreOpt[];
}

async function jsonOrThrow(res: Response): Promise<unknown> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json();
}

interface UploadResult {
  storageKey: string;
  publicUrl: string;
}

async function uploadImage(file: File): Promise<UploadResult> {
  const form = new FormData();
  form.set("file", file);
  const res = await fetch("/api/admin/banners/upload", {
    method: "POST",
    body: form,
  });
  const json = (await jsonOrThrow(res)) as UploadResult;
  return json;
}

function placementLabel(p: string, genres: GenreOpt[]): string {
  if (p === "top") return "トップ";
  if (p.startsWith("genres:")) {
    const slug = p.slice("genres:".length);
    const g = genres.find((x) => x.slug === slug);
    return g ? `ジャンル: ${g.name}` : p;
  }
  return p;
}

interface FormState {
  storageKey: string;
  imageUrl: string;
  linkUrl: string;
  placement: string;
  alt: string;
  sortOrder: number;
  enabled: boolean;
}

const emptyForm: FormState = {
  storageKey: "",
  imageUrl: "",
  linkUrl: "",
  placement: "top",
  alt: "",
  sortOrder: 0,
  enabled: true,
};

export default function BannerManager({ initialItems, genres }: Props) {
  const router = useRouter();
  const [items, setItems] = useState<Banner[]>(initialItems);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [selectedFileName, setSelectedFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowAdd(false);
    setError("");
    setSelectedFileName("");
  };

  const startEdit = (b: Banner) => {
    setEditingId(b.id);
    setForm({
      storageKey: b.storage_key,
      imageUrl: b.image_url,
      linkUrl: b.link_url,
      placement: b.placement,
      alt: b.alt ?? "",
      sortOrder: b.sort_order,
      enabled: b.enabled === 1,
    });
    setShowAdd(true);
    setError("");
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFileName(file.name);
    setUploading(true);
    setError("");
    try {
      const r = await uploadImage(file);
      setForm((prev) => ({
        ...prev,
        storageKey: r.storageKey,
        imageUrl: r.publicUrl,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!form.storageKey || !form.imageUrl) {
      setError("画像をアップロードしてください");
      return;
    }
    if (!form.linkUrl.trim()) {
      setError("リンク URL を入力してください");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const body = {
        storage_key: form.storageKey,
        image_url: form.imageUrl,
        link_url: form.linkUrl.trim(),
        placement: form.placement,
        alt: form.alt.trim(),
        sort_order: form.sortOrder,
        enabled: form.enabled ? 1 : 0,
      };
      if (editingId) {
        const res = await fetch(`/api/admin/banners/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        await jsonOrThrow(res);
        setItems((prev) =>
          prev.map((b) =>
            b.id === editingId
              ? {
                  ...b,
                  storage_key: form.storageKey,
                  image_url: form.imageUrl,
                  link_url: form.linkUrl.trim(),
                  placement: form.placement,
                  alt: form.alt.trim() || null,
                  sort_order: form.sortOrder,
                  enabled: (form.enabled ? 1 : 0) as 0 | 1,
                }
              : b,
          ),
        );
      } else {
        const res = await fetch("/api/admin/banners", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const created = (await jsonOrThrow(res)) as Banner;
        setItems((prev) => [...prev, created]);
      }
      resetForm();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("このバナーを削除しますか？画像も Storage から削除されます。"))
      return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/banners/${id}`, {
        method: "DELETE",
      });
      await jsonOrThrow(res);
      setItems((prev) => prev.filter((b) => b.id !== id));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setLoading(false);
    }
  };

  // group by placement for display
  const grouped = new Map<string, Banner[]>();
  for (const b of items) {
    const arr = grouped.get(b.placement) ?? [];
    arr.push(b);
    grouped.set(b.placement, arr);
  }
  for (const arr of grouped.values()) {
    arr.sort((a, b) => a.sort_order - b.sort_order);
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-end">
        <button
          onClick={() => {
            if (showAdd) {
              resetForm();
            } else {
              setShowAdd(true);
              setForm(emptyForm);
              setEditingId(null);
            }
          }}
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

      {showAdd && (
        <div className="mb-6 space-y-3 rounded-lg border border-zinc-200 bg-white p-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">
              バナー画像 (推奨 1000×200 px, 5:1, 最大 2MB)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFile}
              disabled={uploading || loading}
              className="sr-only"
            />
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || loading}
                className="inline-flex items-center gap-2 rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-800 shadow-sm hover:bg-zinc-50 disabled:opacity-50"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a3 3 0 0 0-3 3v3a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-3a3 3 0 0 0-3-3h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z"
                    clipRule="evenodd"
                  />
                </svg>
                {form.imageUrl ? "画像を選び直す" : "画像ファイルを選択"}
              </button>
              <span className="text-xs text-zinc-500">
                {uploading
                  ? "アップロード中..."
                  : selectedFileName || "未選択"}
              </span>
            </div>
            {form.imageUrl && (
              <div className="mt-2 aspect-[5/1] w-full overflow-hidden rounded border border-zinc-200 bg-zinc-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.imageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">
              リンク URL (HTTPS)
            </label>
            <input
              type="url"
              value={form.linkUrl}
              onChange={(e) =>
                setForm((p) => ({ ...p, linkUrl: e.target.value }))
              }
              placeholder="https://example.com/landing"
              className="w-full rounded-md border border-zinc-300 px-3 py-1.5 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">
              表示場所
            </label>
            <select
              value={form.placement}
              onChange={(e) =>
                setForm((p) => ({ ...p, placement: e.target.value }))
              }
              className="w-full rounded-md border border-zinc-300 px-3 py-1.5 text-sm"
            >
              <option value="top">トップ</option>
              {genres.map((g) => (
                <option key={g.slug} value={`genres:${g.slug}`}>
                  ジャンル: {g.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">
              alt テキスト (任意)
            </label>
            <input
              type="text"
              value={form.alt}
              onChange={(e) => setForm((p) => ({ ...p, alt: e.target.value }))}
              maxLength={200}
              className="w-full rounded-md border border-zinc-300 px-3 py-1.5 text-sm"
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="text-xs text-zinc-500">並び順</label>
            <input
              type="number"
              value={form.sortOrder}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  sortOrder: parseInt(e.target.value, 10) || 0,
                }))
              }
              className="w-20 rounded-md border border-zinc-300 px-2 py-1 text-sm"
            />
            <label className="ml-4 flex items-center gap-2 text-xs text-zinc-700">
              <input
                type="checkbox"
                checked={form.enabled}
                onChange={(e) =>
                  setForm((p) => ({ ...p, enabled: e.target.checked }))
                }
              />
              有効
            </label>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={loading || uploading}
              className="rounded-md bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {editingId ? "更新" : "登録"}
            </button>
            <button
              onClick={resetForm}
              className="rounded-md bg-zinc-200 px-4 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-300"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}

      {grouped.size === 0 ? (
        <p className="rounded-lg border border-zinc-200 bg-white p-6 text-center text-sm text-zinc-400">
          バナーはまだ登録されていません
        </p>
      ) : (
        <div className="space-y-6">
          {Array.from(grouped.entries()).map(([placement, list]) => (
            <section key={placement}>
              <h2 className="mb-2 text-sm font-semibold text-zinc-700">
                {placementLabel(placement, genres)}
              </h2>
              <ul className="space-y-3">
                {list.map((b) => (
                  <li
                    key={b.id}
                    className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white p-3"
                  >
                    <div className="aspect-[5/1] w-32 shrink-0 overflow-hidden rounded border border-zinc-200 bg-zinc-50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={b.image_url}
                        alt={b.alt ?? ""}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs text-zinc-600">
                        <a
                          href={b.link_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {b.link_url}
                        </a>
                      </p>
                      <p className="text-xs text-zinc-400">
                        順序 {b.sort_order} ・{" "}
                        {b.enabled === 1 ? "有効" : "無効"}
                      </p>
                    </div>
                    <button
                      onClick={() => startEdit(b)}
                      className="rounded bg-zinc-100 px-3 py-1 text-xs text-zinc-700 hover:bg-zinc-200"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => handleDelete(b.id)}
                      className="rounded bg-red-50 px-3 py-1 text-xs text-red-600 hover:bg-red-100"
                    >
                      削除
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
