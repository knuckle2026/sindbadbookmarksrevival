"use client";

import Image from "next/image";
import Link from "next/link";

interface HeaderProps {
  onToggleSidebar: () => void;
  isLoggedIn: boolean;
}

export function Header({ onToggleSidebar, isLoggedIn }: HeaderProps) {
  return (
    <header
      className="flex h-20 items-center gap-4 px-4 text-white shadow-md"
      style={{ backgroundColor: "#B21000" }}
    >
      {/* Hamburger */}
      <button
        type="button"
        onClick={onToggleSidebar}
        aria-label="メニューを開く"
        className="flex h-10 w-10 items-center justify-center rounded hover:bg-white/15"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Logo + Title */}
      <Link href="/" className="flex items-center gap-3">
        <Image
          src="/images/sbbm_logo.jpg"
          alt="sindbadbookmarks revival"
          width={160}
          height={64}
          className="h-14 w-auto rounded"
          priority
        />
        <span className="hidden text-xl font-bold tracking-tight sm:inline">
          sindbadbookmarks revival
        </span>
      </Link>

      <div className="flex-1" />

      {/* Register button */}
      <Link
        href={isLoggedIn ? "/listings/new" : "/listings/new"}
        className="rounded-full bg-white px-5 py-2 text-sm font-bold text-[#B21000] shadow hover:bg-white/90"
      >
        情報を登録
      </Link>
    </header>
  );
}
