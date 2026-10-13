import { unstable_rethrow } from "next/navigation";
import { getSessionFromCookie } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// PUT: Mengubah data transaksi kas (Admin)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromCookie();
    if (!session || session.role !== "admin") {
      return Response.json({ success: false, error: "Akses ditolak." }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json() as Record<string, unknown>;
    const description = typeof body.description === "string" ? body.description.trim() : "";
    const category = typeof body.category === "string" ? body.category.trim() : "";
    const amount = Number(body.amount);

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("ledger_transactions")
      .update({ description, category, amount })
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;
    return Response.json({ success: true, data, message: "Transaksi berhasil diperbarui." }, { status: 200 });
  } catch (error) {
    unstable_rethrow(error);
    return Response.json({ success: false, error: "Gagal memperbarui transaksi." }, { status: 500 });
  }
}

// DELETE: Menghapus data transaksi kas (Admin)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromCookie();
    if (!session || session.role !== "admin") {
      return Response.json({ success: false, error: "Akses ditolak." }, { status: 403 });
    }

    const { id } = await params;
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("ledger_transactions")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return Response.json({ success: true, message: "Transaksi berhasil dihapus." }, { status: 200 });
  } catch (error) {
    unstable_rethrow(error);
    return Response.json({ success: false, error: "Gagal menghapus transaksi." }, { status: 500 });
  }
}