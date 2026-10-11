"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ArrowLeftRight,
  FileText,
  Settings,
  History,
  ShieldCheck,
  UserCheck,
  Landmark,
  Receipt,
  Wallet,
  Building2,
  Home,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";

interface MenuItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  tag?: string;
  badge?: string;
}

export function DashboardSidebar() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/dashboard/admin");
  const isWarga = pathname.startsWith("/dashboard/warga");

  const [totalWarga, setTotalWarga] = React.useState<number | null>(null);

  React.useEffect(() => {
    // Ambil jumlah user secara dinamis
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && typeof data.total === "number") {
          setTotalWarga(data.total);
        }
      })
      .catch(() => {
        // Abaikan jika offline / belum login
      });
  }, [pathname]);

  const adminMenu: MenuItem[] = [
    {
      title: "Ringkasan Kas RT",
      url: "/dashboard/admin",
      icon: LayoutDashboard,
      active: pathname === "/dashboard/admin",
    },
    {
      title: "Data Warga (KK)",
      url: "/dashboard/admin/warga",
      icon: Users,
      badge: totalWarga !== null ? `${totalWarga} KK` : "...",
      active: pathname === "/dashboard/admin/warga",
    },
    {
      title: "Catat Uang Kas",
      url: "/dashboard/admin#transaksi",
      icon: ArrowLeftRight,
      active: false,
    },
    {
      title: "Laporan Keuangan",
      url: "/dashboard/admin#laporan",
      icon: FileText,
      active: false,
    },
    {
      title: "Pengaturan Kas",
      url: "/dashboard/admin#pengaturan",
      icon: Settings,
      active: false,
    },
  ];

  const wargaMenu: MenuItem[] = [
    {
      title: "Status Iuran Saya",
      url: "/dashboard/warga",
      icon: Receipt,
      active: pathname === "/dashboard/warga",
    },
    {
      title: "Riwayat Pembayaran",
      url: "/dashboard/warga#riwayat",
      icon: History,
      active: false,
    },
    {
      title: "Transparansi Kas RT",
      url: "/dashboard/warga#laporan",
      icon: FileText,
      active: false,
    },
  ];

  const currentMenu = isWarga ? wargaMenu : adminMenu;

  return (
    <Sidebar className="border-r border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
      {/* Sidebar Header: KasKita */}
      <SidebarHeader className="p-4 border-b border-slate-100 dark:border-zinc-800">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm font-black">
            <Landmark className="h-5 w-5" strokeWidth={2.4} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h2 className="text-base font-black tracking-tight text-slate-900 dark:text-zinc-100">
                KasKita
              </h2>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                RT 04
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">
              {isAdmin ? "Panel Pengurus RT" : "Portal Warga Lingkungan"}
            </p>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-3 py-3">
        {/* Menu Utama */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-bold text-slate-500 dark:text-zinc-400 px-2">
            {isAdmin ? "Menu Pengurus RT" : "Menu Iuran Warga"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1 mt-1">
              {currentMenu.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <Link
                    href={item.url}
                    data-active={item.active}
                    className="flex items-center gap-2.5 h-10 px-3 rounded-xl font-bold text-xs transition-colors hover:bg-emerald-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 data-[active=true]:bg-emerald-600 data-[active=true]:text-white"
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span className="flex-1">{item.title}</span>
                    {item.badge && (
                      <span className="text-[11px] font-medium opacity-80">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="my-3" />

        {/* Beralih Peran */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-bold text-slate-500 dark:text-zinc-400 px-2">
            Ganti Tampilan
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1 mt-1">
              <SidebarMenuItem>
                <Link
                  href="/dashboard/admin"
                  data-active={isAdmin}
                  className="flex items-center gap-2.5 h-9 px-3 rounded-xl text-xs font-bold transition-colors hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 data-[active=true]:bg-emerald-50 data-[active=true]:text-emerald-800 dark:data-[active=true]:bg-emerald-950/60 dark:data-[active=true]:text-emerald-300"
                >
                  <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Mode Pengurus RT</span>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link
                  href="/dashboard/warga"
                  data-active={isWarga}
                  className="flex items-center gap-2.5 h-9 px-3 rounded-xl text-xs font-bold transition-colors hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 data-[active=true]:bg-blue-50 data-[active=true]:text-blue-800 dark:data-[active=true]:bg-blue-950/60 dark:data-[active=true]:text-blue-300"
                >
                  <UserCheck className="h-4 w-4 text-blue-600 shrink-0" />
                  <span>Mode Warga</span>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link
                  href="/"
                  className="flex items-center gap-2.5 h-9 px-3 rounded-xl text-xs font-medium text-slate-600 dark:text-zinc-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <Home className="h-4 w-4 text-slate-400 shrink-0" />
                  <span>Halaman Depan (Semua RT)</span>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Sidebar Footer with generous clearance */}
      <SidebarFooter className="p-3 pb-20 sm:pb-4 border-t border-slate-100 dark:border-zinc-800">
        <div className="rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 p-3 border border-emerald-200 dark:border-emerald-800 space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-800 dark:text-emerald-300">
            <span className="flex items-center gap-1.5">
              <Wallet className="h-3.5 w-3.5 text-emerald-600" /> Kas RT 04
            </span>
            <span className="text-[10px] bg-emerald-200/70 dark:bg-emerald-900 px-1.5 py-0.2 rounded-full">
              Aktif
            </span>
          </div>
          <div>
            <p className="text-[11px] text-slate-600 dark:text-zinc-400">
              Total Uang Kas
            </p>
            <p className="text-base font-black text-emerald-950 dark:text-emerald-100">
              Rp 5.250.000
            </p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
