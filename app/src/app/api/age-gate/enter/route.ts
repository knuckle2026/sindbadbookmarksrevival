import { NextResponse } from "next/server";

// 年齢確認 Cookie を HttpOnly でセットする。
// クライアントの document.cookie からは書けないため DevTools 操作以外で偽造不可。
export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("age_verified", "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 1 日
  });
  return res;
}
