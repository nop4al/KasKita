"use client";

import * as React from "react";
import Link from "next/link";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PlusCircle,
  UserPlus,
  ArrowDownLeft,
  ArrowUpRight,
  Download,
  BookOpen,
  Users,
  CheckCircle2,
  Clock,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { DashboardSummary } from "@/lib/dashboard-data";
import { mockStats, mockTransaksi } from "@/lib/mock-data";

export default function AdminDashboardPage() {
  const [summary, setSummary] = React.useState<DashboardSummary | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    async function loadSummary() {
      try {
        const response = await fetch("/api/dashboard/summary");
        const result = await response.json() as {
          success?: boolean;
          data?: DashboardSummary;
          error?: string;
        };
        if (!response.ok || !result.success || !result.data) {
          throw new Error(result.error || "Gagal memuat ringkasan kas.");
        }
        if (!cancelled) setSummary(result.data);
      } catch (error) {
        if (!cancelled) {
          toast.error(error instanceof Error ? error.message : "Gagal memuat ringkasan kas.");
        }
      }
    }

    void loadSummary();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleQuickAction = (actionName: string) => {
    toast.info(`Membuka form "${actionName}" (fitur pencatatan siap dihubungkan).`);
  };

  const handleBroadcastReminder = () => {
    toast.success("Draf pengingat WhatsApp santun telah siap dikirim!");
  };
  const totalSaldo = summary?.totalSaldo ?? mockStats.totalSaldo;
  const pemasukanBulanIni = summary?.pemasukanBulanIni ?? mockStats.pemasukanBulanIni;
  const pengeluaranBulanIni = summary?.pengeluaranBulanIni ?? mockStats.pengeluaranBulanIni;
  const transaksi = summary?.transaksi ?? mockTransaksi;
  const totalWargaAktif = summary?.totalWargaAktif ?? 64;
  const iuranLunas = summary?.iuranLunas ?? 48;
  const iuranMenungguVerifikasi = summary?.iuranMenungguVerifikasi ?? 0;
  const iuranBelumLunas = summary?.iuranBelumLunas ?? 16;
  const persenLunas = totalWargaAktif > 0
    ? Math.round((iuranLunas / totalWargaAktif) * 100)
    : 0;
  const persenMenungguVerifikasi = totalWargaAktif > 0
    ? Math.round((iuranMenungguVerifikasi / totalWargaAktif) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Banner Utama Ramah Warga */}
      <PageHeader
        categoryText="KasKita · RT 04 / RW 08"
        badgeText="Oktober 2026"
        title="Buku Kas & Iuran Pengurus RT"
        description="Pantau uang kas masuk, catat belanja lingkungan, dan cek siapa saja warga yang sudah setor iuran bulan ini."
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickAction("Unduh Laporan PDF")}
              className="text-xs h-9.5 rounded-xl gap-1.5 font-bold"
            >
              <Download className="h-4 w-4" />
              <span>Cetak Laporan (PDF)</span>
            </Button>
            <Button
              size="sm"
              onClick={() => handleQuickAction("Catat Kas Baru")}
              className="text-xs h-9.5 rounded-xl gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs"
            >
              <PlusCircle className="h-4 w-4" />
              <span>+ Catat Uang Kas</span>
            </Button>
          </>
        }
      />

      {/* 3 Kartu Ringkasan Kas */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
        <StatCard
          badgeText="SISA KAS SAAT INI"
          title="Total Uang Kas RT"
          value={totalSaldo}
          icon={Wallet}
          variant="emerald"
          description="Uang kas aman di rekening & kas tunai bendahara"
          subLabel="Iuran Warga Masuk"
          subValue={`${iuranLunas} dari ${totalWargaAktif} Rumah (${persenLunas}%)`}
        />
        <StatCard
          badgeText="MASUK BULAN INI"
          title="Uang Kas Masuk"
          value={pemasukanBulanIni}
          icon={TrendingUp}
          variant="emerald"
          description="Dari iuran sampah, keamanan, dan sumbangan warga"
          subLabel="Total Setoran"
          subValue="3 Catatan Masuk"
        />
        <StatCard
          badgeText="KELUAR BULAN INI"
          title="Uang Kas Keluar"
          value={pengeluaranBulanIni}
          icon={TrendingDown}
          variant="rose"
          description="Beli lampu jalan, konsumsi kerja bakti, & kebersihan"
          subLabel="Total Belanja"
          subValue="2 Catatan Belanja"
        />
      </section>

      {/* Baris Kedua: Jurnal Mutasi & Aksi Cepat Bendahara */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Kolom Kiri: Catatan Kas Terbaru */}
        <div id="transaksi" className="lg:col-span-2 scroll-mt-20">
          <RecentTransactions transactions={transaksi} limit={5} />
        </div>

        {/* Kolom Kanan: Aksi Cepat Pengurus & Status Tagihan */}
        <div className="space-y-6">
          {/* Card Aksi Cepat Bendahara */}
          <Card className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/70 dark:bg-zinc-800/40 p-4.5 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-emerald-600" />
                    <span>Tombol Cepat Pengurus</span>
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                    Catat langsung tanpa ribet buka banyak menu
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-2.5">
              <Button
                variant="outline"
                onClick={() => handleQuickAction("Catat Uang Masuk / Iuran")}
                className="w-full justify-between h-11 rounded-xl text-xs font-bold border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500 text-white font-bold">
                    <ArrowDownLeft className="h-4 w-4" strokeWidth={2.4} />
                  </div>
                  <span>+ Catat Iuran / Uang Masuk</span>
                </div>
                <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900 px-2 py-0.5 rounded-full font-bold">
                  Masuk
                </span>
              </Button>

              <Button
                variant="outline"
                onClick={() => handleQuickAction("Catat Uang Keluar")}
                className="w-full justify-between h-11 rounded-xl text-xs font-bold border-rose-200 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-800 dark:text-rose-300 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500 text-white font-bold">
                    <ArrowUpRight className="h-4 w-4" strokeWidth={2.4} />
                  </div>
                  <span>+ Catat Belanja Lingkungan</span>
                </div>
                <span className="text-[10px] bg-rose-100 dark:bg-rose-900 px-2 py-0.5 rounded-full font-bold">
                  Keluar
                </span>
              </Button>

              <Link
                href="/dashboard/admin/warga"
                className="w-full flex items-center justify-between h-11 px-4 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-bold hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors text-slate-800 dark:text-zinc-200"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-200 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 font-bold">
                    <UserPlus className="h-4 w-4" />
                  </div>
                  <span>Kelola & Tambah Warga</span>
                </div>
                <span className="text-[10px] text-slate-500 font-medium">
                  Buka Halaman →
                </span>
              </Link>
            </CardContent>
          </Card>

          {/* Card Status Iuran 64 Rumah */}
          <Card id="warga" className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm p-5 space-y-4 scroll-mt-20">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2.5">
              <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                <Users className="h-4 w-4 text-emerald-600" />
                <span>Iuran Warga Bulan Ini</span>
              </span>
              <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                {iuranLunas} dari {totalWargaAktif} Rumah
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden flex">
                <div className="h-full bg-emerald-500" style={{ width: `${persenLunas}%` }} />
                <div className="h-full bg-amber-400" style={{ width: `${persenMenungguVerifikasi}%` }} />
                <div
                  className="h-full bg-rose-400"
                  style={{ width: `${Math.max(100 - persenLunas - persenMenungguVerifikasi, 0)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-zinc-400">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" /> {iuranLunas} Rumah Lunas ({persenLunas}%)
                </span>
                <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
                  <Clock className="h-3.5 w-3.5" /> {iuranBelumLunas} Belum Bayar
                </span>
              </div>
            </div>

            <Link
              href="/dashboard/admin/iuran"
              className="flex w-full items-center justify-between rounded-xl border border-amber-200 px-3 py-2.5 text-xs font-bold text-amber-800 transition-colors hover:bg-amber-50 dark:border-amber-900 dark:text-amber-300 dark:hover:bg-amber-950/40"
            >
              <span>{iuranMenungguVerifikasi} pembayaran menunggu verifikasi</span>
              <span>Kelola iuran →</span>
            </Link>

            <Button
              onClick={handleBroadcastReminder}
              className="w-full text-xs h-10 rounded-xl gap-2 font-bold bg-[#25D366] hover:bg-[#20ba59] text-white shadow-xs"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Ingatkan {iuranBelumLunas} Warga Lewat WhatsApp</span>
            </Button>
          </Card>
        </div>
      </section>

    </div>
  );
}
