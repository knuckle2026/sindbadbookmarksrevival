import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/guards";
import { getListingById } from "@/lib/db/queries/listings";
import { insertReport } from "@/lib/db/queries/reports";

export async function POST(req: Request) {
  const body = (await req.json()) as {
    listing_id?: unknown;
    reason?: unknown;
  };
  if (typeof body.listing_id !== "string" || typeof body.reason !== "string") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const reason = body.reason.trim();
  if (reason.length < 1 || reason.length > 50) {
    return NextResponse.json(
      { error: "Reason must be 1-50 chars" },
      { status: 400 }
    );
  }

  const listing = await getListingById(body.listing_id);
  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  const current = await getCurrentUser();
  await insertReport(body.listing_id, reason, current?.authUser.id ?? null);
  return NextResponse.json({ ok: true });
}
