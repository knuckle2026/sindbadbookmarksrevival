"use client";

import { useEffect, useRef, useState } from "react";
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
  const mainRef = useRef<HTMLElement | null>(null);

  // ページ遷移時、main の scrollTop を 0 にリセット。
  // Next.js のルーターは <html> のスクロール位置はリセットするが、
  // 内側スクロールコンテナ (main) の scrollTop は保持されてしまい、
  // ジャンル変更で開いたページでバナーが見切れる (上半分が画面外) 不具合を防ぐ。
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
  }, [pathname]);

  // /genres/[slug] の場合にジャンル名・スラッグを取得
  const genreMatch = pathname.match(/^\/genres\/([^/?]+)/);
  const genreSlug = genreMatch ? genreMatch[1] : undefined;
  const genreName = genreSlug ? GENRE_MAP[genreSlug]?.name : undefined;

  // 登録画面のヘッダー表示 (公開側に編集画面/マイページは無い)
  const isNewListing = pathname === "/listings/new";
  const isOperator = pathname === "/operator";
  const headerTitle = isNewListing
    ? "情報を登録"
    : isOperator
      ? "運営事務局"
      : genreName;
  const hideRegisterButton = isNewListing;
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
    <div className="flex h-screen h-svh flex-col">
      <Header
        onHamburgerClick={() => setSidebarOpen((v) => !v)}
        onCloseSidebar={() => setSidebarOpen(false)}
        genreName={headerTitle}
        genreSlug={genreSlug}
        hideRegisterButton={hideRegisterButton}
        showLogo={showLogo}
      />
      <div className="flex flex-1 overflow-hidden">
        {sidebarOpen && <Sidebar onCloseSidebar={() => setSidebarOpen(false)} />}
        <main
          ref={mainRef}
          className="flex-1 overflow-y-auto overscroll-contain bg-zinc-50"
          onClick={sidebarOpen ? () => setSidebarOpen(false) : undefined}
        >
          {/* バナーは main 内のコンテンツ先頭に置く → スクロールでヘッダー下に潜り込む */}
          {bannerPlacement && (
            <div>
              <AdBannerSlider placement={bannerPlacement} />
            </div>
          )}
          {children}
          <Footer />
        </main>
      </div>
    </div>
  );
}
