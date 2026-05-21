import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// 年齢ゲートをバイパスするパス。/api/* は個別に列挙する (一律バイパスはセキュリティ上 NG)。
// /api/auth: ログイン/サインアップ系コールバック
// /api/age-gate: 年齢確認 Cookie 設定エンドポイント
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
];

// 停止ユーザでもアクセス可 (ログアウト・サポートのため)
const SUSPENDED_BYPASS = [
  "/age-gate",
  "/auth",
  "/login",
  "/signup",
  "/reset-password",
  "/_next",
  "/favicon",
  "/icon",
  "/apple-icon",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // === Age gate check ===
  const isBypassed = AGE_GATE_BYPASS.some((p) => pathname.startsWith(p));

  if (!isBypassed) {
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

  const { response, isSuspended } = await updateSession(request);

  if (isSuspended && !SUSPENDED_BYPASS.some((p) => pathname.startsWith(p))) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
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
