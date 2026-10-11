"use client";

import * as React from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  Landmark,
  Moon,
  Sun,
  ShieldCheck,
  UserCheck,
  ArrowRight,
  Menu,
  X,
  Home,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function HomeNavbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand: KasKita */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs group-hover:scale-105 transition-transform font-black">
            <Landmark className="h-5 w-5" strokeWidth={2.4} />
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-slate-900 dark:text-zinc-100">
              KasKita
            </span>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-none">
              Aplikasi Kas &amp; Iuran Warga Kampung
            </p>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-600 dark:text-zinc-400">
          <a href="#fitur" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
            Fitur Warga
          </a>
          <a href="#multi-rt" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
            Cari RT Anda
          </a>
          <a href="#cara-kerja" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
            Cara Pakai
          </a>
          <a href="#faq" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
            Tanya Jawab
          </a>
        </nav>

        {/* Action Buttons */}
        <div className="hidden sm:flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-xl border-slate-200 dark:border-zinc-800"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle tema gelap/terang"
          >
            {mounted ? (
              theme === "dark" ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-slate-700" />
              )
            ) : (
              <div className="h-4 w-4" />
            )}
          </Button>

          {/* Masuk Portal Kas Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center justify-center gap-2 rounded-xl text-xs font-bold h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs outline-none transition-colors">
              <span>Masuk Aplikasi</span>
              <ArrowRight className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60 p-2">
              <DropdownMenuLabel className="text-xs font-bold px-2 py-1 text-slate-500">
                Pilih Akun Masuk
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="p-0">
                <Link
                  href="/dashboard/admin"
                  className="flex items-center gap-3 w-full p-2 text-xs cursor-pointer rounded-lg hover:bg-emerald-50 dark:hover:bg-zinc-800"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-zinc-100">Panel Pengurus RT</p>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">Untuk Pak RT &amp; Bendahara</p>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="p-0">
                <Link
                  href="/dashboard/warga"
                  className="flex items-center gap-3 w-full p-2 text-xs cursor-pointer rounded-lg hover:bg-blue-50 dark:hover:bg-zinc-800"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                    <UserCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-zinc-100">Portal Warga RT</p>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">Cek Status Iuran Keluarga</p>
                  </div>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex items-center gap-2 sm:hidden">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-xl"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {mounted ? (
              theme === "dark" ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4" />
              )
            ) : (
              <div className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-xl"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-3">
          <nav className="flex flex-col gap-1 text-sm font-bold text-slate-700 dark:text-zinc-300">
            <a
              href="#fitur"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800"
            >
              Fitur Warga
            </a>
            <a
              href="#multi-rt"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800"
            >
              Cari RT Anda
            </a>
            <a
              href="#cara-kerja"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800"
            >
              Cara Pakai
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800"
            >
              Tanya Jawab
            </a>
          </nav>
          <div className="pt-2 border-t border-slate-200 dark:border-zinc-800 flex flex-col gap-2">
            <Link
              href="/dashboard/admin"
              className={cn(
                buttonVariants({ variant: "default" }),
                "w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 rounded-xl"
              )}
            >
              Masuk Panel Pengurus (Admin RT)
            </Link>
            <Link
              href="/dashboard/warga"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "w-full font-bold text-xs h-10 rounded-xl"
              )}
            >
              Masuk Portal Warga (Cek Iuran)
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
