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
  // published に遷移するとき、初回承認日 (published_at) を NULL の場合のみ設定。
  // 再公開しても初回承認日は保持される。
  //
  // 重要: status の変更だけでは updated_at を bump しない。
  //   updated_at は「コンテンツ編集の最終日時」だけを表す semantics に統一。
  //   (UI 上「更新」表示の判定に用いるため)
  const setPublishedClause =
    status === "published"
      ? ", published_at = COALESCE(published_at, datetime('now'))"
      : "";
  const result = await db
    .prepare(
      `UPDATE listings SET status = ?, updated_by = ?${setPublishedClause}
       WHERE id = ?`
    )
    .bind(status, auth.current.authUser.id, id)
    .run();
  if (!result.success || result.meta.changes === 0) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, status });
}
