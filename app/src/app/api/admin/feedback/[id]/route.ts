import { NextResponse } from "next/server";
import { checkAdminApi } from "@/lib/auth/guards";
import { deleteFeedback } from "@/lib/db/queries/feedback";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await checkAdminApi();
  if (!auth.ok) {
    return NextResponse.json({ error: "Forbidden" }, { status: auth.status });
  }
  const { id } = await params;
  await deleteFeedback(id);
  return NextResponse.json({ ok: true });
}
