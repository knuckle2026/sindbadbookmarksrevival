// @ts-nocheck
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { PREFECTURE_REGIONS } from "@/lib/constants/prefectures";
import { SERVICE_AREA_GROUPS } from "@/lib/constants/service-areas";

interface CategoryItem {
  id: string;
  slug: string;
  name: string;
}

interface GenreFiltersProps {
  slug: string;
  categories: CategoryItem[];
  /** Whether this genre has service areas (massage-urisen) */
  hasServiceAreas: boolean;
}

export default function GenreFilters({
  slug,
  categories,
  hasServiceAreas,
}: GenreFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse current state from URL
  const selectedCategories = (searchParams.get("category") ?? "")
    .split(",")
    .filter(Boolean);
  const selectedPrefecture = searchParams.get("prefecture") ?? "";
  const selectedServiceAreas = (searchParams.get("service_area") ?? "")
    .split(",")
    .filter(Boolean);

  const buildUrl = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      // Always reset page when filters change
      params.delete("page");

      for (const [key, value] of Object.entries(updates)) {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      }

      const qs = params.toString();
      return `/genres/${slug}${qs ? `?${qs}` : ""}`;
    },
    [slug, searchParams],
  );

  const allCategorySlugs = categories.map((c) => c.slug);
  const allCategoriesSelected =
    allCategorySlugs.length > 0 &&
    allCategorySlugs.every((s) => selectedCategories.includes(s));

  const toggleAllCategories = () => {
    if (allCategoriesSelected) {
      // 全解除
      router.push(buildUrl({ category: "" }));
    } else {
      // 全選択
      router.push(buildUrl({ category: allCategorySlugs.join(",") }));
    }
  };

  const toggleCategory = (catSlug: string) => {
    const next = selectedCategories.includes(catSlug)
      ? selectedCategories.filter((c) => c !== catSlug)
      : [...selectedCategories, catSlug];
    router.push(buildUrl({ category: next.join(",") }));
  };

  const setPrefecture = (value: string) => {
    router.push(buildUrl({ prefecture: value }));
  };

  const toggleServiceArea = (areaSlug: string) => {
    const next = selectedServiceAreas.includes(areaSlug)
      ? selectedServiceAreas.filter((a) => a !== areaSlug)
      : [...selectedServiceAreas, areaSlug];
    router.push(buildUrl({ service_area: next.join(",") }));
  };

  return (
    <div className="mb-6 space-y-4">
      {/* カテゴリチェックボックス */}
      {categories.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            カテゴリで絞り込み（複数選択可）
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={allCategoriesSelected}
                onChange={toggleAllCategories}
                className="h-4 w-4 rounded border-zinc-300 text-red-600 focus:ring-red-500"
              />
              <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                すべて
              </span>
            </label>
            {categories.map((c) => {
              const checked = selectedCategories.includes(c.slug);
              return (
                <label
                  key={c.id}
                  className="flex items-center gap-1.5 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleCategory(c.slug)}
                    className="h-4 w-4 rounded border-zinc-300 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm text-zinc-800 dark:text-zinc-200">
                    {c.name}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* 都道府県フィルタ (マッサージ・売り専のみ) */}
      {hasServiceAreas && (
        <div>
          <p className="mb-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            都道府県で絞り込み
          </p>
          <select
            value={selectedPrefecture}
            onChange={(e) => setPrefecture(e.target.value)}
            className="w-full max-w-xs rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          >
            <option value="">すべての都道府県</option>
            {PREFECTURE_REGIONS.map((region) => (
              <optgroup key={region.slug} label={region.name}>
                {region.prefectures.map((p) => (
                  <option key={p.slug} value={p.slug}>
                    {p.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      )}

      {/* 出張エリアフィルタ (マッサージ・売り専のみ) */}
      {hasServiceAreas && (
        <div>
          <p className="mb-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            出張エリアで絞り込み（複数選択可）
          </p>
          <div className="space-y-3">
            {SERVICE_AREA_GROUPS.map((group) => (
              <div key={group.label}>
                <p className="mb-1 text-xs font-medium text-zinc-400 dark:text-zinc-500">
                  {group.label}
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  {group.areas.map((a) => {
                    const checked = selectedServiceAreas.includes(a.slug);
                    return (
                      <label
                        key={a.slug}
                        className="flex items-center gap-1.5 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleServiceArea(a.slug)}
                          className="h-4 w-4 rounded border-zinc-300 text-red-600 focus:ring-red-500"
                        />
                        <span className="text-sm text-zinc-800 dark:text-zinc-200">
                          {a.name}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
