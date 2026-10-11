/**
 * GET /api/dashboard/summary
 *
 * Returns dashboard summary data based on the user's role.
 * - Admin: total saldo, pemasukan, pengeluaran, total warga, iuran stats
 * - Warga: kas RT, status iuran pribadi
 *
 * Requires authentication via cookie.
 */

import { getSessionFromCookie } from "@/lib/auth";
import {
  getAdminDashboardSummary,
  getWargaDashboardSummary,
} from "@/lib/dashboard-data";

export async function GET() {
  try {
    const session = await getSessionFromCookie();

    if (!session) {
      return Response.json(
        { success: false, error: "Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    if (session.role === "admin") {
      const summary = getAdminDashboardSummary();
      return Response.json({
        success: true,
        role: "admin",
        data: summary,
      });
    }

    // Warga
    const summary = getWargaDashboardSummary(session.userId);
    return Response.json({
      success: true,
      role: "warga",
      data: summary,
    });
  } catch {
    return Response.json(
      { success: false, error: "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}
