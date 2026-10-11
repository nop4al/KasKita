/**
 * proxy.ts — Next.js 16 Proxy (replaces middleware.ts)
 *
 * Role-based route protection:
 * - /dashboard/admin/* → Only accessible by users with role "admin"
 * - /dashboard/warga/* → Only accessible by users with role "warga"
 * - /api/* → Pass through (API routes handle their own auth)
 *
 * NOTE: Since proxy runs on the edge and can't access the in-memory
 * session store directly, we encode basic role info into the cookie.
 * For the demo, we check the cookie existence for dashboard routes
 * and let the API routes handle detailed auth checks.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get("kaskita_session")?.value;

  // Allow API routes, static files, and public pages to pass through
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  // Dashboard routes require a session cookie
  if (pathname.startsWith("/dashboard")) {
    if (!sessionCookie) {
      // Redirect to login if not authenticated
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      loginUrl.searchParams.set("pesan", "Silakan login terlebih dahulu.");
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all dashboard routes and skip static/API paths
    "/dashboard/:path*",
  ],
};
