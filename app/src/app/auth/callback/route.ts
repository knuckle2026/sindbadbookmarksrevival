import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeRedirectPath } from "@/lib/utils/safe-redirect";
import { isEmailBlocked } from "@/lib/db/queries/blocked-emails";
import { deleteAuthUser } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeRedirectPath(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // ブロック済みメールアドレスの再ログイン/再登録を遮断
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const email = user?.email;
      if (user && email) {
        let blocked = false;
        try {
          blocked = await isEmailBlocked(email);
        } catch {
          blocked = false; // table 不在でも既存フローは継続
        }
        if (blocked) {
          await deleteAuthUser(user.id);
          await supabase.auth.signOut();
          return NextResponse.redirect(`${origin}/sbbm-control/login?error=blocked`);
        }
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/sbbm-control/login?error=auth_failed`);
}
