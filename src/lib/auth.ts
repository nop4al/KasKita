import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export type UserRole = "admin" | "warga";
export type UserStatus = "active" | "pending";

export interface User {
  id: string;
  nama: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  noRumah?: string;
  noHP?: string;
  blok?: string;
  createdAt: string;
}

export interface SessionPayload {
  userId: string;
  role: UserRole;
  nama: string;
  email: string;
  status: UserStatus;
}

function mapProfile(profile: Profile): User {
  return {
    id: profile.id,
    nama: profile.nama,
    email: profile.email,
    role: profile.role,
    status: profile.status,
    noRumah: profile.no_rumah ?? undefined,
    noHP: profile.no_hp ?? undefined,
    blok: profile.blok ?? undefined,
    createdAt: profile.created_at,
  };
}

function toSession(user: User): SessionPayload {
  return {
    userId: user.id,
    role: user.role,
    nama: user.nama,
    email: user.email,
    status: user.status,
  };
}

function userFromAuth(
  id: string,
  email: string,
  data: { nama: string; noRumah?: string; noHP?: string; blok?: string },
  status: UserStatus
): User {
  return {
    id,
    email,
    nama: data.nama,
    role: "warga",
    status,
    noRumah: data.noRumah,
    noHP: data.noHP,
    blok: data.blok,
    createdAt: new Date().toISOString(),
  };
}

export async function registerUser(data: {
  nama: string;
  email: string;
  password: string;
  role?: UserRole;
  noRumah?: string;
  noHP?: string;
  blok?: string;
  registeredByAdmin?: boolean;
}): Promise<
  { success: true; user: User } | { success: false; error: string }
> {
  const email = data.email.trim().toLowerCase();
  const userData = {
    nama: data.nama.trim(),
    noRumah: data.noRumah,
    noHP: data.noHP,
    blok: data.blok,
  };

  if (data.registeredByAdmin) {
    const admin = createSupabaseAdminClient();
    const { data: created, error } = await admin.auth.admin.createUser({
      email,
      password: data.password,
      email_confirm: true,
      app_metadata: { role: "warga", status: "active" },
      user_metadata: userData,
    });

    if (error) {
      return {
        success: false,
        error: error.code === "email_exists" ? "Email sudah terdaftar." : error.message,
      };
    }

    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("*")
      .eq("id", created.user.id)
      .single();
    if (profileError) throw profileError;

    return { success: true, user: mapProfile(profile) };
  }

  const supabase = await createSupabaseServerClient();
  const { data: created, error } = await supabase.auth.signUp({
    email,
    password: data.password,
    options: { data: userData },
  });

  if (error) {
    return {
      success: false,
      error: error.code === "user_already_exists"
        ? "Email sudah terdaftar."
        : error.message,
    };
  }
  if (!created.user || created.user.identities?.length === 0) {
    return { success: false, error: "Email sudah terdaftar." };
  }

  return {
    success: true,
    user: userFromAuth(created.user.id, email, userData, "pending"),
  };
}

export async function loginUser(
  email: string,
  password: string
): Promise<
  { success: true; user: SessionPayload } | { success: false; error: string }
> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });

  if (error?.code === "email_not_confirmed") {
    return {
      success: false,
      error: "Email Anda belum dikonfirmasi. Buka tautan konfirmasi di email sebelum login.",
    };
  }

  if (error || !data.user) {
    return { success: false, error: "Email atau password salah." };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profileError) throw profileError;
  if (!profile) {
    await supabase.auth.signOut();
    throw new Error("Profil akun tidak ditemukan di database Supabase.");
  }

  if (profile.status === "pending") {
    await supabase.auth.signOut();
    return {
      success: false,
      error: "Akun Anda belum disetujui oleh Admin RT. Silakan hubungi pengurus.",
    };
  }

  return { success: true, user: toSession(mapProfile(profile)) };
}

export async function logoutUser() {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSessionFromCookie(): Promise<SessionPayload | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error && error.name !== "AuthSessionMissingError") throw error;
  if (!data.user) return null;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profileError) throw profileError;
  if (!profile || profile.status !== "active") return null;
  return toSession(mapProfile(profile));
}

export async function getAllUsers(): Promise<User[]> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data.map(mapProfile);
}

export async function getWargaCount(): Promise<{
  total: number;
  active: number;
  pending: number;
}> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .select("status")
    .eq("role", "warga");
  if (error) throw error;

  return {
    total: data.length,
    active: data.filter((user) => user.status === "active").length,
    pending: data.filter((user) => user.status === "pending").length,
  };
}

export async function getUserById(id: string): Promise<User | null> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapProfile(data) : null;
}

export async function approveUser(userId: string): Promise<boolean> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .update({ status: "active" })
    .eq("id", userId)
    .eq("role", "warga")
    .eq("status", "pending")
    .select("id")
    .maybeSingle();
  if (error) throw error;
  return data !== null;
}

export async function updateUser(
  id: string,
  data: {
    nama?: string;
    email?: string;
    noRumah?: string;
    noHP?: string;
    blok?: string;
    status?: UserStatus;
    role?: UserRole;
  }
): Promise<
  { success: true; user: User } | { success: false; error: string }
> {
  const admin = createSupabaseAdminClient();
  const current = await getUserById(id);
  if (!current) return { success: false, error: "Warga tidak ditemukan." };
  if (current.role === "admin" && data.role === "warga") {
    return { success: false, error: "Peran Admin tidak dapat diubah dari halaman warga." };
  }

  if (data.email && data.email.trim().toLowerCase() !== current.email.toLowerCase()) {
    const { error } = await admin.auth.admin.updateUserById(id, {
      email: data.email.trim().toLowerCase(),
      email_confirm: true,
    });
    if (error) {
      return {
        success: false,
        error: error.code === "email_exists"
          ? "Email sudah digunakan oleh warga lain."
          : error.message,
      };
    }
  }

  const { data: profile, error } = await admin
    .from("profiles")
    .update({
      nama: data.nama,
      no_rumah: data.noRumah,
      no_hp: data.noHP,
      blok: data.blok,
      status: data.status,
      role: data.role,
    })
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) throw error;
  if (!profile) return { success: false, error: "Warga tidak ditemukan." };
  return { success: true, user: mapProfile(profile) };
}

export async function deleteUser(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const admin = createSupabaseAdminClient();
  const user = await getUserById(id);
  if (!user) return { success: false, error: "Warga tidak ditemukan." };
  if (user.role === "admin") {
    return {
      success: false,
      error: "Akun Admin (Pengurus Utama) tidak dapat dihapus.",
    };
  }

  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) throw error;
  return { success: true };
}
