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
}

export default function SortSelect({
  currentSort,
  basePath,
  extraParams = {},
}: SortSelectProps) {
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as SortKey;
    const params = new URLSearchParams(extraParams);
    if (value !== "created_desc") params.set("sort", value);
    else params.delete("sort");
    // Reset to page 1 on sort change
    params.delete("page");
    const qs = params.toString();
    const href = `${basePath}${qs ? `?${qs}` : ""}`;
    router.push(href);
  };

  return (
    <div className="mb-4">
      <select
        value={currentSort}
        onChange={handleChange}
        className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-700 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.key} value={opt.key}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
