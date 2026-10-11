"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Landmark,
  LogIn,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      }
    >
      <LoginForm />
    </React.Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "";
  const pesan = searchParams.get("pesan") || "";

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (pesan) {
      toast.info(pesan);
    }
  }, [pesan]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error);
        setLoading(false);
        return;
      }

      toast.success(data.message);

      // Redirect based on role or redirect param
      if (redirectTo) {
        router.push(redirectTo);
      } else if (data.user.role === "admin") {
        router.push("/dashboard/admin");
      } else {
        router.push("/dashboard/warga");
      }
    } catch {
      setError("Tidak bisa terhubung ke server. Coba lagi nanti.");
      setLoading(false);
    }
  };

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
            Aplikasi Kas & Iuran Warga RT
          </p>
        </div>
      </Link>

      {/* Login Card */}
      <Card className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl shadow-slate-200/50 dark:shadow-zinc-950/50 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-5 text-white text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm mb-3">
            <LogIn className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-black tracking-tight">Masuk ke Akun</h2>
          <p className="text-xs text-emerald-100 mt-1 font-medium">
            Login menggunakan akun yang terdaftar di RT Anda
          </p>
        </div>

        <CardContent className="p-6 space-y-5">
          {/* Error Alert */}
          {error && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span className="text-xs font-semibold leading-relaxed">{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                Alamat Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="contoh@warga.rt04"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 rounded-xl text-sm font-medium"
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-slate-400" />
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 rounded-xl text-sm font-medium pr-11"
                  required
                  autoComplete="current-password"
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

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider gap-2 shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  <span>Masuk</span>
                </>
              )}
            </Button>
          </form>

          {/* Register Link */}
          <p className="text-center text-xs text-slate-500 dark:text-zinc-400 pt-2">
            Belum punya akun?{" "}
            <Link
              href="/register"
              className="text-emerald-600 hover:text-emerald-700 font-bold hover:underline transition-colors"
            >
              Daftar di sini
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
