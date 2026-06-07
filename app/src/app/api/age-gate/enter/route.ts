import { type NextRequest, NextResponse } from "next/server";
import { safeRedirectPath } from "@/lib/utils/safe-redirect";

// 年齢確認 Cookie を HttpOnly でセットする。
// クライアントの document.cookie からは書けないため DevTools 操作以外で偽造不可。
//
// 2 つの呼び出し方法に対応:
// (a) form POST (Content-Type: application/x-www-form-urlencoded):
//     hidden input "next" を含む。Set-Cookie + 303 で next へ redirect。
//     JS なしで動くため LINE 等の in-app browser で確実に通る。
// (b) JSON fetch (既存クライアント互換):
//     Set-Cookie + JSON {ok:true} を返す。呼出側が window.location 遷移する想定。
//
// ★ SameSite は "lax" を堅持する。LINE 等の in-app browser (iOS WKWebView) は
//   SameSite=None の Cookie を三者扱いでブロックすることがあり、年齢確認が
//   ループする。form POST → 303 → GET / は同一サイト遷移なので Lax で送られる。
const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24, // 1 日
};

export async function POST(request: NextRequest) {
  const ct = request.headers.get("content-type") ?? "";
  const isForm =
    ct.includes("application/x-www-form-urlencoded") ||
    ct.includes("multipart/form-data");

  if (isForm) {
    const formData = await request.formData();
    const rawNext = formData.get("next");
    const nextStr = typeof rawNext === "string" ? rawNext : null;
    const nextPath = safeRedirectPath(nextStr, "/");
    const target = nextPath.startsWith("/age-gate") ? "/" : nextPath;
    const redirectUrl = new URL(target, request.url);
    // 303 で GET にダウングレード (form POST → GET 遷移の標準)
    const res = NextResponse.redirect(redirectUrl, 303);
    res.cookies.set("age_verified", "1", COOKIE_OPTS);
    return res;
  }

  // 既存 JSON クライアント互換 (age-gate page が fetch 経由で呼ぶ場合)。
  // 新 age-gate page は form POST に統一したが、他から呼ばれる可能性もあるため残す。
  const res = NextResponse.json({ ok: true });
  res.cookies.set("age_verified", "1", COOKIE_OPTS);
  return res;
}
