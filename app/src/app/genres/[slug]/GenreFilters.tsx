// @ts-nocheck
"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect, useTransition } from "react";
import { SERVICE_AREA_GROUPS } from "@/lib/constants/service-areas";

interface CategoryItem {
  id: string;
  slug: string;
  name: string;
}

interface GenreFiltersProps {
  slug: string;
  categories: CategoryItem[];
  hasServiceAreas: boolean;
}

export default function GenreFilters({
  slug,
  categories,
  hasServiceAreas,
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
  const [checkedAreas, setCheckedAreas] = useState<Set<string>>(() => {
    const param = searchParams.get("service_area") ?? "";
    return new Set(param.split(",").filter(Boolean));
  });

  // URLからstateを同期（ブラウザバック対応）
  useEffect(() => {
    const catParam = searchParams.get("category") ?? "";
    setCheckedCats(new Set(catParam.split(",").filter(Boolean)));
    const areaParam = searchParams.get("service_area") ?? "";
    setCheckedAreas(new Set(areaParam.split(",").filter(Boolean)));
  }, [searchParams]);

  // stateからURLを構築して遷移（region/prefecture は保持）
  const syncToUrl = (nextCats: Set<string>, nextAreas: Set<string>) => {
    const params = new URLSearchParams();
    const catStr = [...nextCats].join(",");
    if (catStr) params.set("category", catStr);
    // region/prefecture を現在のURLから保持
    const currentRegion = searchParams.get("region");
    if (currentRegion) params.set("region", currentRegion);
    const currentPref = searchParams.get("prefecture");
    if (currentPref) params.set("prefecture", currentPref);
    const areaStr = [...nextAreas].join(",");
    if (areaStr) params.set("service_area", areaStr);
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
    syncToUrl(next, checkedAreas);
  };

  const toggleCat = (catSlug: string) => {
    const next = new Set(checkedCats);
    if (next.has(catSlug)) {
      next.delete(catSlug);
    } else {
      next.add(catSlug);
    }
    setCheckedCats(next);
    syncToUrl(next, checkedAreas);
  };

  // --- 出張エリア ---
  const toggleArea = (areaSlug: string) => {
    const next = new Set(checkedAreas);
    if (next.has(areaSlug)) {
      next.delete(areaSlug);
    } else {
      next.add(areaSlug);
    }
    setCheckedAreas(next);
    syncToUrl(checkedCats, next);
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

      {/* 出張可能サービスのエリアフィルタ (マッサージ・売り専のみ) */}
      {hasServiceAreas && (
        <div>
          <p className="mb-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            出張可能サービスのエリア絞り込み（複数選択可）
          </p>
          <div className="space-y-3">
            {SERVICE_AREA_GROUPS.map((group) => (
              <div key={group.label}>
                <p className="mb-1 text-xs font-medium text-zinc-400 dark:text-zinc-500">
                  {group.label}
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  {group.areas.map((a) => (
                    <label
                      key={a.slug}
                      className="flex items-center gap-1.5 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={checkedAreas.has(a.slug)}
                        onChange={() => toggleArea(a.slug)}
                        className="h-4 w-4 rounded border-zinc-300 text-red-600 focus:ring-red-500"
                      />
                      <span className="text-sm text-zinc-800 dark:text-zinc-200">
                        {a.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isPending && (
        <p className="text-xs text-zinc-400">読み込み中...</p>
      )}
    </div>
  );
}
