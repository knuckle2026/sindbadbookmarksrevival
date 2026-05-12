import { NextResponse } from "next/server";
import { checkAdminApi } from "@/lib/auth/guards";
import { addBlockedEmail } from "@/lib/db/queries/blocked-emails";
import { deleteProfile } from "@/lib/db/queries/profiles";
import { deleteAuthUser, getUserEmailsByIds } from "@/lib/supabase/admin";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const auth = await checkAdminApi();
  if (!auth.ok) {
    return NextResponse.json({ error: "forbidden" }, { status: auth.status });
  }
  const { userId: targetId } = await params;
  if (!targetId) {
    return NextResponse.json({ error: "missing_user_id" }, { status: 400 });
  }
  if (targetId === auth.current.authUser.id) {
    return NextResponse.json({ error: "cannot_delete_self" }, { status: 403 });
  }

  let reason: string | null = null;
  try {
    const body = (await request.json()) as { reason?: string };
    if (typeof body?.reason === "string" && body.reason.trim()) {
      reason = body.reason.trim().slice(0, 200);
    }
  } catch {
    /* no body is fine */
  }

  const emailMap = await getUserEmailsByIds([targetId]);
  const email = emailMap[targetId];

  if (email) {
    await addBlockedEmail(email, auth.current.authUser.id, reason);
  }

  const authResult = await deleteAuthUser(targetId);
  if (!authResult.ok && authResult.status !== 404) {
    return NextResponse.json(
      { error: "auth_delete_failed", detail: authResult.detail },
      { status: 500 },
    );
  }

  await deleteProfile(targetId);

  return NextResponse.json({ ok: true, blockedEmail: email ?? null });
}
