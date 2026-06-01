"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect, useTransition } from "react";
import { OSAKA_AREA_FILTER_OPTIONS } from "@/lib/constants/osaka-areas";

interface Props {
  wardCountMap: Record<string, number>;
}

export default function OsakaAreaFilter({ wardCountMap }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [checked, setChecked] = useState<Set<string>>(() => {
    const param = searchParams.get("ward") ?? "";
    return new Set(param.split(",").filter(Boolean));
  });

  const [isOpen, setIsOpen] = useState<boolean>(() => {
    const param = searchParams.get("ward") ?? "";
    return param.split(",").filter(Boolean).length > 0;
  });

  useEffect(() => {
    const param = searchParams.get("ward") ?? "";
    const next = new Set(param.split(",").filter(Boolean));
    setChecked(next);
    if (next.size > 0) setIsOpen(true);
  }, [searchParams]);

  const syncToUrl = (next: Set<string>) => {
    const params = new URLSearchParams(searchParams.toString());
    const str = [...next].join(",");
    if (str) {
      params.set("ward", str);
    } else {
      params.delete("ward");
    }
    params.delete("page");
    const qs = params.toString();
    const url = `${pathname}${qs ? `?${qs}` : ""}`;
    startTransition(() => {
      router.replace(url, { scroll: false });
    });
  };

  const toggleArea = (slug: string) => {
    const next = new Set(checked);
    if (next.has(slug)) {
      next.delete(slug);
    } else {
      next.add(slug);
    }
    setChecked(next);
    syncToUrl(next);
  };

  const summary = checked.size > 0 ? `（${checked.size}件選択中）` : "";

  return (
    <div className="mb-6">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-zinc-700 cursor-pointer"
      >
        <span className={`transition-transform ${isOpen ? "rotate-90" : ""}`}>
          ▶
        </span>
        <span><span className="text-red-700">大阪</span>のエリアで絞り込み（複数選択可）{summary}</span>
      </button>

      {isOpen && (
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
          {OSAKA_AREA_FILTER_OPTIONS.map((a) => {
            const count = wardCountMap[a.slug] ?? 0;
            return (
              <label key={a.slug} className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checked.has(a.slug)}
                  onChange={() => toggleArea(a.slug)}
                  className="h-4 w-4 rounded border-zinc-300 text-red-600 focus:ring-red-500"
                />
                <span className="text-sm text-zinc-800">
                  {a.name}
                  <span className="ml-0.5 text-xs text-zinc-400">({count})</span>
                </span>
              </label>
            );
          })}
        </div>
      )}

      {isPending && <p className="mt-2 text-xs text-zinc-400">読み込み中...</p>}
    </div>
  );
}
