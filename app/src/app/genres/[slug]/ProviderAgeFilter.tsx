"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect, useTransition } from "react";
import { PROVIDER_AGES } from "@/lib/constants/provider-ages";

export default function ProviderAgeFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [checkedAges, setCheckedAges] = useState<Set<string>>(() => {
    const param = searchParams.get("provider_age") ?? "";
    return new Set(param.split(",").filter(Boolean));
  });

  useEffect(() => {
    const param = searchParams.get("provider_age") ?? "";
    setCheckedAges(new Set(param.split(",").filter(Boolean)));
  }, [searchParams]);

  const syncToUrl = (nextAges: Set<string>) => {
    const params = new URLSearchParams();
    // provider_age
    const ageStr = [...nextAges].join(",");
    if (ageStr) params.set("provider_age", ageStr);
    // 他のパラメータを保持
    const currentCategory = searchParams.get("category");
    if (currentCategory) params.set("category", currentCategory);
    const currentCatOp = searchParams.get("cat_op");
    if (currentCatOp === "and") params.set("cat_op", "and");
    const currentExcludeNh = searchParams.get("exclude_nh");
    if (currentExcludeNh) params.set("exclude_nh", currentExcludeNh);
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

  const toggleAge = (slug: string) => {
    const next = new Set(checkedAges);
    if (next.has(slug)) {
      next.delete(slug);
    } else {
      next.add(slug);
    }
    setCheckedAges(next);
    syncToUrl(next);
  };

  return (
    <div className="mb-6 space-y-4">
      <div>
        <p className="mb-2 text-xs font-semibold text-zinc-500">
          サービス提供者の年代（複数選択可）
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
          {PROVIDER_AGES.map((age) => (
            <label key={age.slug} className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={checkedAges.has(age.slug)}
                onChange={() => toggleAge(age.slug)}
                className="h-4 w-4 rounded border-zinc-300 text-red-600 focus:ring-red-500"
              />
              <span className="text-sm text-zinc-800">
                {age.label}
              </span>
            </label>
          ))}
        </div>
      </div>
      {isPending && (
        <p className="text-xs text-zinc-400">読み込み中...</p>
      )}
    </div>
  );
}
