/**
 * POST /api/auth/logout
 *
 * Clears the session cookie and destroys the server-side session.
 */

import { unstable_rethrow } from "next/navigation";
import { logoutUser } from "@/lib/auth";

export async function POST() {
  try {
    await logoutUser();

    return Response.json(
      {
        success: true,
        message: "Logout berhasil. Sampai jumpa!",
      },
      { status: 200 }
    );
  } catch (error) {
    unstable_rethrow(error);
    console.error("Logout API error:", error);
    return Response.json(
      { success: false, error: "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}
