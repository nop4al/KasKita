import { unstable_rethrow } from "next/navigation";
import { getSessionFromCookie } from "@/lib/auth";
import {
  generateDueInvoicesForPeriod,
  getDuesForSession,
} from "@/lib/dues";
import { normalizePeriod } from "@/lib/dues-validation";

function isValidStatus(
  value: string | null
): value is "pending" | "awaiting_verification" | "paid" {
  return value === "pending" || value === "awaiting_verification" || value === "paid";
}

export async function GET(request: Request) {
  try {
    const session = await getSessionFromCookie();
    if (!session) {
      return Response.json(
        { success: false, error: "Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period");
    const userId = searchParams.get("userId");
    const status = searchParams.get("status");
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? Number(limitParam) : undefined;

    if (status && !isValidStatus(status)) {
      return Response.json(
        { success: false, error: "Status tagihan tidak valid." },
        { status: 400 }
      );
    }

    if (period && !normalizePeriod(period)) {
      return Response.json(
        { success: false, error: "Periode tagihan tidak valid." },
        { status: 400 }
      );
    }

    if (limitParam && (!Number.isInteger(limit) || Number(limit) < 1)) {
      return Response.json(
        { success: false, error: "Batas data harus berupa bilangan bulat positif." },
        { status: 400 }
      );
    }

    const validatedStatus = isValidStatus(status) ? status : undefined;

    const dues = await getDuesForSession({
      period: period ?? undefined,
      userId: session.role === "admin" && userId ? userId : undefined,
      status: validatedStatus,
      limit: Number.isFinite(limit) && limit && limit > 0 ? limit : undefined,
    });

    return Response.json({ success: true, data: dues }, { status: 200 });
  } catch (error) {
    unstable_rethrow(error);
    console.error("List dues API error:", error);
    return Response.json(
      { success: false, error: "Gagal mengambil data tagihan iuran." },
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
        { success: false, error: "Hanya Admin yang dapat membuat tagihan otomatis." },
        { status: 403 }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return Response.json(
        { success: false, error: "Body permintaan harus berupa JSON yang valid." },
        { status: 400 }
      );
    }
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return Response.json(
        { success: false, error: "Body permintaan harus berupa objek JSON." },
        { status: 400 }
      );
    }
    const payload = body as Record<string, unknown>;
    const period = typeof payload.period === "string" ? payload.period : undefined;
    const userId = typeof payload.userId === "string" ? payload.userId : undefined;

    if (payload.period !== undefined && typeof payload.period !== "string") {
      return Response.json(
        { success: false, error: "Periode tagihan tidak valid." },
        { status: 400 }
      );
    }
    if (period && !normalizePeriod(period)) {
      return Response.json(
        { success: false, error: "Periode tagihan tidak valid." },
        { status: 400 }
      );
    }
    if (payload.userId !== undefined && typeof payload.userId !== "string") {
      return Response.json(
        { success: false, error: "ID warga tidak valid." },
        { status: 400 }
      );
    }
    if (payload.forceRefresh !== undefined && typeof payload.forceRefresh !== "boolean") {
      return Response.json(
        { success: false, error: "forceRefresh harus berupa boolean." },
        { status: 400 }
      );
    }
    const forceRefresh = payload.forceRefresh === true;

    const result = await generateDueInvoicesForPeriod({
      period,
      userId,
      forceRefresh,
    });

    return Response.json(
      {
        success: true,
        data: result,
        message: `Tagihan berhasil diproses: ${result.generated_count} dibuat, ${result.updated_count} diperbarui, ${result.skipped_count} dilewati.`,
      },
      { status: 201 }
    );
  } catch (error) {
    unstable_rethrow(error);
    console.error("Generate dues API error:", error);
    const message = error instanceof Error ? error.message : "Gagal menghasilkan tagihan iuran.";
    return Response.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
