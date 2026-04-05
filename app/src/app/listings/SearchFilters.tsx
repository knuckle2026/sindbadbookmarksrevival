"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useTransition } from "react";

interface Category {
  id: string;
  group_type: "purpose" | "industry";
  name: string;
  slug: string;
}

interface Props {
  categories: Category[];
  currentParams: { q?: string; type?: string; category?: string; friendliness?: string };
}

export default function SearchFilters({ categories, currentParams }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();
  const [q, setQ] = useState(currentParams.q ?? "");

  const updateParams = (updates: Record<string, string | undefined>) => {
    const merged = { ...currentParams, ...updates };
    const params = new URLSearchParams();
    Object.entries(merged).forEach(([key, val]) => {
      if (val) params.set(key, val);
    });
    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `${pathname}?${qs}` : pathname);
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ q: q.trim() || undefined });
  };

  const hasFilters = currentParams.q || currentParams.type || currentParams.category || currentParams.friendliness;

  return (
    <div className="space-y-3 mb-6">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="キーワードで検索..."
          className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700"
        >
          検索
        </button>
      </form>

      <div className="flex flex-wrap gap-2 items-center">
        <select
          value={currentParams.type ?? ""}
          onChange={(e) => updateParams({ type: e.target.value || undefined })}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">タイプ：すべて</option>
          <option value="shop">店舗</option>
          <option value="organization">団体・コミュニティ</option>
          <option value="media">メディア・Webサービス</option>
        </select>

        <select
          value={currentParams.friendliness ?? ""}
          onChange={(e) => updateParams({ friendliness: e.target.value || undefined })}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">フレンドリー度：すべて</option>
          <option value="Dedicated">専門</option>
          <option value="Friendly">フレンドリー</option>
          <option value="Ally">アライ</option>
        </select>

        <select
          value={currentParams.category ?? ""}
          onChange={(e) => updateParams({ category: e.target.value || undefined })}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">カテゴリ：すべて</option>
          <optgroup label="目的別">
            {categories
              .filter((c) => c.group_type === "purpose")
              .map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
          </optgroup>
          <optgroup label="業態別">
            {categories
              .filter((c) => c.group_type === "industry")
              .map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
          </optgroup>
        </select>

        {hasFilters && (
          <button
            onClick={() => {
              setQ("");
              router.push(pathname);
            }}
            className="text-sm text-red-600 hover:text-red-800 px-2 py-1"
          >
            フィルターをクリア
          </button>
        )}
      </div>
    </div>
  );
}
