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
  /** 各カテゴリを toggle した後の件数 (slug → count) */
  categoryCounts?: Record<string, number>;
  /** 「すべて」を toggle した後の件数 */
  allToggleCount?: number;
  /** 「レズ・ニューハーフ以外」を toggle した後の件数 */
  excludeNhToggleCount?: number;
}

export default function GenreFilters({
  slug,
  categories,
  categoryCounts,
  allToggleCount,
  excludeNhToggleCount,
}: GenreFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // ニューハーフマッサージを通常カテゴリから分離
  const normalCategories = categories.filter((c) => c.slug !== "newhalf");
  const newhalfCategory = categories.find((c) => c.slug === "newhalf");
  const lesCategory = categories.find((c) => c.slug === "les");

  // ローカルstate（URLから初期化）
  const [checkedCats, setCheckedCats] = useState<Set<string>>(() => {
    const param = searchParams.get("category") ?? "";
    return new Set(param.split(",").filter(Boolean));
  });
  const [excludeNh, setExcludeNh] = useState<boolean>(
    () => searchParams.get("exclude_nh") === "1",
  );
  const [catOp, setCatOp] = useState<"or" | "and">(
    () => (searchParams.get("cat_op") === "and" ? "and" : "or"),
  );

  // URLからstateを同期（ブラウザバック対応）
  useEffect(() => {
    const catParam = searchParams.get("category") ?? "";
    setCheckedCats(new Set(catParam.split(",").filter(Boolean)));
    setExcludeNh(searchParams.get("exclude_nh") === "1");
    setCatOp(searchParams.get("cat_op") === "and" ? "and" : "or");
  }, [searchParams]);

  // stateからURLを構築して遷移
  const syncToUrl = (
    nextCats: Set<string>,
    nextExcludeNh: boolean,
    nextCatOp: "or" | "and",
  ) => {
    const params = new URLSearchParams();
    const catStr = [...nextCats].join(",");
    if (catStr) params.set("category", catStr);
    if (nextExcludeNh) params.set("exclude_nh", "1");
    if (nextCatOp === "and") params.set("cat_op", "and");
    // 他のパラメータを現在のURLから保持
    const currentRegion = searchParams.get("region");
    if (currentRegion) params.set("region", currentRegion);
    const currentPref = searchParams.get("prefecture");
    if (currentPref) params.set("prefecture", currentPref);
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
  const newhalfSlug = newhalfCategory?.slug;
  const lesSlug = lesCategory?.slug;
  const newhalfChecked = newhalfSlug ? checkedCats.has(newhalfSlug) : false;
  // 「すべて」は通常カテゴリ + ニューハーフ も含めて全 ON のときに ON 表示
  const allChecked =
    normalSlugs.length > 0 &&
    normalSlugs.every((s) => checkedCats.has(s)) &&
    (newhalfSlug ? checkedCats.has(newhalfSlug) : true);

  const toggleAll = () => {
    const next = new Set<string>();
    let nextExcludeNh = excludeNh;
    if (!allChecked) {
      // OFF→ON: 通常 + ニューハーフ も全 ON (全件表示)
      normalSlugs.forEach((s) => next.add(s));
      if (newhalfSlug) next.add(newhalfSlug);
      // ニューハーフを含めて全 ON にするとき、excludeNh は論理矛盾するので OFF
      nextExcludeNh = false;
    }
    // ON→OFF: 空セット (全 OFF)
    setCheckedCats(next);
    if (nextExcludeNh !== excludeNh) setExcludeNh(nextExcludeNh);
    syncToUrl(next, nextExcludeNh, catOp);
  };

  const toggleCat = (catSlug: string) => {
    const next = new Set(checkedCats);
    let nextExcludeNh = excludeNh;
    const turningOn = !next.has(catSlug);

    if (turningOn) {
      // ニューハーフ or レズ ON → excludeNh を自動 OFF (mutex)
      if (catSlug === newhalfSlug || catSlug === lesSlug) {
        nextExcludeNh = false;
      }
      next.add(catSlug);
    } else {
      next.delete(catSlug);
    }

    setCheckedCats(next);
    if (nextExcludeNh !== excludeNh) setExcludeNh(nextExcludeNh);
    syncToUrl(next, nextExcludeNh, catOp);
  };

  const toggleExcludeNh = () => {
    const nextExclude = !excludeNh;
    let next = checkedCats;
    if (nextExclude) {
      // excludeNh ON → ニューハーフ・レズ を自動 OFF (mutex)
      const willRemove: string[] = [];
      if (newhalfSlug && checkedCats.has(newhalfSlug)) willRemove.push(newhalfSlug);
      if (lesSlug && checkedCats.has(lesSlug)) willRemove.push(lesSlug);
      if (willRemove.length > 0) {
        next = new Set(checkedCats);
        willRemove.forEach((s) => next.delete(s));
        setCheckedCats(next);
      }
    }
    setExcludeNh(nextExclude);
    syncToUrl(next, nextExclude, catOp);
  };

  const selectCatOp = (next: "or" | "and") => {
    if (next === catOp) return;
    setCatOp(next);
    syncToUrl(checkedCats, excludeNh, next);
  };

  return (
    <div className="mb-6 space-y-4">
      {/* カテゴリチェックボックス */}
      {categories.length > 0 && (
        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-xs font-semibold text-zinc-500">
              カテゴリで絞り込み（複数選択可）
            </p>
            <div
              role="group"
              aria-label="複数カテゴリの結合方法"
              className="inline-flex overflow-hidden rounded-md border border-zinc-300 text-xs"
            >
              <button
                type="button"
                onClick={() => selectCatOp("or")}
                aria-pressed={catOp === "or"}
                className={`px-2 py-0.5 transition-colors ${
                  catOp === "or"
                    ? "bg-red-600 font-medium text-white"
                    : "bg-white text-zinc-600 hover:bg-zinc-50"
                }`}
              >
                OR検索
              </button>
              <button
                type="button"
                onClick={() => selectCatOp("and")}
                aria-pressed={catOp === "and"}
                className={`border-l border-zinc-300 px-2 py-0.5 transition-colors ${
                  catOp === "and"
                    ? "bg-red-600 font-medium text-white"
                    : "bg-white text-zinc-600 hover:bg-zinc-50"
                }`}
              >
                AND検索
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            {/* すべて */}
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={allChecked}
                onChange={toggleAll}
                className="h-4 w-4 rounded border-zinc-300 text-red-600 focus:ring-red-500"
              />
              <span className="text-sm font-medium text-zinc-800">
                すべて
                {typeof allToggleCount === "number" && (
                  <span className="ml-1 text-xs font-normal text-zinc-500">
                    ({allToggleCount})
                  </span>
                )}
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
                <span className="text-sm text-zinc-800">
                  {c.name}
                  {categoryCounts && typeof categoryCounts[c.slug] === "number" && (
                    <span className="ml-1 text-xs text-zinc-500">
                      ({categoryCounts[c.slug]})
                    </span>
                  )}
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
                <span className="text-sm text-zinc-800">
                  {newhalfCategory.name}
                  {categoryCounts &&
                    typeof categoryCounts[newhalfCategory.slug] === "number" && (
                      <span className="ml-1 text-xs text-zinc-500">
                        ({categoryCounts[newhalfCategory.slug]})
                      </span>
                    )}
                </span>
              </label>
            )}

            {/* ニューハーフマッサージ以外（NH除外フィルタ） */}
            {newhalfCategory && (
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={excludeNh}
                  onChange={toggleExcludeNh}
                  className="h-4 w-4 rounded border-zinc-300 text-red-600 focus:ring-red-500"
                />
                <span className="text-sm font-medium text-zinc-800">
                  レズ・ニューハーフ以外
                  {typeof excludeNhToggleCount === "number" && (
                    <span className="ml-1 text-xs font-normal text-zinc-500">
                      ({excludeNhToggleCount})
                    </span>
                  )}
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
