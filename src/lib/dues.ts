import type { Database } from "@/lib/supabase/database.types";
import { getSessionFromCookie } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  isValidDueId,
  isValidPaymentMethod,
  isValidPaymentReference,
  normalizePeriod,
} from "@/lib/dues-validation";
export { normalizePeriod };

type DueRow = Database["public"]["Tables"]["dues"]["Row"];

type DuesQueryOptions = {
  period?: string;
  userId?: string;
  status?: "pending" | "awaiting_verification" | "paid";
  limit?: number;
};

export async function getDuesForSession(options: DuesQueryOptions = {}) {
  const session = await getSessionFromCookie();
  if (!session) {
    throw new Error("Silakan login terlebih dahulu.");
  }

  const supabase = await createSupabaseServerClient();
  const period = normalizePeriod(options.period);

  let query = supabase.from("dues").select("*");

  if (session.role !== "admin") {
    query = query.eq("user_id", session.userId);
  } else if (options.userId) {
    query = query.eq("user_id", options.userId);
  }

  if (period) {
    query = query.eq("period", period);
  }

  if (options.status) {
    query = query.eq("status", options.status);
  }

  query = query.order("period", { ascending: false }).order("created_at", { ascending: false });

  if (options.limit && options.limit > 0) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  if (error) throw error;

  if (session.role === "admin" && data.length > 0) {
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, nama, no_rumah, blok")
      .in("id", data.map((due) => due.user_id));

    if (profilesError) throw profilesError;

    const profilesById = new Map(profiles.map((profile) => [profile.id, profile]));
    return data.map((due) => ({
      ...due,
      resident: profilesById.get(due.user_id) ?? null,
    }));
  }

  return data as DueRow[];
}

export async function generateDueInvoicesForPeriod(options: {
  period?: string;
  userId?: string;
  forceRefresh?: boolean;
}) {
  const session = await getSessionFromCookie();
  if (!session) {
    throw new Error("Silakan login terlebih dahulu.");
  }

  if (session.role !== "admin") {
    throw new Error("Hanya Admin yang dapat membuat tagihan otomatis.");
  }

  const supabase = await createSupabaseServerClient();
  const normalizedPeriod = normalizePeriod(options.period);

  const { data, error } = await supabase.rpc("generate_due_invoices", {
    target_period: normalizedPeriod ?? null,
    target_user_id: options.userId ?? null,
    force_refresh: options.forceRefresh ?? false,
  });

  if (error) throw error;
  return data?.[0] ?? { generated_count: 0, updated_count: 0, skipped_count: 0 };
}

export async function getDueById(id: string) {
  const session = await getSessionFromCookie();
  if (!session) {
    throw new Error("Silakan login terlebih dahulu.");
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("dues")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  if (session.role !== "admin" && data.user_id !== session.userId) {
    throw new Error("Anda tidak memiliki akses ke tagihan ini.");
  }

  return data as DueRow;
}

export async function updateDueStatus(
  id: string,
  updates: {
    amount?: number;
  }
) {
  const session = await getSessionFromCookie();
  if (!session) {
    throw new Error("Silakan login terlebih dahulu.");
  }

  if (session.role !== "admin") {
    throw new Error("Hanya Admin yang dapat memperbarui tagihan.");
  }

  const supabase = await createSupabaseServerClient();
  const payload: Database["public"]["Tables"]["dues"]["Update"] = {};

  if (typeof updates.amount === "number") {
    if (!Number.isFinite(updates.amount) || updates.amount < 0) {
      throw new Error("Nominal tagihan tidak valid.");
    }
    payload.amount = updates.amount;
  }

  if (Object.keys(payload).length === 0) {
    return (await getDueById(id)) as DueRow | null;
  }

  const { data, error } = await supabase
    .from("dues")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data as DueRow;
}

export async function deleteDueRecord(id: string) {
  const session = await getSessionFromCookie();
  if (!session) {
    throw new Error("Silakan login terlebih dahulu.");
  }

  if (session.role !== "admin") {
    throw new Error("Hanya Admin yang dapat menghapus tagihan.");
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("dues")
    .delete()
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data as DueRow;
}

export async function payDueInvoice(options: {
  dueId: string;
  paymentMethod: string;
  paymentReference?: string | null;
  idempotencyKey?: string | null;
  paidByUserId?: string | null;
}) {
  const session = await getSessionFromCookie();
  if (!session) {
    throw new Error("Silakan login terlebih dahulu.");
  }

  if (session.role !== "admin") {
    throw new Error("Hanya Admin yang dapat memverifikasi pembayaran.");
  }

  const dueId = options.dueId?.trim();
  if (!dueId) {
    throw new Error("ID tagihan tidak valid.");
  }

  const paymentMethod = options.paymentMethod?.trim();
  if (!isValidPaymentMethod(paymentMethod)) {
    throw new Error("Metode pembayaran tidak valid.");
  }

  if (!isValidPaymentReference(options.paymentReference ?? null)) {
    throw new Error("Referensi pembayaran maksimal 120 karakter.");
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("pay_due_invoice", {
    due_id_param: dueId,
    payment_method: paymentMethod,
    payment_reference: options.paymentReference ?? null,
    idempotency_key: options.idempotencyKey ?? null,
    paid_by_user_id: options.paidByUserId ?? session.userId,
  });

  if (error) throw error;
  return data?.[0] ?? null;
}

export async function requestDuePayment(options: {
  dueId: string;
  paymentMethod: string;
  paymentReference?: string | null;
}) {
  const session = await getSessionFromCookie();
  if (!session) {
    throw new Error("Silakan login terlebih dahulu.");
  }

  if (session.role !== "warga") {
    throw new Error("Hanya warga yang dapat mengajukan pembayaran.");
  }

  const dueId = options.dueId.trim();
  const paymentMethod = options.paymentMethod.trim();
  if (!isValidDueId(dueId)) {
    throw new Error("ID tagihan tidak valid.");
  }

  if (!isValidPaymentMethod(paymentMethod)) {
    throw new Error("Metode pembayaran tidak valid.");
  }

  if (!isValidPaymentReference(options.paymentReference ?? null)) {
    throw new Error("Referensi pembayaran maksimal 120 karakter.");
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("request_due_payment", {
    due_id_param: dueId,
    payment_method_param: paymentMethod,
    payment_reference_param: options.paymentReference?.trim() || null,
  });

  if (error) throw error;
  return data?.[0] ?? null;
}
