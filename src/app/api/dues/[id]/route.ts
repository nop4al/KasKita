import { unstable_rethrow } from "next/navigation";
import { getSessionFromCookie } from "@/lib/auth";
import { getDueById, updateDueStatus, deleteDueRecord } from "@/lib/dues";

export async function GET(
  _request: Request,
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

    const { id } = await params;
    const due = await getDueById(id);

    if (!due) {
      return Response.json(
        { success: false, error: "Tagihan tidak ditemukan." },
        { status: 404 }
      );
    }

    if (session.role !== "admin" && due.user_id !== session.userId) {
      return Response.json(
        { success: false, error: "Anda tidak memiliki akses ke tagihan ini." },
        { status: 403 }
      );
    }

    return Response.json({ success: true, data: due }, { status: 200 });
  } catch (error) {
    unstable_rethrow(error);
    console.error("Get due API error:", error);
    return Response.json(
      { success: false, error: "Gagal mengambil detail tagihan iuran." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
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

    const { id } = await params;
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

    if (session.role !== "admin") {
      return Response.json(
        { success: false, error: "Hanya Admin yang dapat mengubah tagihan." },
        { status: 403 }
      );
    }

    if (body.status !== undefined) {
      return Response.json(
        { success: false, error: "Status pembayaran hanya dapat berubah melalui alur pengajuan dan verifikasi." },
        { status: 400 }
      );
    }

    const amount = typeof body.amount === "number" ? body.amount : undefined;

    const updated = await updateDueStatus(id, {
      amount,
    });

    return Response.json({ success: true, data: updated }, { status: 200 });
  } catch (error) {
    unstable_rethrow(error);
    console.error("Update due API error:", error);
    const message = error instanceof Error ? error.message : "Gagal memperbarui tagihan iuran.";
    return Response.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
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
        { success: false, error: "Hanya Admin yang dapat menghapus tagihan." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const deleted = await deleteDueRecord(id);

    return Response.json({ success: true, data: deleted }, { status: 200 });
  } catch (error) {
    unstable_rethrow(error);
    console.error("Delete due API error:", error);
    const message = error instanceof Error ? error.message : "Gagal menghapus tagihan iuran.";
    return Response.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
