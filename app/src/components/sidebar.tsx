"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GENRES } from "@/lib/constants/genres";

interface SidebarProps {
  onCloseSidebar?: () => void;
}

export function Sidebar({ onCloseSidebar }: SidebarProps) {
  const pathname = usePathname();

  // パスが変わったら（画面遷移完了後）サイドバーを閉じる
  useEffect(() => {
    if (onCloseSidebar) onCloseSidebar();
  }, [pathname]);

  return (
    <aside
      className="w-44 shrink-0 overflow-y-auto text-white"
      style={{ backgroundColor: "#B21000" }}
    >
      <nav className="py-3">
        <Link
          href="/"
          className="block w-full border-b border-white/20 px-3 py-2.5 text-left text-sm font-semibold hover:bg-white/10"
        >
          トップ
        </Link>
        {GENRES.map((g) => (
          <Link
            key={g.slug}
            href={`/genres/${g.slug}`}
            className="block w-full border-b border-white/20 px-3 py-2.5 text-left text-sm font-medium hover:bg-white/10"
          >
            {g.name}
          </Link>
        ))}
        <Link
          href="/my-listings"
          className="mt-2 block w-full border-y border-white/20 bg-white/10 px-3 py-2.5 text-left text-sm font-semibold hover:bg-white/20"
        >
          マイリスティング
        </Link>
      </nav>
    </aside>
  );
}
