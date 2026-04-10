"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";

// Paths where the header + sidebar chrome should NOT appear
const BARE_PATHS = ["/age-gate"];

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const isBare = BARE_PATHS.some((p) => pathname.startsWith(p));
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (isBare) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen flex-col">
      <Header onHamburgerClick={() => setSidebarOpen((v) => !v)} />
      <div className="flex flex-1 overflow-hidden">
        {sidebarOpen && <Sidebar />}
        <main className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-950">
          {children}
        </main>
      </div>
    </div>
  );
}
