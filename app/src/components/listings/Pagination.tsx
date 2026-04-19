import { PressableLink } from "@/components/PressableLink";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  /** Base path, e.g. "/my-listings" or "/genres/bar" */
  basePath: string;
  /** Extra query params to preserve, e.g. { category: "izakaya" } */
  extraParams?: Record<string, string>;
}

/**
 * 共通ページネーションコンポーネント
 * 省略表示あり: 1 ... 5 6 7 ... 20
 * §19.2 / §25.3 共通
 */
export default function Pagination({
  currentPage,
  totalPages,
  basePath,
  extraParams = {},
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const buildHref = (page: number) => {
    const params = new URLSearchParams(extraParams);
    if (page > 1) params.set("page", String(page));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  // Build page numbers with ellipsis
  const pages = buildPageNumbers(currentPage, totalPages);

  return (
    <nav
      className="mt-8 flex items-center justify-center gap-1"
      aria-label="ページネーション"
    >
      {/* 前へ */}
      {currentPage > 1 ? (
        <PressableLink
          href={buildHref(currentPage - 1)}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 active:bg-zinc-100"
          pendingClassName="rounded-lg border border-red-600 bg-red-600 px-3 py-2 text-sm text-white"
          aria-label="前のページ"
        >
          &lt;
        </PressableLink>
      ) : (
        <span className="rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-300">
          &lt;
        </span>
      )}

      {/* ページ番号 */}
      {pages.map((p, i) =>
        p === "..." ? (
          <span
            key={`ellipsis-${i}`}
            className="px-2 py-2 text-sm text-zinc-400"
          >
            ...
          </span>
        ) : (
          <PressableLink
            key={p}
            href={buildHref(p as number)}
            className={`rounded-lg px-3 py-2 text-sm font-medium ${
              p === currentPage
                ? "bg-red-600 text-white"
                : "border border-zinc-300 text-zinc-700 hover:bg-zinc-50 active:bg-zinc-100"
            }`}
            pendingClassName="rounded-lg border border-red-600 bg-red-600 px-3 py-2 text-sm font-medium text-white"
            aria-current={p === currentPage ? "page" : undefined}
          >
            {p}
          </PressableLink>
        ),
      )}

      {/* 次へ */}
      {currentPage < totalPages ? (
        <PressableLink
          href={buildHref(currentPage + 1)}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 active:bg-zinc-100"
          pendingClassName="rounded-lg border border-red-600 bg-red-600 px-3 py-2 text-sm text-white"
          aria-label="次のページ"
        >
          &gt;
        </PressableLink>
      ) : (
        <span className="rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-300">
          &gt;
        </span>
      )}
    </nav>
  );
}

/**
 * ページ番号配列を生成（省略表示あり）
 * 例: totalPages=20, current=7 → [1, "...", 6, 7, 8, "...", 20]
 */
function buildPageNumbers(
  current: number,
  total: number,
): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "...")[] = [];

  // Always show first page
  pages.push(1);

  // Left ellipsis
  if (current > 3) {
    pages.push("...");
  }

  // Window around current
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  // Right ellipsis
  if (current < total - 2) {
    pages.push("...");
  }

  // Always show last page
  if (total > 1) {
    pages.push(total);
  }

  return pages;
}
