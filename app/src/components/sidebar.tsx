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
      className="flex w-44 shrink-0 flex-col overflow-y-auto text-white"
      style={{ backgroundColor: "#005766" }}
    >
      <nav className="flex flex-1 flex-col pt-3 pb-6">
        <div>
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
        </div>
        <button
          onClick={() => handleNav("/operator")}
          className={`mt-24 block w-full border-t border-white/20 px-3 py-2 text-left text-xs cursor-pointer ${
            pendingHref === "/operator"
              ? "bg-white/25"
              : "text-white/80 hover:bg-white/10 active:bg-white/10"
          }`}
        >
          運営事務局
        </button>
      </nav>
    </aside>
  );
}
