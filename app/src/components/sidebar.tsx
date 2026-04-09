"use client";

import Link from "next/link";
import { GENRES } from "@/lib/constants/genres";

export function Sidebar({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <aside
      className="w-44 shrink-0 overflow-y-auto text-white"
      style={{ backgroundColor: "#B21000" }}
    >
      <nav className="py-3">
        {isLoggedIn && (
          <Link
            href="/my/listings"
            className="block border-b border-white/30 px-3 py-2.5 text-sm font-semibold text-white hover:bg-white/15"
          >
            マイリスティング
          </Link>
        )}

        {GENRES.map((genre) => (
          <Link
            key={genre.slug}
            href={`/genres/${genre.slug}`}
            className="block border-b border-white/20 px-3 py-2.5 text-sm font-semibold text-white hover:bg-white/15"
          >
            {genre.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
