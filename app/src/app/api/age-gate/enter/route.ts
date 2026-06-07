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
    const safeTarget = target.startsWith("/") ? target : "/";

    // ★ LINE 等の in-app browser (WKWebView) は 303 リダイレクト応答の Set-Cookie を
    //   保持しないことがあり、age_verified が立たず /age-gate に戻り続けてループする。
    //   → 303 をやめ、200 の中間HTMLで Cookie を確実に確定させてから meta refresh + JS
    //     で遷移する (Cookie 保存とナビゲーションを分離)。JS 無効でも meta refresh と
    //     手動リンクで通れるため、通常ブラウザでも従来どおり機能する。
    const escHtml = (s: string) =>
      s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    const tAttr = escHtml(safeTarget);
    const html = `<!DOCTYPE html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="refresh" content="0;url=${tAttr}"><title>確認しました</title></head><body style="margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#09090b;color:#ffffff;font-family:sans-serif;text-align:center"><div style="padding:1.5rem"><p style="font-size:1rem;margin:0 0 1rem">確認しました。移動しています…</p><p style="margin:0"><a href="${tAttr}" style="color:#a78bfa">表示されない場合はこちらをタップ</a></p></div><script>location.replace(${JSON.stringify(safeTarget)});</script></body></html>`;
    const res = new NextResponse(html, {
      status: 200,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
    res.cookies.set("age_verified", "1", COOKIE_OPTS);
    return res;
  }

  // 既存 JSON クライアント互換 (age-gate page が fetch 経由で呼ぶ場合)。
  // 新 age-gate page は form POST に統一したが、他から呼ばれる可能性もあるため残す。
  const res = NextResponse.json({ ok: true });
  res.cookies.set("age_verified", "1", COOKIE_OPTS);
  return res;
}
