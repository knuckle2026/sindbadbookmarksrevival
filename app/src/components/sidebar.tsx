"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { GENRES } from "@/lib/constants/genres";

interface SidebarProps {
  onCloseSidebar?: () => void;
}

export function Sidebar({ onCloseSidebar }: SidebarProps) {
  const router = useRouter();

  const handleNavigate = (href: string) => {
    if (onCloseSidebar) onCloseSidebar();
    router.push(href);
  };

  return (
    <aside
      className="w-44 shrink-0 overflow-y-auto text-white"
      style={{ backgroundColor: "#B21000" }}
    >
      <nav className="py-3">
        <button
          onClick={() => handleNavigate("/")}
          className="block w-full border-b border-white/20 px-3 py-2.5 text-left text-sm font-semibold hover:bg-white/10"
        >
          トップ
        </button>
        {GENRES.map((g) => (
          <button
            key={g.slug}
            onClick={() => handleNavigate(`/genres/${g.slug}`)}
            className="block w-full border-b border-white/20 px-3 py-2.5 text-left text-sm font-medium hover:bg-white/10"
          >
            {g.name}
          </button>
        ))}
        <button
          onClick={() => handleNavigate("/my-listings")}
          className="mt-2 block w-full border-y border-white/20 bg-white/10 px-3 py-2.5 text-left text-sm font-semibold hover:bg-white/20"
        >
          マイリスティング
        </button>
      </nav>
    </aside>
  );
}
