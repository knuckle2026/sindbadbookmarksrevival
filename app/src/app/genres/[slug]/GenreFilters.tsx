// @ts-nocheck
"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect, useTransition } from "react";

interface CategoryItem {
  id: string;
  slug: string;
  name: string;
}

interface GenreFiltersProps {
  slug: string;
  categories: CategoryItem[];
}

export default function GenreFilters({
  slug,
  categories,
}: GenreFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // ニューハーフマッサージを通常カテゴリから分離
  const normalCategories = categories.filter((c) => c.slug !== "newhalf");
  const newhalfCategory = categories.find((c) => c.slug === "newhalf");

  // ローカルstate（URLから初期化）
  const [checkedCats, setCheckedCats] = useState<Set<string>>(() => {
    const param = searchParams.get("category") ?? "";
    return new Set(param.split(",").filter(Boolean));
  });
  // URLからstateを同期（ブラウザバック対応）
  useEffect(() => {
    const catParam = searchParams.get("category") ?? "";
    setCheckedCats(new Set(catParam.split(",").filter(Boolean)));
  }, [searchParams]);

  // stateからURLを構築して遷移（region/prefecture/service_area は保持）
  const syncToUrl = (nextCats: Set<string>) => {
    const params = new URLSearchParams();
    const catStr = [...nextCats].join(",");
    if (catStr) params.set("category", catStr);
    // 他のパラメータを現在のURLから保持
    const currentRegion = searchParams.get("region");
    if (currentRegion) params.set("region", currentRegion);
    const currentPref = searchParams.get("prefecture");
    if (currentPref) params.set("prefecture", currentPref);
    const currentArea = searchParams.get("service_area");
    if (currentArea) params.set("service_area", currentArea);
    const currentSort = searchParams.get("sort");
    if (currentSort) params.set("sort", currentSort);
    const qs = params.toString();
    const url = `${pathname}${qs ? `?${qs}` : ""}`;
    startTransition(() => {
      router.replace(url, { scroll: false });
    });
  };

  // --- カテゴリ ---
  const normalSlugs = normalCategories.map((c) => c.slug);
  const allNormalChecked =
    normalSlugs.length > 0 && normalSlugs.every((s) => checkedCats.has(s));
  const newhalfChecked = newhalfCategory
    ? checkedCats.has(newhalfCategory.slug)
    : false;

  const toggleAll = () => {
    const next = new Set(checkedCats);
    if (allNormalChecked) {
      normalSlugs.forEach((s) => next.delete(s));
    } else {
      normalSlugs.forEach((s) => next.add(s));
    }
    setCheckedCats(next);
    syncToUrl(next);
  };

  const toggleCat = (catSlug: string) => {
    const next = new Set(checkedCats);
    if (next.has(catSlug)) {
      next.delete(catSlug);
    } else {
      next.add(catSlug);
    }
    setCheckedCats(next);
    syncToUrl(next);
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
            {/* すべて */}
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={allNormalChecked}
                onChange={toggleAll}
                className="h-4 w-4 rounded border-zinc-300 text-red-600 focus:ring-red-500"
              />
              <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                すべて
              </span>
            </label>

            {/* 通常カテゴリ */}
            {normalCategories.map((c) => (
              <label
                key={c.id}
                className="flex items-center gap-1.5 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={checkedCats.has(c.slug)}
                  onChange={() => toggleCat(c.slug)}
                  className="h-4 w-4 rounded border-zinc-300 text-red-600 focus:ring-red-500"
                />
                <span className="text-sm text-zinc-800 dark:text-zinc-200">
                  {c.name}
                </span>
              </label>
            ))}

            {/* ニューハーフマッサージ（明示的オプトイン） */}
            {newhalfCategory && (
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newhalfChecked}
                  onChange={() => toggleCat(newhalfCategory.slug)}
                  className="h-4 w-4 rounded border-zinc-300 text-red-600 focus:ring-red-500"
                />
                <span className="text-sm text-zinc-800 dark:text-zinc-200">
                  {newhalfCategory.name}
                </span>
              </label>
            )}
          </div>
        </div>
      )}

      {isPending && (
        <p className="text-xs text-zinc-400">読み込み中...</p>
      )}
    </div>
  );
}
