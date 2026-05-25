import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// 年齢ゲートをバイパスするパス。/api/* は個別に列挙する (一律バイパスはセキュリティ上 NG)。
// /api/auth: ログイン/サインアップ系コールバック
// /api/age-gate: 年齢確認 Cookie 設定エンドポイント
// /google, /robots.txt: 検索エンジンの bot が直接取得するため age-gate 不可
const AGE_GATE_BYPASS = [
  "/age-gate",
  "/auth",
  "/_next",
  "/favicon",
  "/icon",
  "/apple-icon",
  "/sbbm-control",
  "/api/auth",
  "/api/age-gate",
  "/google", // Google Search Console site verification (例: /googleb9e2163406392cc0.html)
  "/robots.txt",
  "/sitemap.xml",
];

// 停止ユーザ (admin 想定) でもアクセス可 (ログアウト・サポートのため)
const SUSPENDED_BYPASS = [
  "/age-gate",
  "/auth",
  "/sbbm-control/login",
  "/_next",
  "/favicon",
  "/icon",
  "/apple-icon",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const { response, isSuspended, isAuthenticated } = await updateSession(request);

  // === Age gate check (認証済みユーザはスキップ) ===
  // Supabase Auth でサインアップしたユーザは利用規約に同意したアダルト
  // ポータルの利用者である前提なので、age-gate の冗長確認は不要。
  // 匿名アクセスには引き続き age-gate を要求 (H3 セキュリティ修正の意図を維持)。
  const isBypassed = AGE_GATE_BYPASS.some((p) => pathname.startsWith(p));

  if (!isBypassed && !isAuthenticated) {
    const ageVerified = request.cookies.get("age_verified");
    // 値検証: 偽造防止のため固定値 "1" 以外は無効。サーバ側 Set-Cookie のみで発行。
    if (!ageVerified || ageVerified.value !== "1") {
      if (pathname.startsWith("/api")) {
        // API リクエストは redirect ではなく 403 JSON で拒否
        // (POST/DELETE が 405 にならないように)
        return NextResponse.json(
          { error: "age_gate_required" },
          { status: 403 },
        );
      }
      const url = request.nextUrl.clone();
      url.pathname = "/age-gate";
      url.search = "";
      url.searchParams.set(
        "next",
        request.nextUrl.pathname + request.nextUrl.search,
      );
      return NextResponse.redirect(url);
    }
  }

  if (isSuspended && !SUSPENDED_BYPASS.some((p) => pathname.startsWith(p))) {
    const url = request.nextUrl.clone();
    url.pathname = "/sbbm-control/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
