/**
 * GET, PUT, DELETE /api/users/[id]
 *
 * Admin-only: Full CRUD for individual citizen accounts.
 */

import { type NextRequest } from "next/server";
import { unstable_rethrow } from "next/navigation";
import {
  getSessionFromCookie,
  getUserById,
  updateUser,
  deleteUser,
} from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromCookie();
    if (!session || session.role !== "admin") {
      return Response.json(
        { success: false, error: "Akses ditolak. Hanya untuk Admin." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const user = await getUserById(id);
    if (!user) {
      return Response.json(
        { success: false, error: "Warga tidak ditemukan." },
        { status: 404 }
      );
    }

    return Response.json({ success: true, user });
  } catch (error) {
    unstable_rethrow(error);
    console.error("Get user API error:", error);
    return Response.json(
      { success: false, error: "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromCookie();
    if (!session || session.role !== "admin") {
      return Response.json(
        { success: false, error: "Akses ditolak. Hanya untuk Admin." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const result = await updateUser(id, body);

    if (!result.success) {
      return Response.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return Response.json({
      success: true,
      message: `Data warga "${result.user.nama}" berhasil diperbarui.`,
      user: result.user,
    });
  } catch (error) {
    unstable_rethrow(error);
    console.error("Update user API error:", error);
    return Response.json(
      { success: false, error: "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromCookie();
    if (!session || session.role !== "admin") {
      return Response.json(
        { success: false, error: "Akses ditolak. Hanya untuk Admin." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const result = await deleteUser(id);

    if (!result.success) {
      return Response.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return Response.json({
      success: true,
      message: "Data warga berhasil dihapus dari sistem.",
    });
  } catch (error) {
    unstable_rethrow(error);
    console.error("Delete user API error:", error);
    return Response.json(
      { success: false, error: "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}
