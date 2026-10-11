"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Moon,
  Sun,
  LogOut,
  User,
  Settings,
  Calendar,
  ShieldCheck,
  UserCheck,
  Bell,
  Landmark,
} from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export interface HeaderProps {
  title?: string;
}

export function DashboardHeader({ title }: HeaderProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isAdmin = pathname.startsWith("/dashboard/admin");
  const computedTitle =
    title ||
    (isAdmin
      ? "Buku Kas Pengurus RT 04"
      : "Iuran Warga & Info Kas Lingkungan");

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="-ml-1 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg" />
        <Separator orientation="vertical" className="h-5 hidden sm:block" />
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
              {computedTitle}
            </h1>
            <Badge
              className={
                isAdmin
                  ? "bg-emerald-600 text-white text-[10px] font-bold"
                  : "bg-blue-600 text-white text-[10px] font-bold"
              }
            >
              {isAdmin ? "Pengurus" : "Warga"}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 hidden sm:flex items-center gap-1.5 mt-0.5">
            <Calendar className="h-3 w-3 text-emerald-600" />
            <span>Oktober 2026 · RT 04 / RW 08 Kel. Sukamaju</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Toggle Mode Gelap / Terang */}
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

        {/* User Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-slate-100 dark:hover:bg-zinc-800 outline-none transition-colors"
          >
            <Avatar className="h-8 w-8 border border-emerald-300 dark:border-emerald-700">
              <AvatarImage
                src={
                  isAdmin
                    ? "https://api.dicebear.com/7.x/initials/svg?seed=Bambang+Sutrisno"
                    : "https://api.dicebear.com/7.x/initials/svg?seed=Ahmad+Fauzi"
                }
                alt="Foto Profil"
              />
              <AvatarFallback className="bg-emerald-600 text-[11px] font-bold text-white">
                {isAdmin ? "BS" : "AF"}
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:block text-left text-xs leading-none">
              <p className="font-extrabold text-slate-800 dark:text-zinc-100">
                {isAdmin ? "Pak Bambang S." : "Pak Ahmad Fauzi"}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                {isAdmin ? "Bendahara RT 04" : "Warga Rumah No. 14"}
              </p>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-1.5">
            <DropdownMenuLabel className="font-normal px-2 py-1.5">
              <div className="flex flex-col space-y-0.5">
                <p className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                  {isAdmin ? "Bambang Sutrisno" : "Ahmad Fauzi"}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  {isAdmin ? "Pengurus Kas RT 04" : "Gang Cempaka Blok C"}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="p-0">
              <Link href={isAdmin ? "/dashboard/warga" : "/dashboard/admin"} className="flex items-center w-full px-2 py-1.5 text-xs cursor-pointer">
                {isAdmin ? (
                  <>
                    <UserCheck className="mr-2 h-3.5 w-3.5 text-blue-600" />
                    <span>Lihat Sebagai Warga</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="mr-2 h-3.5 w-3.5 text-emerald-600" />
                    <span>Lihat Sebagai Pengurus RT</span>
                  </>
                )}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs cursor-pointer">
              <Settings className="mr-2 h-3.5 w-3.5 text-slate-500" />
              <span>Pengaturan Akun</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="p-0">
              <Link href="/" className="flex items-center w-full px-2 py-1.5 text-xs text-rose-600 dark:text-rose-400 cursor-pointer font-semibold">
                <LogOut className="mr-2 h-3.5 w-3.5" />
                <span>Kembali ke Halaman Depan</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
