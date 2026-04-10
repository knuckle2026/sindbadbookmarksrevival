import Link from "next/link";
import { GENRES } from "@/lib/constants/genres";

export function Sidebar() {
  return (
    <aside
      className="w-44 shrink-0 overflow-y-auto text-white"
      style={{ backgroundColor: "#B21000" }}
    >
      <nav className="py-3">
        {GENRES.map((g) => (
          <Link
            key={g.slug}
            href={`/genres/${g.slug}`}
            className="block border-b border-white/20 px-3 py-2.5 text-sm font-medium hover:bg-white/10"
          >
            {g.name}
          </Link>
        ))}
        <Link
          href="/my-listings"
          className="mt-2 block border-y border-white/20 bg-white/10 px-3 py-2.5 text-sm font-semibold hover:bg-white/20"
        >
          マイリスティング
        </Link>
      </nav>
    </aside>
  );
}
