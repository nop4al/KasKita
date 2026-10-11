/**
 * auth.ts — Core authentication utilities for KasKita
 *
 * In-memory user store + cookie-based session management.
 * In production this would be backed by a real database and proper
 * password hashing (bcrypt / argon2), but for the tugas this is sufficient.
 */

import { cookies } from "next/headers";

// ── Types ──────────────────────────────────────────────────────────
export type UserRole = "admin" | "warga";
export type UserStatus = "active" | "pending";

export interface User {
  id: string;
  nama: string;
  email: string;
  password: string; // plain-text for demo only
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

// ── In-memory data stores ──────────────────────────────────────────
const users: Map<string, User> = new Map();
const sessions: Map<string, SessionPayload> = new Map();

// Seed default admin & sample warga
function seedUsers() {
  if (users.size > 0) return;

  const now = new Date().toISOString();

  // Default admin (Bendahara RT) - supports both email variants
  users.set("admin-001", {
    id: "admin-001",
    nama: "Bambang Sutrisno",
    email: "admin@kaskita.id",
    password: "admin123",
    role: "admin",
    status: "active",
    noRumah: "01",
    noHP: "081234567890",
    blok: "Gang Cempaka",
    createdAt: now,
  });

  users.set("admin-002", {
    id: "admin-002",
    nama: "Bambang Sutrisno",
    email: "bambang@kaskita.rt04",
    password: "admin123",
    role: "admin",
    status: "active",
    noRumah: "01",
    noHP: "081234567890",
    blok: "Gang Cempaka",
    createdAt: now,
  });

  // Sample active warga
  const wargaSamples: Omit<User, "createdAt">[] = [
    {
      id: "warga-001",
      nama: "Ahmad Fauzi",
      email: "warga@kaskita.id",
      password: "warga123",
      role: "warga",
      status: "active",
      noRumah: "14",
      noHP: "081234567891",
      blok: "Gang Cempaka",
    },
    {
      id: "warga-002",
      nama: "Ahmad Fauzi",
      email: "ahmad@warga.rt04",
      password: "warga123",
      role: "warga",
      status: "active",
      noRumah: "14",
      noHP: "081234567891",
      blok: "Gang Cempaka",
    },
    {
      id: "warga-003",
      nama: "Ibu Ratna",
      email: "ratna@kaskita.id",
      password: "warga123",
      role: "warga",
      status: "active",
      noRumah: "07",
      noHP: "081234567892",
      blok: "Gang Mawar",
    },
    {
      id: "warga-004",
      nama: "Hendra Gunawan",
      email: "hendra@warga.rt04",
      password: "warga123",
      role: "warga",
      status: "active",
      noRumah: "22",
      noHP: "081234567893",
      blok: "Gang Melati",
    },
    {
      id: "warga-005",
      nama: "Warga Pending",
      email: "warga.pending@kaskita.id",
      password: "warga123",
      role: "warga",
      status: "pending",
      noRumah: "30",
      noHP: "081234567894",
      blok: "Gang Anggrek",
    },
  ];

  for (const w of wargaSamples) {
    users.set(w.id, { ...w, createdAt: now });
  }
}

// Auto-seed on module load
seedUsers();

// ── Helpers ────────────────────────────────────────────────────────

function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function generateToken(): string {
  return `sess_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 12)}`;
}

// ── Public API ─────────────────────────────────────────────────────

/**
 * Register a new user.
 * - If registered by admin → status "active"
 * - If self-registered → status "pending"
 */
export function registerUser(data: {
  nama: string;
  email: string;
  password: string;
  role?: UserRole;
  noRumah?: string;
  noHP?: string;
  blok?: string;
  registeredByAdmin?: boolean;
}): { success: true; user: Omit<User, "password"> } | { success: false; error: string } {
  // Check duplicate email
  for (const u of users.values()) {
    if (u.email === data.email) {
      return { success: false, error: "Email sudah terdaftar." };
    }
  }

  const id = generateId(data.role === "admin" ? "admin" : "warga");
  const user: User = {
    id,
    nama: data.nama,
    email: data.email,
    password: data.password,
    role: data.role || "warga",
    status: data.registeredByAdmin ? "active" : "pending",
    noRumah: data.noRumah,
    noHP: data.noHP,
    blok: data.blok,
    createdAt: new Date().toISOString(),
  };

  users.set(id, user);
  const { password: _, ...safeUser } = user;
  return { success: true, user: safeUser };
}

/**
 * Authenticate a user by email + password.
 * Returns a session token on success.
 */
export function loginUser(
  email: string,
  password: string
): { success: true; token: string; user: SessionPayload } | { success: false; error: string } {
  const normalizedEmail = email.trim().toLowerCase();
  let foundUser: User | undefined;
  for (const u of users.values()) {
    if (u.email.toLowerCase() === normalizedEmail) {
      foundUser = u;
      break;
    }
  }

  if (!foundUser) {
    return { success: false, error: "Email atau password salah." };
  }

  if (foundUser.password !== password) {
    return { success: false, error: "Email atau password salah." };
  }

  if (foundUser.status === "pending") {
    return {
      success: false,
      error: "Akun Anda belum disetujui oleh Admin RT. Silakan hubungi pengurus.",
    };
  }

  const token = generateToken();
  const payload: SessionPayload = {
    userId: foundUser.id,
    role: foundUser.role,
    nama: foundUser.nama,
    email: foundUser.email,
    status: foundUser.status,
  };
  sessions.set(token, payload);

  return { success: true, token, user: payload };
}

/**
 * Logout — destroy session by token.
 */
export function logoutUser(token: string): boolean {
  return sessions.delete(token);
}

/**
 * Validate a session token and return the payload.
 */
export function getSession(token: string): SessionPayload | null {
  return sessions.get(token) || null;
}

/**
 * Get session from cookie (for use in route handlers).
 */
export async function getSessionFromCookie(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("kaskita_session")?.value;
  if (!token) return null;
  return getSession(token);
}

/**
 * Get all users (admin-only operation).
 */
export function getAllUsers(): Omit<User, "password">[] {
  const result: Omit<User, "password">[] = [];
  for (const u of users.values()) {
    const { password: _, ...safe } = u;
    result.push(safe);
  }
  return result;
}

/**
 * Get all warga count (for dashboard).
 */
export function getWargaCount(): { total: number; active: number; pending: number } {
  let total = 0;
  let active = 0;
  let pending = 0;
  for (const u of users.values()) {
    if (u.role === "warga") {
      total++;
      if (u.status === "active") active++;
      else pending++;
    }
  }
  return { total, active, pending };
}

/**
 * Get a user by ID (without password).
 */
export function getUserById(id: string): Omit<User, "password"> | null {
  const u = users.get(id);
  if (!u) return null;
  const { password: _, ...safe } = u;
  return safe;
}

/**
 * Approve a pending warga (admin action).
 */
export function approveUser(userId: string): boolean {
  const u = users.get(userId);
  if (!u || u.status !== "pending") return false;
  u.status = "active";
  return true;
}

/**
 * Update user data (admin action).
 */
export function updateUser(
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
): { success: true; user: Omit<User, "password"> } | { success: false; error: string } {
  const u = users.get(id);
  if (!u) {
    return { success: false, error: "Warga tidak ditemukan." };
  }

  // Check email uniqueness if email is changed
  if (data.email && data.email.toLowerCase() !== u.email.toLowerCase()) {
    const emailLower = data.email.toLowerCase();
    for (const [otherId, otherUser] of users.entries()) {
      if (otherId !== id && otherUser.email.toLowerCase() === emailLower) {
        return { success: false, error: "Email sudah digunakan oleh warga lain." };
      }
    }
    u.email = data.email;
  }

  if (data.nama !== undefined) u.nama = data.nama;
  if (data.noRumah !== undefined) u.noRumah = data.noRumah;
  if (data.noHP !== undefined) u.noHP = data.noHP;
  if (data.blok !== undefined) u.blok = data.blok;
  if (data.status !== undefined) u.status = data.status;
  if (data.role !== undefined) u.role = data.role;

  const { password: _, ...safe } = u;
  return { success: true, user: safe };
}

/**
 * Delete user (admin action).
 */
export function deleteUser(id: string): { success: boolean; error?: string } {
  const u = users.get(id);
  if (!u) {
    return { success: false, error: "Warga tidak ditemukan." };
  }
  if (u.role === "admin") {
    return { success: false, error: "Akun Admin (Pengurus Utama) tidak dapat dihapus." };
  }
  users.delete(id);
  return { success: true };
}
