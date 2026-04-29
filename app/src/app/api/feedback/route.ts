import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { insertFeedback } from "@/lib/db/queries/feedback";

export async function POST(request: Request) {
  const { body } = await request.json().catch(() => ({ body: "" }));
  const trimmed = typeof body === "string" ? body.trim() : "";
  if (!trimmed || trimmed.length > 200) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await insertFeedback(trimmed, user?.id ?? null);
  return NextResponse.json({ ok: true });
}
