// @ts-nocheck
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const results: Record<string, any> = {};

  try {
    const supabase = await createClient();

    // 1. Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    results.auth = {
      userId: user?.id ?? null,
      role: user?.app_metadata?.role ?? null,
      authError: authError?.message ?? null,
    };

    // 2. Query genres (should work for anyone - RLS: true)
    const { data: genres, error: genresError } = await supabase
      .from("genres")
      .select("id, slug, name")
      .limit(3);
    results.genres = {
      count: genres?.length ?? 0,
      data: genres,
      error: genresError?.message ?? null,
    };

    // 3. Query categories
    const { data: categories, error: catsError } = await supabase
      .from("categories")
      .select("id, slug, name")
      .limit(3);
    results.categories = {
      count: categories?.length ?? 0,
      data: categories,
      error: catsError?.message ?? null,
    };

    // 4. Query listings
    const { data: listings, error: listingsError } = await supabase
      .from("listings")
      .select("id, title")
      .limit(3);
    results.listings = {
      count: listings?.length ?? 0,
      data: listings,
      error: listingsError?.message ?? null,
    };

  } catch (e: any) {
    results.exception = e.message;
  }

  return NextResponse.json(results);
}
