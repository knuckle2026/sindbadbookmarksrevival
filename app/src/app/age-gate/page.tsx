import Image from "next/image";
import { safeRedirectPath } from "@/lib/utils/safe-redirect";

// Server Component で完全 SSR (JS 不要) + LINE 等の古い WebView 互換のため
// 主要な色は inline style の hex で指定する。
//
// 経緯:
// (1) 以前は "use client" + useSearchParams + <Suspense fallback={null}>
//     → BAILOUT_TO_CLIENT_SIDE_RENDERING で SSR 出力が空。
//     ブラウザは JS で即描画、LINE in-app browser は JS 失敗で真っ白。
// (2) Server Component 化して SSR で UI 出力するように修正したが、
//     Tailwind v4 が生成する CSS は oklch() 色を多用しており、古い
//     LINE WebView (iOS Safari < 15.4 / Android WebView < 111) は
//     oklch を解釈できず bg-zinc-950 等が無効化される。一方 text-white
//     は古い CSS なので有効 → 白背景 + 白文字 = 真っ白。
// (3) 本ファイルだけは inline style で hex 色を明示し、CSS パースに
//     失敗しても確実に表示できるようにする (Tailwind class は
//     新しいブラウザでの統一感のため併記)。

interface AgeGatePageProps {
  searchParams: Promise<{ next?: string }>;
}

// LINE 等の古い WebView を考慮した hex 色定義 (Tailwind の zinc 系と一致)
const COLORS = {
  bg: "#09090b", // zinc-950
  cardBg: "#18181b", // zinc-900
  cardBorder: "#3f3f46", // zinc-700
  text: "#ffffff",
  subtext: "#a1a1aa", // zinc-400
  copyright: "#52525b", // zinc-600
  primaryBg: "#7c3aed", // violet-600
  primaryText: "#ffffff",
  secondaryBg: "#27272a", // zinc-800
  secondaryBorder: "#52525b", // zinc-600
  secondaryText: "#d4d4d8", // zinc-300
} as const;

export default async function AgeGatePage({
  searchParams,
}: AgeGatePageProps) {
  const { next: rawNext } = await searchParams;
  const nextPath = safeRedirectPath(rawNext ?? null, "/");
  const target = nextPath.startsWith("/age-gate") ? "/" : nextPath;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950 text-white px-6 overflow-y-auto"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: COLORS.bg,
        color: COLORS.text,
        padding: "0 1.5rem",
        overflowY: "auto",
      }}
    >
      <Image
        src="/images/gankersmain.jpg"
        alt="g-ankers"
        width={300}
        height={300}
        className="mb-6 w-full max-w-xs rounded-lg object-contain"
        style={{
          marginBottom: "1.5rem",
          width: "100%",
          maxWidth: "20rem",
          borderRadius: "0.5rem",
          objectFit: "contain",
          height: "auto",
        }}
        priority
      />

      <div
        className="w-full max-w-sm rounded-2xl border border-zinc-700 bg-zinc-900 p-8 text-center shadow-xl"
        style={{
          width: "100%",
          maxWidth: "24rem",
          borderRadius: "1rem",
          border: `1px solid ${COLORS.cardBorder}`,
          backgroundColor: COLORS.cardBg,
          padding: "2rem",
          textAlign: "center",
          boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
        }}
      >
        <p
          className="text-lg font-semibold text-zinc-100"
          style={{
            fontSize: "1.125rem",
            fontWeight: 600,
            color: COLORS.text,
            margin: 0,
          }}
        >
          年齢確認
        </p>
        <p
          className="mt-3 text-sm leading-relaxed text-zinc-400"
          style={{
            marginTop: "0.75rem",
            fontSize: "0.875rem",
            lineHeight: 1.625,
            color: COLORS.subtext,
          }}
        >
          このサイトはアダルトコンテンツを含みます。
          <br />
          あなたは{" "}
          <span
            className="font-bold text-white"
            style={{ fontWeight: 700, color: COLORS.text }}
          >
            18歳以上
          </span>{" "}
          ですか？
        </p>

        <div
          className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center"
          style={{
            marginTop: "2rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          <form
            action="/api/age-gate/enter"
            method="POST"
            className="w-full sm:w-auto"
            style={{ width: "100%", margin: 0 }}
          >
            <input type="hidden" name="next" value={target} />
            <button
              type="submit"
              className="w-full rounded-full bg-violet-600 px-8 py-3 text-sm font-semibold text-white"
              style={{
                width: "100%",
                borderRadius: "9999px",
                backgroundColor: COLORS.primaryBg,
                padding: "0.75rem 2rem",
                fontSize: "0.875rem",
                fontWeight: 600,
                color: COLORS.primaryText,
                border: "none",
                cursor: "pointer",
              }}
            >
              Enter（18歳以上）
            </button>
          </form>
          <a
            href="https://www.yahoo.co.jp"
            rel="noopener noreferrer"
            className="inline-block w-full rounded-full border border-zinc-600 bg-zinc-800 px-8 py-3 text-center text-sm font-semibold text-zinc-300"
            style={{
              display: "inline-block",
              width: "100%",
              borderRadius: "9999px",
              border: `1px solid ${COLORS.secondaryBorder}`,
              backgroundColor: COLORS.secondaryBg,
              padding: "0.75rem 2rem",
              textAlign: "center",
              fontSize: "0.875rem",
              fontWeight: 600,
              color: COLORS.secondaryText,
              textDecoration: "none",
              boxSizing: "border-box",
            }}
          >
            EXIT（18歳未満）
          </a>
        </div>
      </div>

      <p
        className="mt-6 text-xs text-zinc-600"
        style={{
          marginTop: "1.5rem",
          fontSize: "0.75rem",
          color: COLORS.copyright,
        }}
      >
        &copy; {new Date().getFullYear()} G-Ankers
      </p>
    </div>
  );
}
