import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { createServerClient } from "@supabase/ssr";

// Paths that bypass the age gate
const AGE_GATE_BYPASS = ["/age-gate", "/auth", "/_next", "/favicon", "/icon", "/apple-icon", "/sbbm-control"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // === Admin route guard ===
  if (pathname.startsWith("/sbbm-control")) {
    // Login page is accessible without admin check
    if (pathname === "/sbbm-control/login") {
      return await updateSession(request);
    }

    // Create Supabase client for middleware
    let supabaseResponse = NextResponse.next({ request });
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            supabaseResponse = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    // Not logged in → redirect to admin login
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/sbbm-control/login";
      return NextResponse.redirect(url);
    }

    // Check admin role — return 404 for non-admins (hide existence)
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      // Rewrite to not-found to hide admin panel existence
      const url = request.nextUrl.clone();
      url.pathname = "/not-found";
      return NextResponse.rewrite(url);
    }

    return supabaseResponse;
  }

  // === Age gate check (non-admin routes) ===
  const isBypassed = AGE_GATE_BYPASS.some((p) => pathname.startsWith(p));

  if (!isBypassed) {
    const ageVerified = request.cookies.get("age_verified");
    if (!ageVerified) {
      const url = request.nextUrl.clone();
      url.pathname = "/age-gate";
      return NextResponse.redirect(url);
    }
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
