import { NextResponse } from "next/server";
import { checkAdminApi } from "@/lib/auth/guards";
import {
  deleteReport,
  updateReportStatus,
} from "@/lib/db/queries/reports";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await checkAdminApi();
  if (!auth.ok) {
    return NextResponse.json({ error: "unauth" }, { status: auth.status });
  }
  const { id } = await params;
  const body = (await req.json()) as { status?: unknown };
  if (body.status !== "pending" && body.status !== "reviewed") {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }
  await updateReportStatus(id, body.status);
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await checkAdminApi();
  if (!auth.ok) {
    return NextResponse.json({ error: "unauth" }, { status: auth.status });
  }
  const { id } = await params;
  await deleteReport(id);
  return NextResponse.json({ ok: true });
}
