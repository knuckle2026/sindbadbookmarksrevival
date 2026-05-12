import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Paths that bypass the age gate
// API routes are programmatic and must bypass the age gate so non-GET
// requests (PATCH/DELETE/POST) are not 307-redirected to /age-gate, which
// only accepts GET and would otherwise return 405 Method Not Allowed.
const AGE_GATE_BYPASS = ["/age-gate", "/auth", "/api", "/_next", "/favicon", "/icon", "/apple-icon", "/sbbm-control"];

// Paths that suspended users may still access (to avoid redirect loops / allow sign-out)
const SUSPENDED_BYPASS = ["/age-gate", "/auth", "/login", "/signup", "/reset-password", "/_next", "/favicon", "/icon", "/apple-icon"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // === Age gate check (non-admin routes) ===
  const isBypassed = AGE_GATE_BYPASS.some((p) => pathname.startsWith(p));

  if (!isBypassed) {
    const ageVerified = request.cookies.get("age_verified");
    if (!ageVerified) {
      const url = request.nextUrl.clone();
      url.pathname = "/age-gate";
      url.search = "";
      url.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
      return NextResponse.redirect(url);
    }
  }

  const { response, isSuspended } = await updateSession(request);

  if (isSuspended && !SUSPENDED_BYPASS.some((p) => pathname.startsWith(p))) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
