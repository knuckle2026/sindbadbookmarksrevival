import { NextResponse } from "next/server";
import { incrementClickCount } from "@/lib/db/queries/listings";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await incrementClickCount(id);
  return NextResponse.json({ ok: true });
}
