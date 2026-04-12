// @ts-nocheck
"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect, useTransition } from "react";
import { SERVICE_AREA_GROUPS } from "@/lib/constants/service-areas";

interface ServiceAreaFilterProps {
  serviceListingCount: number;
  areaCountMap: Record<string, number>;
}

export default function ServiceAreaFilter({
  serviceListingCount,
  areaCountMap,
}: ServiceAreaFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [isOpen, setIsOpen] = useState(() => {
    return !!(searchParams.get("service_area"));
  });

  // 展開中の地域グループ
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  const [checkedAreas, setCheckedAreas] = useState<Set<string>>(() => {
    const param = searchParams.get("service_area") ?? "";
    return new Set(param.split(",").filter(Boolean));
  });

  // URLからstateを同期（ブラウザバック対応）
  useEffect(() => {
    const areaParam = searchParams.get("service_area") ?? "";
    const areas = new Set(areaParam.split(",").filter(Boolean));
    setCheckedAreas(areas);
    if (areas.size > 0) {
      setIsOpen(true);
      // チェック済みエリアが属するグループを開く
      for (const group of SERVICE_AREA_GROUPS) {
        if (group.areas.some((a) => areas.has(a.slug))) {
          setOpenGroup(group.label);
          break;
        }
      }
    }
  }, [searchParams]);

  const syncToUrl = (nextAreas: Set<string>) => {
    const params = new URLSearchParams(searchParams.toString());
    const areaStr = [...nextAreas].join(",");
    if (areaStr) {
      params.set("service_area", areaStr);
    } else {
      params.delete("service_area");
    }
    params.delete("page");
    const qs = params.toString();
    const url = `${pathname}${qs ? `?${qs}` : ""}`;
    startTransition(() => {
      router.replace(url, { scroll: false });
    });
  };

  const toggleArea = (areaSlug: string) => {
    const next = new Set(checkedAreas);
    if (next.has(areaSlug)) {
      next.delete(areaSlug);
    } else {
      next.add(areaSlug);
    }
    setCheckedAreas(next);
    syncToUrl(next);
  };

  // テキスト部分クリック → そのエリアだけで単独絞り込み
  const selectSingle = (areaSlug: string) => {
    const next = new Set([areaSlug]);
    setCheckedAreas(next);
    syncToUrl(next);
  };

  // 地域ごとの登録件数を算出（重複排除せず単純合算）
  const getGroupCount = (groupLabel: string) => {
    const group = SERVICE_AREA_GROUPS.find((g) => g.label === groupLabel);
    if (!group) return 0;
    return group.areas.reduce((sum, a) => sum + (areaCountMap[a.slug] ?? 0), 0);
  };

  return (
    <div className="mb-6">
      {/* 出張サービス ヘッダー（クリックで展開） */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300 cursor-pointer"
      >
        <span className={`transition-transform ${isOpen ? "rotate-90" : ""}`}>
          ▶
        </span>
        <span>出張サービス（{serviceListingCount}件）</span>
      </button>

      {/* 展開時 */}
      {isOpen && (
        <div className="mt-3">
          <p className="mb-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            出張可能サービスのエリア絞り込み
          </p>

          {openGroup === null ? (
            /* Level 1: 地域一覧（件数付きリンク） */
            <div className="flex flex-wrap gap-x-4 gap-y-1.5">
              {SERVICE_AREA_GROUPS.map((group) => {
                const count = getGroupCount(group.label);
                return (
                  <button
                    key={group.label}
                    type="button"
                    onClick={() => setOpenGroup(group.label)}
                    className="text-sm text-zinc-700 hover:text-red-600 hover:underline cursor-pointer dark:text-zinc-300 dark:hover:text-red-400"
                  >
                    {group.label}
                    <span className="ml-0.5 text-xs text-zinc-400">
                      ({count})
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            /* Level 2: 選択した地域のエリアチェックボックス */
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setOpenGroup(null)}
                  className="text-xs text-zinc-500 hover:text-red-600 cursor-pointer"
                >
                  ← 地域一覧
                </button>
                <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                  {openGroup}
                </span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {SERVICE_AREA_GROUPS.find((g) => g.label === openGroup)?.areas.map((a) => {
                  const count = areaCountMap[a.slug] ?? 0;
                  return (
                    <div key={a.slug} className="flex items-center gap-1.5">
                      <input
                        type="checkbox"
                        checked={checkedAreas.has(a.slug)}
                        onChange={() => toggleArea(a.slug)}
                        className="h-4 w-4 rounded border-zinc-300 text-red-600 focus:ring-red-500"
                      />
                      <button
                        type="button"
                        onClick={() => selectSingle(a.slug)}
                        className="text-sm text-zinc-700 hover:text-red-600 hover:underline cursor-pointer dark:text-zinc-200 dark:hover:text-red-400"
                      >
                        {a.name}
                        <span className="ml-0.5 text-xs text-zinc-400">
                          ({count})
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {isPending && (
            <p className="mt-2 text-xs text-zinc-400">読み込み中...</p>
          )}
        </div>
      )}
    </div>
  );
}
