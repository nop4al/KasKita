/**
 * PATCH /api/users/[id]/approve
 *
 * Admin-only: Approve a pending warga registration.
 */

import { type NextRequest } from "next/server";
import { getSessionFromCookie, approveUser, getUserById } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
        { success: false, error: "Hanya Admin yang bisa menyetujui pendaftaran warga." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const approved = approveUser(id);

    if (!approved) {
      return Response.json(
        {
          success: false,
          error: "User tidak ditemukan atau sudah aktif.",
        },
        { status: 404 }
      );
    }

    const user = getUserById(id);
    return Response.json({
      success: true,
      message: `Akun warga "${user?.nama}" berhasil disetujui dan sekarang aktif.`,
      user,
    });
  } catch {
    return Response.json(
      { success: false, error: "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}
