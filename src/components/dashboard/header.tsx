"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
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

interface AuthUser {
  userId: string;
  role: "admin" | "warga";
  nama: string;
  email: string;
  status: string;
}

export function DashboardHeader({ title }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [authUser, setAuthUser] = React.useState<AuthUser | null>(null);
  const [loggingOut, setLoggingOut] = React.useState(false);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setMounted(true);

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    // Fetch current session
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setAuthUser(data.user);
        }
      })
      .catch(() => {
        // silently ignore
      });

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
      }
    } catch {
      // proceed anyway
    }
    router.push("/login");
  };

  const isAdmin = pathname.startsWith("/dashboard/admin");
  const computedTitle =
    title ||
    (isAdmin
      ? "Buku Kas Pengurus RT 04"
      : "Iuran Warga & Info Kas Lingkungan");

  // Use auth user data if available, fallback to defaults
  const displayName = authUser
    ? authUser.nama
    : isAdmin
    ? "Pak Bambang S."
    : "Pak Ahmad Fauzi";
  const displayRole = authUser
    ? authUser.role === "admin"
      ? "Bendahara RT 04"
      : `Warga · ${authUser.email}`
    : isAdmin
    ? "Bendahara RT 04"
    : "Warga Rumah No. 14";
  const initials = authUser
    ? authUser.nama
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : isAdmin
    ? "BS"
    : "AF";

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
            {authUser && (
              <Badge className="bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300 text-[10px] font-bold border-green-300 dark:border-green-800">
                ● Online
              </Badge>
            )}
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

        {/* User Profile Dropdown (React-controlled with click-outside) */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-slate-100 dark:hover:bg-zinc-800 outline-none transition-colors cursor-pointer"
            aria-expanded={dropdownOpen}
          >
            <Avatar className="h-8 w-8 border border-emerald-300 dark:border-emerald-700">
              <AvatarImage
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}`}
                alt="Foto Profil"
              />
              <AvatarFallback className="bg-emerald-600 text-[11px] font-bold text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:block text-left text-xs leading-none">
              <p className="font-extrabold text-slate-800 dark:text-zinc-100">
                {displayName}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                {displayRole}
              </p>
            </div>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-1.5 shadow-lg shadow-black/5 dark:shadow-black/40 z-50 animate-in fade-in-0 zoom-in-95 duration-100">
              <div className="px-2 py-1.5 border-b border-slate-100 dark:border-zinc-800 mb-1">
                <p className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                  {displayName}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  {displayRole}
                </p>
              </div>

              <Link
                href={isAdmin ? "/dashboard/warga" : "/dashboard/admin"}
                onClick={() => setDropdownOpen(false)}
                className="flex items-center w-full px-2 py-1.5 text-xs rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 transition-colors"
              >
                {isAdmin ? (
                  <>
                    <UserCheck className="mr-2 h-3.5 w-3.5 text-blue-600 shrink-0" />
                    <span>Lihat Sebagai Warga</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="mr-2 h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>Lihat Sebagai Pengurus RT</span>
                  </>
                )}
              </Link>

              <button
                type="button"
                onClick={() => {
                  setDropdownOpen(false);
                  toast.info("Fitur pengaturan akun siap dikembangkan.");
                }}
                className="flex items-center w-full px-2 py-1.5 text-xs rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 transition-colors text-left"
              >
                <Settings className="mr-2 h-3.5 w-3.5 text-slate-500 shrink-0" />
                <span>Pengaturan Akun</span>
              </button>

              <div className="my-1 border-t border-slate-100 dark:border-zinc-800" />

              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex items-center w-full px-2 py-1.5 text-xs rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-semibold transition-colors text-left disabled:opacity-50"
              >
                {loggingOut ? (
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin shrink-0" />
                ) : (
                  <LogOut className="mr-2 h-3.5 w-3.5 shrink-0" />
                )}
                <span>{loggingOut ? "Keluar..." : "Logout"}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
