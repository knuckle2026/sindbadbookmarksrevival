"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

function getPageTitle(pathname: string): string {
  if (pathname === "/") return "ダッシュボード";
  if (pathname === "/listings") return "登録情報一覧";
  if (pathname === "/listings/new") return "情報を登録";
  if (pathname.startsWith("/listings/")) return "詳細";
  if (pathname === "/login") return "ログイン";
  if (pathname === "/signup") return "サインアップ";
  if (pathname === "/reset-password") return "パスワードリセット";
  if (pathname === "/profile") return "プロフィール";
  if (pathname.startsWith("/admin")) return "管理者パネル";
  return "sindbadbookmarks";
}

export function Header() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const title = getPageTitle(pathname ?? "/");

  return (
    <header
      className="flex h-24 items-center justify-between px-6 text-white shadow-md"
      style={{ backgroundColor: "#B21000" }}
    >
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-baseline gap-1">
          <span className="text-2xl font-bold tracking-tight">sindbad</span>
          <span className="text-lg font-light tracking-tight opacity-90">
            bookmarks
          </span>
        </Link>
        <span className="hidden h-10 w-px bg-white/30 sm:inline-block" />
        <h1 className="hidden text-2xl font-semibold sm:block">{title}</h1>
      </div>

      <nav className="flex items-center gap-4 text-sm">
        {user ? (
          <>
            <Link
              href="/listings/new"
              className="rounded-full bg-white/15 px-4 py-2 font-medium text-white ring-1 ring-white/40 transition-colors hover:bg-white/25"
            >
              情報を登録
            </Link>
            <button
              onClick={handleSignOut}
              className="text-white/90 hover:text-white"
            >
              ログアウト
            </button>
          </>
        ) : (
          <Link
            href="/login"
            className="rounded-full bg-white/15 px-4 py-2 font-medium text-white ring-1 ring-white/40 transition-colors hover:bg-white/25"
          >
            ログイン
          </Link>
        )}
      </nav>
    </header>
  );
}
