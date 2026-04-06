import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Paths that bypass the age gate
const AGE_GATE_BYPASS = ["/age-gate", "/auth", "/_next", "/favicon", "/icon", "/apple-icon"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if path should bypass age gate
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
