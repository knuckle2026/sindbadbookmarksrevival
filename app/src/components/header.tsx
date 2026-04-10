"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface HeaderProps {
  onHamburgerClick?: () => void;
}

export function Header({ onHamburgerClick }: HeaderProps) {
  const router = useRouter();

  const handleRegister = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      router.push("/listings/new");
    } else {
      router.push("/login?next=/listings/new");
    }
  };

  return (
    <header
      className="flex h-24 shrink-0 items-center justify-between px-4 text-white shadow-md"
      style={{ backgroundColor: "#B21000" }}
    >
      {/* 左: ハンバーガー + ロゴ + テキスト */}
      <div className="flex items-center gap-3">
        {/* ハンバーガーボタン */}
        <button
          onClick={onHamburgerClick}
          aria-label="サイドバーを開閉"
          className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-lg hover:bg-white/10"
        >
          <span className="block h-0.5 w-6 bg-white" />
          <span className="block h-0.5 w-6 bg-white" />
          <span className="block h-0.5 w-6 bg-white" />
        </button>

        {/* ロゴ画像 */}
        <Link href="/" className="shrink-0">
          <Image
            src="/images/sbbm_logo.jpg"
            alt="sindbadbookmarks revival logo"
            width={64}
            height={64}
            className="rounded object-contain"
            priority
          />
        </Link>

        {/* サイトタイトル */}
        <Link href="/" className="hidden sm:block">
          <span className="text-lg font-bold leading-tight tracking-tight">
            sindbadbookmarks
            <br />
            <span className="text-sm font-light opacity-90">revival</span>
          </span>
        </Link>
      </div>

      {/* 右: 情報を登録ボタン（常時表示） */}
      <button
        onClick={handleRegister}
        className="rounded-full bg-white/15 px-5 py-2.5 text-sm font-medium text-white ring-1 ring-white/40 transition-colors hover:bg-white/25"
      >
        情報を登録
      </button>
    </header>
  );
}
