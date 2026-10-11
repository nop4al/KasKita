/**
 * GET /api/auth/me
 *
 * Returns the currently authenticated user's session data.
 * Used by the frontend to check login status and role.
 */

import { getSessionFromCookie } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSessionFromCookie();

    if (!session) {
      return Response.json(
        { authenticated: false, user: null },
        { status: 200 }
      );
    }

    return Response.json(
      {
        authenticated: true,
        user: session,
      },
      { status: 200 }
    );
  } catch {
    return Response.json(
      { authenticated: false, user: null, error: "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}
