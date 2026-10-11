"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Landmark,
  UserPlus,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  Home,
  MapPin,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = React.useState({
    nama: "",
    email: "",
    password: "",
    noRumah: "",
    noHP: "",
    blok: "",
  });
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error);
        setLoading(false);
        return;
      }

      setSuccess(true);
      toast.success(data.message);
    } catch {
      setError("Tidak bisa terhubung ke server. Coba lagi nanti.");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-100 dark:from-zinc-950 dark:via-emerald-950/10 dark:to-zinc-900 flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
        <Card className="w-full max-w-md rounded-3xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-zinc-900 shadow-xl overflow-hidden text-center">
          <CardContent className="p-8 space-y-5">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 mx-auto">
              <CheckCircle2 className="h-10 w-10" strokeWidth={2.2} />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-black text-slate-900 dark:text-zinc-100">
                Pendaftaran Berhasil!
              </h2>
              <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                Akun Anda telah dibuat dengan status <strong className="text-amber-600 dark:text-amber-400">&quot;Menunggu Persetujuan&quot;</strong>.
                Silakan hubungi pengurus RT untuk mengaktifkan akun Anda.
              </p>
            </div>
            <div className="flex flex-col gap-2.5 pt-2">
              <Button
                onClick={() => router.push("/login")}
                className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider"
              >
                Ke Halaman Login
              </Button>
              <Link
                href="/"
                className="text-xs text-slate-500 hover:text-slate-700 font-semibold transition-colors"
              >
                ← Kembali ke Halaman Depan
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-100 dark:from-zinc-950 dark:via-emerald-950/10 dark:to-zinc-900 flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-3 mb-8 group">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 font-black group-hover:scale-105 transition-transform">
          <Landmark className="h-5 w-5" strokeWidth={2.4} />
        </div>
        <div>
          <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-zinc-100">
            KasKita
          </h1>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium -mt-0.5">
            Daftar Akun Warga Baru
          </p>
        </div>
      </Link>

      {/* Register Card */}
      <Card className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl shadow-slate-200/50 dark:shadow-zinc-950/50 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-5 text-white text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm mb-3">
            <UserPlus className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-black tracking-tight">Daftar Akun Warga</h2>
          <p className="text-xs text-blue-100 mt-1 font-medium">
            Buat akun untuk memantau iuran dan kas lingkungan RT Anda
          </p>
        </div>

        <CardContent className="p-6 space-y-5">
          {/* Info Box */}
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300">
            <p className="text-xs font-semibold leading-relaxed">
              ℹ️ Akun baru berstatus &quot;Menunggu Persetujuan&quot;. Setelah mendaftar, minta pengurus RT untuk mengaktifkan akun Anda.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span className="text-xs font-semibold leading-relaxed">{error}</span>
            </div>
          )}

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="space-y-1.5">
              <label htmlFor="nama" className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-slate-400" />
                Nama Lengkap <span className="text-rose-500">*</span>
              </label>
              <Input
                id="nama"
                type="text"
                placeholder="Nama sesuai KTP"
                value={formData.nama}
                onChange={(e) => handleChange("nama", e.target.value)}
                className="h-11 rounded-xl text-sm font-medium"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="reg-email" className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                Alamat Email <span className="text-rose-500">*</span>
              </label>
              <Input
                id="reg-email"
                type="email"
                placeholder="email@contoh.com"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="h-11 rounded-xl text-sm font-medium"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="reg-password" className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-slate-400" />
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimal 6 karakter"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  className="h-11 rounded-xl text-sm font-medium pr-11"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="noRumah" className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Home className="h-3.5 w-3.5 text-slate-400" />
                  No. Rumah
                </label>
                <Input
                  id="noRumah"
                  type="text"
                  placeholder="Cth: 14"
                  value={formData.noRumah}
                  onChange={(e) => handleChange("noRumah", e.target.value)}
                  className="h-11 rounded-xl text-sm font-medium"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="blok" className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  Blok / Gang
                </label>
                <Input
                  id="blok"
                  type="text"
                  placeholder="Gang Cempaka"
                  value={formData.blok}
                  onChange={(e) => handleChange("blok", e.target.value)}
                  className="h-11 rounded-xl text-sm font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="noHP" className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-slate-400" />
                No. HP / WhatsApp
              </label>
              <Input
                id="noHP"
                type="tel"
                placeholder="08xx-xxxx-xxxx"
                value={formData.noHP}
                onChange={(e) => handleChange("noHP", e.target.value)}
                className="h-11 rounded-xl text-sm font-medium"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider gap-2 shadow-sm mt-1"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  <span>Daftar Sekarang</span>
                </>
              )}
            </Button>
          </form>

          {/* Login Link */}
          <p className="text-center text-xs text-slate-500 dark:text-zinc-400 pt-1">
            Sudah punya akun?{" "}
            <Link
              href="/login"
              className="text-emerald-600 hover:text-emerald-700 font-bold hover:underline transition-colors"
            >
              Masuk di sini
            </Link>
          </p>
        </CardContent>
      </Card>

      {/* Back to Home */}
      <Link
        href="/"
        className="mt-5 text-xs text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-300 font-semibold transition-colors"
      >
        ← Kembali ke Halaman Depan
      </Link>
    </div>
  );
}
