import { NextResponse } from "next/server";
import { checkAdminApi } from "@/lib/auth/guards";
import { createBanner } from "@/lib/db/queries/banners";
import { GENRES } from "@/lib/constants/genres";
import { isSupabasePublicUrl } from "@/lib/supabase/storage";

const VALID_GENRE_SLUGS = new Set(GENRES.map((g) => g.slug));

function isValidPlacement(p: string): boolean {
  if (p === "top") return true;
  if (p.startsWith("genres:")) {
    return VALID_GENRE_SLUGS.has(p.slice("genres:".length));
  }
  return false;
}

function isHttpsUrl(s: string): boolean {
  try {
    return new URL(s).protocol === "https:";
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  const auth = await checkAdminApi();
  if (!auth.ok) {
    return NextResponse.json({ error: "Forbidden" }, { status: auth.status });
  }

  const body = (await req.json()) as {
    storage_key?: unknown;
    image_url?: unknown;
    link_url?: unknown;
    placement?: unknown;
    alt?: unknown;
    sort_order?: unknown;
    enabled?: unknown;
  };

  if (
    typeof body.storage_key !== "string" ||
    typeof body.image_url !== "string" ||
    typeof body.link_url !== "string" ||
    typeof body.placement !== "string" ||
    typeof body.sort_order !== "number"
  ) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  if (!isValidPlacement(body.placement)) {
    return NextResponse.json({ error: "Invalid placement" }, { status: 400 });
  }
  if (!isHttpsUrl(body.link_url)) {
    return NextResponse.json(
      { error: "link_url must be https" },
      { status: 400 },
    );
  }
  if (!isSupabasePublicUrl(body.image_url)) {
    return NextResponse.json(
      { error: "image_url must point to Supabase Storage banners bucket" },
      { status: 400 },
    );
  }

  const alt =
    typeof body.alt === "string" && body.alt.trim().length > 0
      ? body.alt.trim()
      : null;
  const enabled: 0 | 1 = body.enabled === false || body.enabled === 0 ? 0 : 1;

  const row = await createBanner({
    storage_key: body.storage_key,
    image_url: body.image_url,
    link_url: body.link_url,
    placement: body.placement,
    alt,
    sort_order: body.sort_order,
    enabled,
  });
  return NextResponse.json(row);
}
