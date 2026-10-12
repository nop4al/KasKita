/**
 * POST /api/auth/login
 *
 * Body: { email: string, password: string }
 * Returns: { success, user, token } or { success: false, error }
 */

import { type NextRequest } from "next/server";
import { unstable_rethrow } from "next/navigation";
import { loginUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return Response.json(
        { success: false, error: "Email dan password wajib diisi." },
        { status: 400 }
      );
    }

    const result = await loginUser(email, password);

    if (!result.success) {
      return Response.json(
        { success: false, error: result.error },
        { status: 401 }
      );
    }

    return Response.json(
      {
        success: true,
        user: result.user,
        message: "Login berhasil! Selamat datang.",
      },
      { status: 200 }
    );
  } catch (err) {
    unstable_rethrow(err);
    console.error("Login API error:", err);
    return Response.json(
      { success: false, error: "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}
