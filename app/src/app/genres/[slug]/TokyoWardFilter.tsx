"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect, useTransition } from "react";
import {
  TOKYO_WARD_FILTER_OPTIONS,
} from "@/lib/constants/tokyo-wards";

interface Props {
  wardCountMap: Record<string, number>;
}

export default function TokyoWardFilter({ wardCountMap }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [checked, setChecked] = useState<Set<string>>(() => {
    const param = searchParams.get("ward") ?? "";
    return new Set(param.split(",").filter(Boolean));
  });

  useEffect(() => {
    const param = searchParams.get("ward") ?? "";
    setChecked(new Set(param.split(",").filter(Boolean)));
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

  const toggleWard = (slug: string) => {
    const next = new Set(checked);
    if (next.has(slug)) {
      next.delete(slug);
    } else {
      next.add(slug);
    }
    setChecked(next);
    syncToUrl(next);
  };

  return (
    <div className="mb-6">
      <p className="mb-2 text-xs font-semibold text-zinc-500">
        東京の区で絞り込み（複数選択可）
      </p>
      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        {TOKYO_WARD_FILTER_OPTIONS.map((w) => {
          const count = wardCountMap[w.slug] ?? 0;
          return (
            <label key={w.slug} className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={checked.has(w.slug)}
                onChange={() => toggleWard(w.slug)}
                className="h-4 w-4 rounded border-zinc-300 text-red-600 focus:ring-red-500"
              />
              <span className="text-sm text-zinc-800">
                {w.name}
                <span className="ml-0.5 text-xs text-zinc-400">({count})</span>
              </span>
            </label>
          );
        })}
      </div>
      {isPending && (
        <p className="mt-2 text-xs text-zinc-400">読み込み中...</p>
      )}
    </div>
  );
}
