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
  // === 正規ドメイン集約: 旧 workers.dev → g-ankers.com へ 301 ===
  // 独自ドメイン移行後、旧 URL(g-ankers.yourportal.workers.dev)に着地すると、ナビは
  // 相対リンクのため以後ずっと workers.dev に留まってしまう。入口で正規ドメイン
  // (https://g-ankers.com)へ寄せて根絶し、SEO 評価も統合する。
  // 完全一致のみ対象 → g-ankers.com / localhost / versioned preview(<ver>-g-ankers…)
  // は対象外でループの危険なし。https を直接指すので workers.dev の http も 1 ホップ。
  if (request.headers.get("host") === "g-ankers.yourportal.workers.dev") {
    const canonical = request.nextUrl.clone();
    canonical.protocol = "https:";
    canonical.host = "g-ankers.com";
    canonical.port = "";
    return NextResponse.redirect(canonical, 301);
  }

  // === HTTPS 強制 (HTTP アクセス時は https へ 308 リダイレクト) ===
  // 独自ドメイン(g-ankers.com)は Cloudflare の "Always Use HTTPS" 相当をアプリ側で担保する。
  // HTTP のままだと age_verified Cookie の Secure 属性によりブラウザが Cookie を保存できず、
  // 年齢確認が無限ループ/無反応になる(workers.dev は HSTS preload で常時 HTTPS のため発生しない)。
  // クライアントの実スキームは Cloudflare が付与する x-forwarded-proto / cf-visitor で判定し、
  // 明示的に "http" の時のみリダイレクトするためループの危険はない。
  const fwdProto = request.headers.get("x-forwarded-proto");
  let clientScheme: string | null = fwdProto
    ? fwdProto.split(",")[0]!.trim()
    : null;
  if (!clientScheme) {
    const cfVisitor = request.headers.get("cf-visitor");
    if (cfVisitor) {
      try {
        clientScheme =
          (JSON.parse(cfVisitor) as { scheme?: string }).scheme ?? null;
      } catch {
        // malformed header は無視
      }
    }
  }
  if (clientScheme === "http") {
    const httpsUrl = request.nextUrl.clone();
    httpsUrl.protocol = "https:";
    httpsUrl.port = "";
    const httpsRedirect = NextResponse.redirect(httpsUrl, 308);
    httpsRedirect.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains",
    );
    return httpsRedirect;
  }

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

  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains",
  );
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
