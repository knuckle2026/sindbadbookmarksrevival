"use client";

import { useRouter } from "next/navigation";

export type SortKey =
  | "created_desc"
  | "created_asc"
  | "updated_desc"
  | "updated_asc"
  | "title_asc"
  | "title_desc"
  | "popular";

export const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "created_desc", label: "登録日新しい順" },
  { key: "created_asc", label: "登録日古い順" },
  { key: "updated_desc", label: "更新日新しい順" },
  { key: "updated_asc", label: "更新日古い順" },
  { key: "title_asc", label: "名称 あ→わ" },
  { key: "title_desc", label: "名称 わ→あ" },
  { key: "popular", label: "アクセス数順" },
];

interface SortSelectProps {
  currentSort: SortKey;
  basePath: string;
  extraParams?: Record<string, string>;
  /** 新着 (3ヶ月以内) フィルタが ON か */
  freshOn?: boolean;
}

export default function SortSelect({
  currentSort,
  basePath,
  extraParams = {},
  freshOn = false,
}: SortSelectProps) {
  const router = useRouter();

  const buildHref = (next: { sort?: SortKey; fresh?: boolean }) => {
    const params = new URLSearchParams(extraParams);
    const sortVal = next.sort ?? currentSort;
    if (sortVal !== "created_desc") params.set("sort", sortVal);
    else params.delete("sort");
    const freshVal = next.fresh ?? freshOn;
    if (freshVal) params.set("fresh", "1");
    else params.delete("fresh");
    // ソートやフィルタ変更時はページを 1 にリセット
    params.delete("page");
    const qs = params.toString();
    return `${basePath}${qs ? `?${qs}` : ""}`;
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    router.push(buildHref({ sort: e.target.value as SortKey }));
  };

  const handleFreshToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    router.push(buildHref({ fresh: e.target.checked }));
  };

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <select
        value={currentSort}
        onChange={handleSortChange}
        className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-700 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.key} value={opt.key}>
            {opt.label}
          </option>
        ))}
      </select>
      <label className="inline-flex items-center gap-1.5 text-sm text-zinc-700 select-none cursor-pointer">
        <input
          type="checkbox"
          checked={freshOn}
          onChange={handleFreshToggle}
          className="h-4 w-4 rounded border-zinc-300 text-red-600 focus:ring-red-500"
        />
        新着(3ヶ月以内)
      </label>
    </div>
  );
}
