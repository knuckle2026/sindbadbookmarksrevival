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

  const [checkedAreas, setCheckedAreas] = useState<Set<string>>(() => {
    const param = searchParams.get("service_area") ?? "";
    return new Set(param.split(",").filter(Boolean));
  });

  // URLからstateを同期（ブラウザバック対応）
  useEffect(() => {
    const areaParam = searchParams.get("service_area") ?? "";
    const areas = new Set(areaParam.split(",").filter(Boolean));
    setCheckedAreas(areas);
    if (areas.size > 0) setIsOpen(true);
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

      {/* 展開時：エリアチェックボックス + クリック可能テキスト */}
      {isOpen && (
        <div className="mt-3 space-y-3">
          <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            出張可能サービスのエリア絞り込み（複数選択可）
          </p>
          {SERVICE_AREA_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="mb-1 text-xs font-medium text-zinc-400 dark:text-zinc-500">
                {group.label}
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {group.areas.map((a) => {
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
          ))}
          {isPending && (
            <p className="text-xs text-zinc-400">読み込み中...</p>
          )}
        </div>
      )}
    </div>
  );
}
