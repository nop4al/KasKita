/**
 * POST /api/auth/logout
 *
 * Clears the session cookie and destroys the server-side session.
 */

import { type NextRequest } from "next/server";
import { logoutUser } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("kaskita_session")?.value;

    if (token) {
      logoutUser(token);
    }

    // Clear the cookie
    const response = Response.json(
      {
        success: true,
        message: "Logout berhasil. Sampai jumpa!",
      },
      { status: 200 }
    );

    const headers = new Headers(response.headers);
    headers.append(
      "Set-Cookie",
      "kaskita_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0"
    );

    return new Response(response.body, {
      status: 200,
      headers,
    });
  } catch {
    return Response.json(
      { success: false, error: "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}
