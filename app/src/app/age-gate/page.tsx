"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { safeRedirectPath } from "@/lib/utils/safe-redirect";

function AgeGate() {
  const searchParams = useSearchParams();
  const rawNext = searchParams.get("next");
  const nextPath = safeRedirectPath(rawNext, "/");
  const target = nextPath.startsWith("/age-gate") ? "/" : nextPath;

  function handleEnter() {
    document.cookie = "age_verified=1; path=/; max-age=86400; SameSite=Lax";
    window.location.href = target;
  }

  function handleExit() {
    window.location.href = "https://www.yahoo.co.jp";
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950 text-white px-6 overflow-y-auto">
      <Image
        src="/images/gankersmain.jpg"
        alt="g-ankers"
        width={300}
        height={300}
        className="mb-6 w-full max-w-xs rounded-lg object-contain"
        priority
      />

      <div className="w-full max-w-sm rounded-2xl border border-zinc-700 bg-zinc-900 p-8 text-center shadow-xl">
        <p className="text-lg font-semibold text-zinc-100">年齢確認</p>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
          このサイトはアダルトコンテンツを含みます。
          <br />
          あなたは <span className="font-bold text-white">18歳以上</span> ですか？
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={handleEnter}
            className="w-full rounded-full bg-violet-600 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-zinc-900 sm:w-auto"
          >
            Enter（18歳以上）
          </button>
          <button
            onClick={handleExit}
            className="w-full rounded-full border border-zinc-600 bg-zinc-800 px-8 py-3 text-sm font-semibold text-zinc-300 transition-colors hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-900 sm:w-auto"
          >
            EXIT（18歳未満）
          </button>
        </div>
      </div>

      <p className="mt-6 text-xs text-zinc-600">
        &copy; {new Date().getFullYear()} G-Ankers
      </p>
    </div>
  );
}

export default function AgeGatePage() {
  return (
    <Suspense fallback={null}>
      <AgeGate />
    </Suspense>
  );
}
