import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Database } from "@/lib/supabase/database.types";

export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.error("Supabase proxy is missing public environment configuration.");
    return Response.json(
      { error: "Aplikasi belum dikonfigurasi untuk Supabase." },
      { status: 503 }
    );
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }

        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error && error.name !== "AuthSessionMissingError") throw error;

    const { pathname } = request.nextUrl;
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      loginUrl.searchParams.set("pesan", "Silakan login terlebih dahulu.");
      return NextResponse.redirect(loginUrl);
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role,status")
      .eq("id", user.id)
      .maybeSingle();
    if (profileError) throw profileError;

    if (!profile || profile.status !== "active") {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("pesan", "Akun belum aktif atau tidak ditemukan.");
      return NextResponse.redirect(loginUrl);
    }

    const requiredRole = pathname.startsWith("/dashboard/admin")
      ? "admin"
      : pathname.startsWith("/dashboard/warga")
        ? "warga"
        : null;
    if (requiredRole && profile.role !== requiredRole) {
      return NextResponse.redirect(
        new URL(
          profile.role === "admin" ? "/dashboard/admin" : "/dashboard/warga",
          request.url
        )
      );
    }

    return response;
  } catch (error) {
    console.error("Supabase proxy authentication error:", error);
    return Response.json(
      { error: "Tidak dapat memvalidasi sesi Supabase." },
      { status: 503 }
    );
  }
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
