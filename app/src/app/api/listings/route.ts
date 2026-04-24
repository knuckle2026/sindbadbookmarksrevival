import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import {
  createListing,
  type ListingWrite,
} from "@/lib/db/queries/listings";

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
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = parseBody(body);
  if (!parsed) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const id = await createListing(parsed.payload, user.id, parsed.categoryIds);
  return NextResponse.json({ id });
}
