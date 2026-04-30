"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface HeaderProps {
  onHamburgerClick?: () => void;
  onCloseSidebar?: () => void;
  genreName?: string;
  genreSlug?: string;
  hideRegisterButton?: boolean;
  showLogo?: boolean;
}

export function Header({ onHamburgerClick, onCloseSidebar, genreName, genreSlug, hideRegisterButton, showLogo }: HeaderProps) {
  const router = useRouter();

  const handleRegister = async () => {
    onCloseSidebar?.();
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const newPath = genreSlug
      ? `/listings/new?genre=${genreSlug}`
      : "/listings/new";

    if (user) {
      router.push(newPath);
    } else {
      router.push(`/login?next=${encodeURIComponent(newPath)}`);
    }
  };

  return (
    <header
      className="flex h-24 shrink-0 items-center justify-between px-4 text-white shadow-md"
      style={{ backgroundColor: "#003A66" }}
    >
      {/* 左: ハンバーガー + ロゴ/ジャンル名 */}
      <div className="flex items-center gap-3">
        {/* ハンバーガーボタン */}
        <button
          onClick={onHamburgerClick}
          aria-label="サイドバーを開閉"
          className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-lg hover:bg-white/10 active:bg-white/10"
        >
          <span className="block h-0.5 w-6 bg-white" />
          <span className="block h-0.5 w-6 bg-white" />
          <span className="block h-0.5 w-6 bg-white" />
        </button>

        {genreName ? (
          /* ジャンル一覧ページ等: タイトル表示（クリック不可） */
          <span className="text-lg font-bold tracking-tight">{genreName}</span>
        ) : (
          /* 通常ページ: ロゴ（トップのみ） + sindbadbookmarks revival */
          <>
            {/* ロゴ画像（トップページのみ、ヘッダー高さに合わせる） */}
            {showLogo && (
              <Link href="/" className="shrink-0">
                <Image
                  src="/images/gaks_logo.jpg"
                  alt="g-ankers logo"
                  width={96}
                  height={96}
                  className="object-contain h-20 w-auto max-w-28 sm:max-w-none"
                  priority
                />
              </Link>
            )}

          </>
        )}
      </div>

      {/* 右: 情報を登録ボタン（登録・編集画面では非表示） */}
      {!hideRegisterButton && (
        <button
          onClick={handleRegister}
          className="rounded-full bg-white/15 px-5 py-2.5 text-sm font-medium text-white ring-1 ring-white/40 transition-colors hover:bg-white/25 active:bg-white/25"
        >
          情報を登録
        </button>
      )}
    </header>
  );
}
