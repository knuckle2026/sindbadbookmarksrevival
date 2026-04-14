"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { GENRE_MAP } from "@/lib/constants/genres";

// Paths where the header + sidebar chrome should NOT appear
const BARE_PATHS = ["/age-gate"];

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const isBare = BARE_PATHS.some((p) => pathname.startsWith(p));
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // /genres/[slug] の場合にジャンル名を取得
  const genreMatch = pathname.match(/^\/genres\/([^/?]+)/);
  const genreName = genreMatch ? GENRE_MAP[genreMatch[1]]?.name : undefined;

  if (isBare) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen flex-col">
      <Header
        onHamburgerClick={() => setSidebarOpen((v) => !v)}
        onCloseSidebar={() => setSidebarOpen(false)}
        genreName={genreName}
      />
      <div className="flex flex-1 overflow-hidden">
        {sidebarOpen && <Sidebar onCloseSidebar={() => setSidebarOpen(false)} />}
        <main className="flex-1 overflow-y-auto bg-zinc-50">
          {children}
        </main>
      </div>
    </div>
  );
}
