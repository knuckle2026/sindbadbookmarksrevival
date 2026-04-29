import { NextResponse } from "next/server";
import { checkAdminApi } from "@/lib/auth/guards";
import { createAnnouncement } from "@/lib/db/queries/announcements";

export async function POST(req: Request) {
  const auth = await checkAdminApi();
  if (!auth.ok) {
    return NextResponse.json({ error: "Forbidden" }, { status: auth.status });
  }
  const body = (await req.json()) as {
    title?: unknown;
    body?: unknown;
    sort_order?: unknown;
  };
  if (
    typeof body.title !== "string" ||
    typeof body.body !== "string" ||
    typeof body.sort_order !== "number"
  ) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const row = await createAnnouncement({
    title: body.title.trim(),
    body: body.body.trim(),
    sort_order: body.sort_order,
  });
  return NextResponse.json(row);
}
