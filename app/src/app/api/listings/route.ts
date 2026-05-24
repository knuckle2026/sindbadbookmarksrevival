import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/guards";
import {
  createListing,
  type ListingWrite,
} from "@/lib/db/queries/listings";
import { countListingsByUserSince } from "@/lib/db/queries/profiles";
import { verifyTurnstile, isTurnstileEnabled } from "@/lib/turnstile";

// ロボットによる大量登録防止のためのユーザごとクォータ。
// admin はバイパス。
const SUBMIT_LIMIT_24H = 10;
const SUBMIT_LIMIT_30D = 50;

/** D1 の created_at と直接比較できる "YYYY-MM-DD HH:MM:SS" を返す。 */
function d1Timestamp(date: Date): string {
  return date.toISOString().replace("T", " ").slice(0, 19);
}

function parseBody(b: unknown): {
  payload: ListingWrite;
  categoryIds: string[];
} | null {
  if (!b || typeof b !== "object") return null;
  const o = b as Record<string, unknown>;
  if (
    typeof o.genre_id !== "string" ||
    typeof o.title !== "string" ||
    typeof o.description !== "string" ||
    typeof o.website_url !== "string"
  ) {
    return null;
  }
  const title = o.title.trim();
  const description = o.description.trim();
  const websiteUrl = o.website_url.trim();
  if (!title || title.length > 20) return null;
  if (!description || description.length > 100) return null;
  if (!/^https?:\/\/.+/.test(websiteUrl)) return null;

  const payload: ListingWrite = {
    genre_id: o.genre_id,
    title,
    description,
    website_url: websiteUrl,
    prefecture: typeof o.prefecture === "string" && o.prefecture ? o.prefecture : null,
    ward: typeof o.ward === "string" && o.ward ? o.ward : null,
    service_areas: Array.isArray(o.service_areas) && o.service_areas.length > 0
      ? (o.service_areas as string[])
      : null,
    provider_ages: Array.isArray(o.provider_ages) && o.provider_ages.length > 0
      ? (o.provider_ages as string[])
      : null,
    address: typeof o.address === "string" && o.address.trim() ? o.address.trim() : null,
  };
  const categoryIds = Array.isArray(o.category_ids)
    ? (o.category_ids as string[]).filter((s) => typeof s === "string")
    : [];
  return { payload, categoryIds };
}

export async function POST(request: Request) {
  // 公開側にログイン UI は無い。匿名で投稿要請を受け、管理者承認後に公開。
  // ログイン状態は admin (管理画面経由) のときだけありえる。
  const current = await getCurrentUser();
  const isAdmin = current?.profile.role === "admin";

  // ログイン済みかつ admin 以外なら email 認証は必須 (旧 user の名残ガード)
  if (current && !isAdmin && !current.authUser.email_confirmed_at) {
    return NextResponse.json(
      { error: "email_not_confirmed" },
      { status: 403 },
    );
  }

  const body = (await request.json().catch(() => null)) as
    | (Record<string, unknown> & { hp_url?: unknown; turnstile_token?: unknown })
    | null;

  // admin 以外には bot 防御を適用
  if (!isAdmin) {
    // honeypot: 値が入っていれば silently 受領 (bot を欺くため 200 を返すが DB 投入しない)
    const hp = body?.hp_url;
    if (typeof hp === "string" && hp.length > 0) {
      return NextResponse.json({ id: "discarded", status: "pending" });
    }

    // Cloudflare Turnstile: secret key 設定済みのときだけ検証する
    if (isTurnstileEnabled()) {
      const token = body?.turnstile_token;
      if (typeof token !== "string" || !token) {
        return NextResponse.json(
          { error: "turnstile_required" },
          { status: 400 },
        );
      }
      const ip = request.headers.get("CF-Connecting-IP");
      const ok = await verifyTurnstile(token, ip);
      if (!ok) {
        return NextResponse.json(
          { error: "turnstile_failed" },
          { status: 403 },
        );
      }
    }
  }

  const parsed = parseBody(body);
  if (!parsed) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  // logged-in non-admin のみウィンドウクォータでロボット連投を防止
  if (current && !isAdmin) {
    const now = Date.now();
    const since24h = d1Timestamp(new Date(now - 24 * 60 * 60 * 1000));
    const since30d = d1Timestamp(new Date(now - 30 * 24 * 60 * 60 * 1000));
    const [count24h, count30d] = await Promise.all([
      countListingsByUserSince(current.authUser.id, since24h),
      countListingsByUserSince(current.authUser.id, since30d),
    ]);
    if (count24h >= SUBMIT_LIMIT_24H) {
      return NextResponse.json(
        {
          error: "submit_limit_exceeded",
          limit: "daily",
          count: count24h,
          max: SUBMIT_LIMIT_24H,
        },
        { status: 429 },
      );
    }
    if (count30d >= SUBMIT_LIMIT_30D) {
      return NextResponse.json(
        {
          error: "submit_limit_exceeded",
          limit: "monthly",
          count: count30d,
          max: SUBMIT_LIMIT_30D,
        },
        { status: 429 },
      );
    }
  }

  // 匿名 → status='pending' / admin → 即時 'published'
  const userId = current?.authUser.id ?? null;
  const status = isAdmin ? "published" : "pending";

  const id = await createListing(parsed.payload, userId, parsed.categoryIds, status);
  return NextResponse.json({ id, status });
}
