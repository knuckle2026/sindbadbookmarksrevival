import Link from "next/link";

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

interface SortTabsProps {
  currentSort: SortKey;
  basePath: string;
  /** Extra query params to preserve (category, region, prefecture, service_area) */
  extraParams?: Record<string, string>;
}

export default function SortTabs({
  currentSort,
  basePath,
  extraParams = {},
}: SortTabsProps) {
  return (
    <div className="mb-4 flex flex-wrap gap-1.5">
      {SORT_OPTIONS.map((opt) => {
        const params = new URLSearchParams(extraParams);
        if (opt.key !== "created_desc") params.set("sort", opt.key);
        else params.delete("sort"); // default doesn't need param
        const qs = params.toString();
        const href = `${basePath}${qs ? `?${qs}` : ""}`;
        const isActive = currentSort === opt.key;

        return (
          <Link
            key={opt.key}
            href={href}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              isActive
                ? "border-red-600 bg-red-600 text-white"
                : "border-zinc-300 bg-white text-zinc-600 hover:border-red-400"
            }`}
          >
            {opt.label}
          </Link>
        );
      })}
    </div>
  );
}
