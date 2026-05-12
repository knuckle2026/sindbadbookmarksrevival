import { NextResponse } from "next/server";
import { isEmailBlocked } from "@/lib/db/queries/blocked-emails";

export async function POST(request: Request) {
  let body: { email?: string };
  try {
    body = (await request.json()) as { email?: string };
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const email = body?.email?.trim();
  if (!email) {
    return NextResponse.json({ error: "missing_email" }, { status: 400 });
  }
  let blocked = false;
  try {
    blocked = await isEmailBlocked(email);
  } catch {
    // blocked_emails テーブルが未マイグレーションでも signup を妨げない
    blocked = false;
  }
  return NextResponse.json({ blocked });
}
