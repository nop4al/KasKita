/**
 * POST /api/auth/login
 *
 * Body: { email: string, password: string }
 * Returns: { success, user, token } or { success: false, error }
 */

import { NextResponse, type NextRequest } from "next/server";
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

    const result = loginUser(email, password);

    if (!result.success) {
      return Response.json(
        { success: false, error: result.error },
        { status: 401 }
      );
    }

    const res = NextResponse.json(
      {
        success: true,
        user: result.user,
        message: "Login berhasil! Selamat datang.",
      },
      { status: 200 }
    );

    res.cookies.set("kaskita_session", result.token, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (err) {
    console.error("Login API error:", err);
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server: " + msg },
      { status: 500 }
    );
  }
}
