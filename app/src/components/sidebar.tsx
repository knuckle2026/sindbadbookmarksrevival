"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { GENRES } from "@/lib/constants/genres";

interface SidebarProps {
  onCloseSidebar?: () => void;
}

export function Sidebar({ onCloseSidebar }: SidebarProps) {
  const pathname = usePathname();
  const initialPath = useRef(pathname);
  const router = useRouter();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  // パスが変わった時だけ（初回マウントはスキップ）サイドバーを閉じる
  useEffect(() => {
    if (pathname !== initialPath.current) {
      setPendingHref(null);
      if (onCloseSidebar) onCloseSidebar();
    }
  }, [pathname]);

  const handleNav = (href: string) => {
    if (pendingHref) return;
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(10);
    }
    if (href === pathname) {
      if (onCloseSidebar) onCloseSidebar();
      return;
    }
    setPendingHref(href);
    router.push(href);
  };

  const linkBase = "block w-full border-b border-white/20 px-3 py-2.5 text-left text-sm cursor-pointer";

  return (
    <aside
      className="w-44 shrink-0 overflow-y-auto text-white"
      style={{ backgroundColor: "#003A66" }}
    >
      <nav className="py-3">
        <button
          onClick={() => handleNav("/")}
          className={`${linkBase} font-semibold ${pendingHref === "/" ? "bg-white/25" : "hover:bg-white/10 active:bg-white/10"}`}
        >
          トップ
        </button>
        {GENRES.map((g) => {
          const href = `/genres/${g.slug}`;
          return (
            <button
              key={g.slug}
              onClick={() => handleNav(href)}
              className={`${linkBase} font-medium ${pendingHref === href ? "bg-white/25" : "hover:bg-white/10 active:bg-white/10"}`}
            >
              {g.name}
            </button>
          );
        })}
        <button
          onClick={() => handleNav("/my-listings")}
          className={`mt-2 block w-full border-y border-white/20 px-3 py-2.5 text-left text-sm cursor-pointer font-semibold ${pendingHref === "/my-listings" ? "bg-white/30" : "bg-white/10 hover:bg-white/20 active:bg-white/20"}`}
        >
          マイリスティング
        </button>
      </nav>
    </aside>
  );
}
