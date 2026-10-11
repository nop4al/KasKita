/**
 * GET /api/users
 *
 * Admin-only: Returns list of all registered users.
 * Used to populate the warga management table.
 */

import { getSessionFromCookie, getAllUsers } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSessionFromCookie();

    if (!session) {
      return Response.json(
        { success: false, error: "Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    if (session.role !== "admin") {
      return Response.json(
        { success: false, error: "Hanya Admin (Pengurus RT) yang bisa mengakses data ini." },
        { status: 403 }
      );
    }

    const users = getAllUsers();
    return Response.json({
      success: true,
      data: users,
      total: users.length,
    });
  } catch {
    return Response.json(
      { success: false, error: "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionFromCookie();

    if (!session) {
      return Response.json(
        { success: false, error: "Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    if (session.role !== "admin") {
      return Response.json(
        { success: false, error: "Hanya Admin yang dapat mendaftarkan warga baru." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { nama, email, password, noRumah, noHP, blok, role } = body;

    if (!nama || !email || !password) {
      return Response.json(
        { success: false, error: "Nama, email, dan password wajib diisi." },
        { status: 400 }
      );
    }

    const { registerUser } = await import("@/lib/auth");
    const result = registerUser({
      nama,
      email,
      password,
      noRumah,
      noHP,
      blok,
      role: role || "warga",
      registeredByAdmin: true,
    });

    if (!result.success) {
      return Response.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return Response.json({
      success: true,
      message: `Warga "${result.user.nama}" berhasil didaftarkan dengan status aktif.`,
      user: result.user,
    });
  } catch {
    return Response.json(
      { success: false, error: "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}
