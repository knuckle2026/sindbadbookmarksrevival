import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/guards";
import {
  createListing,
  type ListingWrite,
} from "@/lib/db/queries/listings";
import { countListingsByUserSince } from "@/lib/db/queries/profiles";

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
  const current = await getCurrentUser();
  if (!current) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // メール認証必須 (admin はバイパス)。Supabase は email_confirmed_at がセット
  // されたユーザのみ confirmed 扱い。OAuth ユーザは Provider 側で確認済み。
  if (
    current.profile.role !== "admin" &&
    !current.authUser.email_confirmed_at
  ) {
    return NextResponse.json(
      { error: "email_not_confirmed" },
      { status: 403 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = parseBody(body);
  if (!parsed) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  // admin 以外はウィンドウクォータでロボット連投を防止
  if (current.profile.role !== "admin") {
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

  const id = await createListing(parsed.payload, current.authUser.id, parsed.categoryIds);
  return NextResponse.json({ id });
}
