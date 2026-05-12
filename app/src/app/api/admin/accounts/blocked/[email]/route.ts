import { NextResponse } from "next/server";
import { checkAdminApi } from "@/lib/auth/guards";
import { removeBlockedEmail } from "@/lib/db/queries/blocked-emails";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ email: string }> },
) {
  const auth = await checkAdminApi();
  if (!auth.ok) {
    return NextResponse.json({ error: "forbidden" }, { status: auth.status });
  }
  const { email: rawEmail } = await params;
  const email = decodeURIComponent(rawEmail || "").trim();
  if (!email) {
    return NextResponse.json({ error: "missing_email" }, { status: 400 });
  }
  await removeBlockedEmail(email);
  return NextResponse.json({ ok: true });
}
