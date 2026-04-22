import { NextResponse } from "next/server";
import { listGenres } from "@/lib/db/queries/genres";

export async function GET() {
  const genres = await listGenres();
  return NextResponse.json({ count: genres.length, genres });
}
