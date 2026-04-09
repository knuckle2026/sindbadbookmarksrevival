"use client";

import Link from "next/link";
import { GENRES } from "@/lib/constants/genres";

export function Sidebar() {
  return (
    <aside
      className="w-44 shrink-0 overflow-y-auto text-white"
      style={{ backgroundColor: "#B21000" }}
    >
      <nav className="py-3">
        <Link
          href="/"
          className="block border-b border-white/20 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white/90 hover:bg-white/10"
        >
          ダッシュボード
        </Link>
        {GENRES.map((g) => (
          <Link
            key={g.slug}
            href={`/genres/${g.slug}`}
            className="block border-b border-white/20 px-3 py-2.5 text-sm font-medium hover:bg-white/10"
          >
            {g.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
