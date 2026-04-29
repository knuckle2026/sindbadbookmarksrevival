import { NextResponse } from "next/server";
import { checkAdminApi } from "@/lib/auth/guards";
import {
  deleteAnnouncement,
  updateAnnouncement,
} from "@/lib/db/queries/announcements";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await checkAdminApi();
  if (!auth.ok) {
    return NextResponse.json({ error: "Forbidden" }, { status: auth.status });
  }
  const { id } = await params;
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
  await updateAnnouncement(id, {
    title: body.title.trim(),
    body: body.body.trim(),
    sort_order: body.sort_order,
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await checkAdminApi();
  if (!auth.ok) {
    return NextResponse.json({ error: "Forbidden" }, { status: auth.status });
  }
  const { id } = await params;
  await deleteAnnouncement(id);
  return NextResponse.json({ ok: true });
}
