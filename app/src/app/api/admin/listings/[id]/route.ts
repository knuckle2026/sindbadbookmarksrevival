import { NextResponse } from "next/server";
import { checkAdminApi } from "@/lib/auth/guards";
import { deleteListing } from "@/lib/db/queries/listings";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await checkAdminApi();
  if (!auth.ok) {
    return NextResponse.json({ error: "Forbidden" }, { status: auth.status });
  }
  const { id } = await params;
  await deleteListing(id);
  return NextResponse.json({ ok: true });
}
