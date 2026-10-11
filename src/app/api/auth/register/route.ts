/**
 * POST /api/auth/register
 *
 * Body: { nama, email, password, noRumah?, noHP?, blok?, role? }
 *
 * - Admin can register warga with role="warga" → status "active"
 * - Self-registration (no auth header) → status "pending"
 */

import { type NextRequest } from "next/server";
import { registerUser, getSessionFromCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nama, email, password, noRumah, noHP, blok, role } = body;

    // Validate required fields
    if (!nama || !email || !password) {
      return Response.json(
        { success: false, error: "Nama, email, dan password wajib diisi." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return Response.json(
        { success: false, error: "Password minimal 6 karakter." },
        { status: 400 }
      );
    }

    // Check if registered by admin
    const session = await getSessionFromCookie();
    const registeredByAdmin = session?.role === "admin";

    const result = registerUser({
      nama,
      email,
      password,
      role: role || "warga",
      noRumah,
      noHP,
      blok,
      registeredByAdmin,
    });

    if (!result.success) {
      return Response.json(
        { success: false, error: result.error },
        { status: 409 }
      );
    }

    const message = registeredByAdmin
      ? `Akun warga "${nama}" berhasil didaftarkan dan langsung aktif.`
      : `Pendaftaran berhasil! Akun Anda berstatus "menunggu persetujuan" oleh Admin RT.`;

    return Response.json(
      {
        success: true,
        user: result.user,
        message,
      },
      { status: 201 }
    );
  } catch {
    return Response.json(
      { success: false, error: "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}
