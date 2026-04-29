import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDB } from "@/lib/db/client";

export async function DELETE() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { env } = await getCloudflareContext({ async: true });
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  if (!serviceRoleKey || !supabaseUrl) {
    return NextResponse.json({ error: "server_misconfigured" }, { status: 500 });
  }

  const authRes = await fetch(
    `${supabaseUrl}/auth/v1/admin/users/${user.id}`,
    {
      method: "DELETE",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
    }
  );
  if (!authRes.ok && authRes.status !== 404) {
    const text = await authRes.text();
    return NextResponse.json(
      { error: "auth_delete_failed", detail: text },
      { status: 500 }
    );
  }

  const db = await getDB();
  await db.prepare("DELETE FROM profiles WHERE id = ?").bind(user.id).run();

  await supabase.auth.signOut();

  return NextResponse.json({ ok: true });
}
