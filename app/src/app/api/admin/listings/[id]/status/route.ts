import { NextResponse } from "next/server";
import { checkAdminApi } from "@/lib/auth/guards";
import { getDB } from "@/lib/db/client";
import type { ListingStatus } from "@/lib/db/types";

const ALLOWED: ListingStatus[] = ["pending", "published", "hidden", "rejected"];

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await checkAdminApi();
  if (!auth.ok) {
    return NextResponse.json({ error: "Forbidden" }, { status: auth.status });
  }
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const status = (body as { status?: unknown } | null)?.status;
  if (typeof status !== "string" || !ALLOWED.includes(status as ListingStatus)) {
    return NextResponse.json({ error: "invalid_status" }, { status: 400 });
  }

  const db = await getDB();
  const result = await db
    .prepare(
      `UPDATE listings SET status = ?, updated_by = ?, updated_at = (datetime('now'))
       WHERE id = ?`
    )
    .bind(status, auth.current.authUser.id, id)
    .run();
  if (!result.success || result.meta.changes === 0) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, status });
}
