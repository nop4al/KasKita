import { unstable_rethrow } from "next/navigation";
import { getSessionFromCookie } from "@/lib/auth";
import { payDueInvoice } from "@/lib/dues";
import {
  isValidDueId,
  isValidPaymentMethod,
  isValidPaymentReference,
} from "@/lib/dues-validation";

export async function POST(
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

    if (session.role !== "admin") {
      return Response.json(
        { success: false, error: "Hanya Admin yang dapat memverifikasi pembayaran." },
        { status: 403 }
      );
    }

    const { id } = await params;
    if (!isValidDueId(id)) {
      return Response.json(
        { success: false, error: "ID tagihan tidak valid." },
        { status: 400 }
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
    const paymentMethod = payload.paymentMethod;
    const paymentReference = payload.paymentReference ?? null;
    if (!isValidPaymentMethod(paymentMethod)) {
      return Response.json(
        { success: false, error: "Metode pembayaran tidak valid." },
        { status: 400 }
      );
    }
    if (!isValidPaymentReference(paymentReference)) {
      return Response.json(
        { success: false, error: "Referensi pembayaran maksimal 120 karakter." },
        { status: 400 }
      );
    }

    const result = await payDueInvoice({
      dueId: id,
      paymentMethod,
      paymentReference,
      paidByUserId: session.userId,
    });

    return Response.json(
      { success: true, data: result, message: "Pembayaran berhasil diverifikasi dan dicatat." },
      { status: 200 }
    );
  } catch (error) {
    unstable_rethrow(error);
    console.error("Verify due payment API error:", error);
    const message = error instanceof Error
      ? error.message
      : "Gagal memverifikasi pembayaran tagihan.";
    return Response.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
