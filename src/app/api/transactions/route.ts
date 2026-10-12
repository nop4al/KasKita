import { unstable_rethrow } from "next/navigation";
import { getSessionFromCookie } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function isValidDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
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
        { success: false, error: "Hanya Admin yang dapat mencatat transaksi." },
        { status: 403 }
      );
    }

    const body = await request.json() as Record<string, unknown>;
    const description = typeof body.description === "string" ? body.description.trim() : "";
    const category = typeof body.category === "string" ? body.category.trim() : "";
    const amount = Number(body.amount);
    const type = body.type;
    const transactionDate = body.transactionDate;

    if (
      !description ||
      description.length > 200 ||
      !category ||
      category.length > 80 ||
      !Number.isSafeInteger(amount) ||
      amount <= 0 ||
      (type !== "income" && type !== "expense") ||
      !isValidDate(transactionDate)
    ) {
      return Response.json(
        { success: false, error: "Lengkapi tanggal, uraian, kategori, nominal, dan tipe transaksi dengan benar." },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("ledger_transactions")
      .insert({
        receipt_number: `KK-${transactionDate.slice(0, 7).replace("-", "")}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
        transaction_date: transactionDate,
        description,
        amount,
        type,
        category,
        person_in_charge: session.nama,
        created_by: session.userId,
      })
      .select("*")
      .single();

    if (error) throw error;
    return Response.json(
      { success: true, data, message: "Transaksi berhasil disimpan." },
      { status: 201 }
    );
  } catch (error) {
    unstable_rethrow(error);
    console.error("Create transaction API error:", error);
    return Response.json(
      { success: false, error: "Gagal menyimpan transaksi kas." },
      { status: 500 }
    );
  }
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
    const month = searchParams.get("month"); // Format: "MM" (misal: "10")
    const year = searchParams.get("year");   // Format: "YYYY" (misal: "2026")

    const supabase = await createSupabaseServerClient();
    let query = supabase
      .from("ledger_transactions")
      .select("*")
      .order("transaction_date", { ascending: false });

    // Jika ada filter bulan dan tahun dari frontend
    if (year && month) {
      const startDate = `${year}-${month.padStart(2, "0")}-01`;
      // Cari sampai akhir bulan
      const lastDay = new Date(Number(year), Number(month), 0).getDate();
      const endDate = `${year}-${month.padStart(2, "0")}-${lastDay}`;
      query = query.gte("transaction_date", startDate).lte("transaction_date", endDate);
    } else if (year) {
      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;
      query = query.gte("transaction_date", startDate).lte("transaction_date", endDate);
    }

    const { data, error } = await query;

    if (error) throw error;

    return Response.json(
      { success: true, data },
      { status: 200 }
    );
  } catch (error) {
    unstable_rethrow(error);
    console.error("Get transactions API error:", error);
    return Response.json(
      { success: false, error: "Gagal mengambil data transaksi kas." },
      { status: 500 }
    );
  }
}