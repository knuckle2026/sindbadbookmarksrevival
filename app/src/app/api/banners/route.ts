import { NextResponse } from "next/server";
import { listEnabledBannersByPlacement } from "@/lib/db/queries/banners";
import { GENRES } from "@/lib/constants/genres";

const VALID_GENRE_SLUGS = new Set(GENRES.map((g) => g.slug));

function isValidPlacement(p: string | null): p is string {
  if (!p) return false;
  if (p === "top") return true;
  if (p.startsWith("genres:")) {
    return VALID_GENRE_SLUGS.has(p.slice("genres:".length));
  }
  return false;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const placement = url.searchParams.get("placement");
  if (!isValidPlacement(placement)) {
    return NextResponse.json({ error: "Invalid placement" }, { status: 400 });
  }
  const banners = await listEnabledBannersByPlacement(placement);
  return NextResponse.json(
    {
      banners: banners.map((b) => ({
        id: b.id,
        image_url: b.image_url,
        link_url: b.link_url,
        alt: b.alt ?? "",
      })),
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    },
  );
}
