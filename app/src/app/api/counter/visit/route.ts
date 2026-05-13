import { NextResponse } from "next/server";
import { incrementAndGetCount } from "@/lib/db/queries/counter";
import { GENRES } from "@/lib/constants/genres";

const VALID_GENRE_SLUGS = new Set(GENRES.map((g) => g.slug));

function isValidKey(key: string | null): key is string {
  if (!key) return false;
  if (key === "top") return true;
  if (key.startsWith("genres:")) {
    const slug = key.slice("genres:".length);
    return VALID_GENRE_SLUGS.has(slug);
  }
  return false;
}

export async function POST(req: Request) {
  const url = new URL(req.url);
  const key = url.searchParams.get("key");
  if (!isValidKey(key)) {
    return NextResponse.json({ count: null }, { status: 400 });
  }
  try {
    const count = await incrementAndGetCount(key);
    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ count: null }, { status: 500 });
  }
}
