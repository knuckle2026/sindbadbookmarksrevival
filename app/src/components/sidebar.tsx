"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { GENRES } from "@/lib/constants/genres";

interface SidebarProps {
  onCloseSidebar?: () => void;
}

export function Sidebar({ onCloseSidebar }: SidebarProps) {
  const router = useRouter();

  const handleTopClick = () => {
    if (onCloseSidebar) onCloseSidebar();
    router.push("/");
  };

  return (
    <aside
      className="w-44 shrink-0 overflow-y-auto text-white"
      style={{ backgroundColor: "#B21000" }}
    >
      <nav className="py-3">
        <button
          onClick={handleTopClick}
          className="block w-full border-b border-white/20 px-3 py-2.5 text-left text-sm font-semibold hover:bg-white/10"
        >
          トップ
        </button>
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
