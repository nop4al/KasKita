import { unstable_rethrow } from "next/navigation";
import { getSessionFromCookie } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const session = await getSessionFromCookie();
    if (!session) {
      return Response.json(
        { success: false, error: "Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("app_settings")
      .select("monthly_dues, cleaning_fee, security_fee, due_day, updated_at")
      .eq("id", 1)
      .single();

    if (error) throw error;
    return Response.json({ success: true, data }, { status: 200 });
  } catch (error) {
    unstable_rethrow(error);
    console.error("Get app settings API error:", error);
    return Response.json(
      { success: false, error: "Gagal mengambil pengaturan iuran." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
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
        { success: false, error: "Hanya Admin yang dapat mengubah pengaturan iuran." },
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

    const monthlyDues = (body as Record<string, unknown>).monthlyDues;
    if (
      typeof monthlyDues !== "number" ||
      !Number.isSafeInteger(monthlyDues) ||
      monthlyDues < 0
    ) {
      return Response.json(
        { success: false, error: "Nominal iuran harus berupa bilangan bulat rupiah minimal Rp0." },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();
    const { data: currentSettings, error: readError } = await supabase
      .from("app_settings")
      .select("cleaning_fee, security_fee")
      .eq("id", 1)
      .single();
    if (readError) throw readError;

    if (monthlyDues < currentSettings.cleaning_fee + currentSettings.security_fee) {
      return Response.json(
        {
          success: false,
          error: "Nominal iuran tidak boleh lebih kecil dari total biaya kebersihan dan keamanan.",
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("app_settings")
      .update({ monthly_dues: monthlyDues, updated_at: new Date().toISOString() })
      .eq("id", 1)
      .select("monthly_dues, cleaning_fee, security_fee, due_day, updated_at")
      .single();

    if (error) throw error;
    return Response.json(
      { success: true, data, message: "Nominal iuran bulanan berhasil diperbarui." },
      { status: 200 }
    );
  } catch (error) {
    unstable_rethrow(error);
    console.error("Update app settings API error:", error);
    return Response.json(
      { success: false, error: "Gagal memperbarui pengaturan iuran." },
      { status: 500 }
    );
  }
}
