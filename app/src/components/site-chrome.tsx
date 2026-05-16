"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { Footer } from "@/components/footer";
import { AdBannerSlider } from "@/components/AdBannerSlider";
import { GENRE_MAP } from "@/lib/constants/genres";

// Paths where the header + sidebar chrome should NOT appear
const BARE_PATHS = ["/age-gate"];

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const isBare = BARE_PATHS.some((p) => pathname.startsWith(p));
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // /genres/[slug] の場合にジャンル名・スラッグを取得
  const genreMatch = pathname.match(/^\/genres\/([^/?]+)/);
  const genreSlug = genreMatch ? genreMatch[1] : undefined;
  const genreName = genreSlug ? GENRE_MAP[genreSlug]?.name : undefined;

  // 登録・編集画面のヘッダー表示
  const isNewListing = pathname === "/listings/new";
  const isEditListing = /^\/listings\/[^/]+\/edit$/.test(pathname);
  const isMyListings = pathname === "/my-listings";
  const isOperator = pathname === "/operator";
  const headerTitle = isNewListing
    ? "情報を登録"
    : isEditListing
      ? "登録情報の編集"
      : isMyListings
        ? "登録した情報"
        : isOperator
          ? "運営事務局"
          : genreName;
  const hideRegisterButton = isNewListing || isEditListing;
  const showLogo = pathname === "/";

  const bannerPlacement: string | null =
    pathname === "/"
      ? "top"
      : genreSlug
        ? `genres:${genreSlug}`
        : null;

  if (isBare) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen flex-col">
      <Header
        onHamburgerClick={() => setSidebarOpen((v) => !v)}
        onCloseSidebar={() => setSidebarOpen(false)}
        genreName={headerTitle}
        genreSlug={genreSlug}
        hideRegisterButton={hideRegisterButton}
        showLogo={showLogo}
      />
      {bannerPlacement && (
        <div className="shrink-0">
          <AdBannerSlider placement={bannerPlacement} />
        </div>
      )}
      <div className="flex flex-1 overflow-hidden">
        {sidebarOpen && <Sidebar onCloseSidebar={() => setSidebarOpen(false)} />}
        <main className="flex-1 overflow-y-auto bg-zinc-50">
          {children}
          <Footer />
        </main>
      </div>
    </div>
  );
}
