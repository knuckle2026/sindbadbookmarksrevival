"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { createClient } from "@/lib/supabase/client";

// Paths where the header + sidebar chrome should NOT appear
const BARE_PATHS = ["/age-gate"];

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const isBare = BARE_PATHS.some((p) => pathname.startsWith(p));

  // Sidebar initially closed (Section 24.7 #1)
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (isBare) return;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setIsLoggedIn(!!data.user));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, session) => {
      setIsLoggedIn(!!session?.user);
    });
    return () => subscription.unsubscribe();
  }, [isBare]);

  if (isBare) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen flex-col">
      <Header
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
        isLoggedIn={isLoggedIn}
      />
      <div className="flex flex-1 overflow-hidden">
        {sidebarOpen && <Sidebar isLoggedIn={isLoggedIn} />}
        <main className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-950">
          {children}
        </main>
      </div>
    </div>
  );
}
