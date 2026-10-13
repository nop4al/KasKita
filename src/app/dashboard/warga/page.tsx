"use client";

import * as React from "react";
import { format, parseISO } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  Wallet,
  CheckCircle2,
  Calendar,
  Clock,
  QrCode,
  Receipt,
  FileCheck,
  Printer,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatRupiah,
  mockIuranWarga,
  mockStats,
  mockRiwayatIuran,
} from "@/lib/mock-data";
import type { WargaDashboardSummary } from "@/lib/dashboard-data";

export default function WargaDashboardPage() {
  const [summary, setSummary] = React.useState<WargaDashboardSummary | null>(null);
  const [paymentMethod, setPaymentMethod] = React.useState("cash");
  const [paymentReference, setPaymentReference] = React.useState("");
  const [submittingPayment, setSubmittingPayment] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;

    async function loadSummary() {
      try {
        const response = await fetch("/api/dashboard/summary");
        const result = await response.json() as {
          success?: boolean;
          data?: WargaDashboardSummary;
          error?: string;
        };
        if (!response.ok || !result.success || !result.data) {
          throw new Error(result.error || "Gagal memuat data iuran.");
        }
        if (!cancelled) setSummary(result.data);
      } catch (error) {
        if (!cancelled) {
          toast.error(error instanceof Error ? error.message : "Gagal memuat data iuran.");
        }
      }
    }

    void loadSummary();
    return () => {
      cancelled = true;
    };
  }, []);

  const invoice = summary?.iuranWarga ?? mockIuranWarga;
  const riwayatIuran = summary?.riwayatIuran ?? mockRiwayatIuran;
  const isLunas = invoice.status === "Lunas";
  const isAwaitingVerification = invoice.status === "Menunggu Verifikasi";
  let formattedJatuhTempo = invoice.jatuhTempo;
  try {
    formattedJatuhTempo = format(parseISO(invoice.jatuhTempo), "d MMMM yyyy", {
      locale: idLocale,
    });
  } catch {
    // Keep the ISO date if it cannot be formatted.
  }

  const handleCetak = () => {
    toast.info("Mengunduh slip kwitansi resmi iuran warga (PDF).");
  };

  const handleAjukanPembayaran = async () => {
    const dueId = summary?.iuranWarga.dueId;
    if (!dueId) {
      toast.error("Tagihan periode ini belum diterbitkan pengurus.");
      return;
    }

    setSubmittingPayment(true);
    try {
      const response = await fetch(`/api/dues/${dueId}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethod, paymentReference }),
      });
      const result = await response.json() as { success?: boolean; error?: string };
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Gagal mengajukan pembayaran.");
      }

      toast.success("Pengajuan terkirim. Status akan lunas setelah diverifikasi pengurus.");
      const summaryResponse = await fetch("/api/dashboard/summary");
      const summaryResult = await summaryResponse.json() as {
        success?: boolean;
        data?: WargaDashboardSummary;
      };
      if (summaryResponse.ok && summaryResult.success && summaryResult.data) {
        setSummary(summaryResult.data);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal mengajukan pembayaran.");
    } finally {
      setSubmittingPayment(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header Ramah Warga */}
      <PageHeader
        categoryText="KasKita · Portal Warga"
        badgeText="Oktober 2026"
        title="Status Iuran & Kas Lingkungan"
        description="Cek apakah iuran keluarga Anda sudah tercatat, lihat transparansi kas RT, dan simpan bukti kwitansi sah."
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCetak}
              className="text-xs h-9.5 rounded-xl gap-1.5 font-bold"
            >
              <Printer className="h-4 w-4" />
              <span>Cetak Kwitansi</span>
            </Button>
          </>
        }
      />

      {/* Kartu Utama: Status Tagihan Iuran Warga */}
      <Card
        className={`rounded-2xl border transition-all duration-150 overflow-hidden shadow-sm ${
          isLunas
            ? "border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20"
            : isAwaitingVerification
              ? "border-blue-300 dark:border-blue-800 bg-blue-50/40 dark:bg-blue-950/20"
              : "border-amber-300 dark:border-amber-800 bg-amber-50/40 dark:bg-amber-950/20"
        }`}
      >
        <div className="bg-white/80 dark:bg-zinc-900/80 p-5 sm:p-6 border-b border-slate-200/80 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 block">
                KWITANSI IURAN BULANAN
              </span>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-zinc-100">
                {invoice.warga.nama}{" "}
                <span className="text-xs font-normal text-slate-500">
                  ({invoice.warga.blok} / {invoice.warga.noRumah})
                </span>
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold bg-slate-100 dark:bg-zinc-800 px-2.5 py-1 rounded-lg text-slate-600 dark:text-zinc-300">
              No: {invoice.nomorBukti || "Belum diterbitkan"}
            </span>
          </div>
        </div>

        <CardContent className="p-5 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Kolom Kiri: Rincian Tagihan */}
            <div className="lg:col-span-7 space-y-4">
              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 block">
                  Tagihan Periode
                </span>
                <p className="text-2xl font-black text-slate-900 dark:text-zinc-100">
                  {invoice.bulan}
                </p>
              </div>

              {/* Rincian Pos Iuran RT */}
              <div className="rounded-xl bg-white dark:bg-zinc-900 p-4 border border-slate-200 dark:border-zinc-800 space-y-2.5 text-xs">
                <div className="flex justify-between items-center text-slate-700 dark:text-zinc-300">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Iuran Pengangkutan Sampah &amp; Kebersihan
                  </span>
                  <span className="font-bold text-sm">
                    {formatRupiah(invoice.rincian.kebersihan)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-700 dark:text-zinc-300">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                    Iuran Keamanan Lingkungan &amp; Pos Ronda
                  </span>
                  <span className="font-bold text-sm">
                    {formatRupiah(invoice.rincian.keamanan)}
                  </span>
                </div>
                <div className="pt-2.5 border-t border-slate-100 dark:border-zinc-800 flex justify-between items-center text-sm font-extrabold text-slate-900 dark:text-zinc-100">
                  <span>Total Iuran Bulanan</span>
                  <span className="text-base text-emerald-600 dark:text-emerald-400">
                    {formatRupiah(invoice.nominal)}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                Batas Akhir Setor:{" "}
                <strong className="text-slate-800 dark:text-zinc-200">
                  {formattedJatuhTempo}
                </strong>
              </p>
            </div>

            {/* Kolom Kanan: Status & Tombol Bayar */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-center space-y-3.5">
              {isLunas ? (
                <div className="space-y-2 py-2">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 mb-1">
                    <CheckCircle2 className="h-10 w-10" strokeWidth={2.4} />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-tight">
                      SUDAH LUNAS
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                      Terima kasih, iuran keluarga Anda sudah diverifikasi bendahara RT 04.
                    </p>
                  </div>
                </div>
              ) : isAwaitingVerification ? (
                <div className="space-y-2 py-2">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 mb-1">
                    <Clock className="h-9 w-9" />
                  </div>
                  <h4 className="text-xl font-black text-blue-700 dark:text-blue-300 uppercase tracking-tight">
                    MENUNGGU VERIFIKASI
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Pengajuan {summary?.iuranWarga.metodePembayaran || "pembayaran"} Anda sudah diterima pengurus.
                    {summary?.iuranWarga.referensiPembayaran
                      ? ` Referensi: ${summary.iuranWarga.referensiPembayaran}.`
                      : ""}
                  </p>
                </div>
              ) : (
                <div className="space-y-3 w-full py-1">
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider block">
                      STATUS IURAN
                    </span>
                    <span className="text-xl font-black text-amber-700 dark:text-amber-400">
                      BELUM DIBAYAR
                    </span>
                    <span className="text-[11px] block text-slate-600 dark:text-zinc-400">
                      Mohon setor sebelum {formattedJatuhTempo}
                    </span>
                  </div>

                  {summary?.iuranWarga.dueId ? (
                    <>
                      <label className="block text-left text-xs font-semibold text-slate-600 dark:text-zinc-300">
                        Metode pembayaran
                        <select
                          value={paymentMethod}
                          onChange={(event) => setPaymentMethod(event.target.value)}
                          className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                        >
                          <option value="cash">Tunai</option>
                          <option value="bank_transfer">Transfer bank</option>
                          <option value="qris">QRIS</option>
                        </select>
                      </label>
                      <label className="block text-left text-xs font-semibold text-slate-600 dark:text-zinc-300">
                        Referensi pembayaran (opsional)
                        <input
                          value={paymentReference}
                          onChange={(event) => setPaymentReference(event.target.value)}
                          maxLength={120}
                          className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                          placeholder="Contoh: nomor bukti transfer"
                        />
                      </label>
                      <Button
                        onClick={handleAjukanPembayaran}
                        disabled={submittingPayment}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 rounded-xl shadow-xs gap-2 text-xs uppercase tracking-wider"
                      >
                        <QrCode className="h-4 w-4" />
                        <span>{submittingPayment ? "Mengirim pengajuan..." : "Ajukan Pembayaran"}</span>
                      </Button>
                    </>
                  ) : (
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      Tagihan periode ini belum diterbitkan pengurus.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2 Kartu Info Lingkungan Ramah */}
      <section id="laporan" className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5 scroll-mt-20">
        <StatCard
          badgeText="TRANSPARAN"
          title="Uang Kas RT 04 Sekarang"
          value={summary?.totalSaldoKasRT ?? mockStats.totalSaldo}
          icon={Wallet}
          variant="emerald"
          description="Terbuka untuk dipantau seluruh warga RT 04"
          subLabel="Status Kas"
          subValue="Aktif & Terbuka"
        />
        <StatCard
          badgeText="BULAN LALU"
          title={summary?.iuranTerakhirLunas?.bulan ?? "Iuran Bulan September 2026"}
          value="Sudah Lunas"
          icon={CheckCircle2}
          variant="emerald"
          isCurrency={false}
          description={summary?.iuranTerakhirLunas?.tanggalBayar
            ? `Tercatat lunas disetor ke bendahara pada ${summary.iuranTerakhirLunas.tanggalBayar}.`
            : "Tercatat lunas disetor ke bendahara pada 4 September"}
          subLabel="Bukti Setor"
          subValue={summary?.iuranTerakhirLunas?.nomorResi || "Kwitansi Sah"}
        />
      </section>

      {/* Riwayat Pembayaran Iuran Warga */}
      <Card id="riwayat" className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden scroll-mt-20">
        <CardHeader className="bg-slate-50/70 dark:bg-zinc-800/40 p-5 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-base font-extrabold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-emerald-600" />
                <span>Riwayat Iuran Keluarga Anda</span>
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Catatan setoran iuran bulanan untuk Rumah No. 14 (Pak Ahmad Fauzi)
              </CardDescription>
            </div>
            <span className="text-xs font-bold text-slate-600 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 px-3 py-1 rounded-full self-start sm:self-auto">
              Tahun 2026
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/30">
                <TableHead className="font-bold text-xs text-slate-700 dark:text-zinc-300 py-3.5">
                  Bulan
                </TableHead>
                <TableHead className="font-bold text-xs text-slate-700 dark:text-zinc-300 py-3.5">
                  Nomor Resi
                </TableHead>
                <TableHead className="font-bold text-xs text-slate-700 dark:text-zinc-300 py-3.5">
                  Tanggal Bayar
                </TableHead>
                <TableHead className="font-bold text-xs text-slate-700 dark:text-zinc-300 py-3.5">
                  Nominal
                </TableHead>
                <TableHead className="font-bold text-xs text-slate-700 dark:text-zinc-300 py-3.5 text-right pr-6">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {riwayatIuran.map((item) => {
                let formattedDate = item.tanggalBayar;
                try {
                  formattedDate = item.tanggalBayar
                    ? format(parseISO(item.tanggalBayar), "d MMMM yyyy", {
                    locale: idLocale,
                  })
                    : "—";
                } catch {
                  // fallback
                }

                return (
                  <TableRow
                    key={item.id}
                    className="border-b border-slate-100 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    <TableCell className="font-bold text-slate-900 dark:text-zinc-100 text-xs sm:text-sm py-3.5">
                      {item.bulan}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-500 dark:text-zinc-400">
                      {item.nomorResi || item.id}
                    </TableCell>
                    <TableCell className="text-slate-600 dark:text-zinc-300 text-xs">
                      {formattedDate}
                    </TableCell>
                    <TableCell className="font-black text-slate-900 dark:text-zinc-100 text-xs sm:text-sm">
                      {formatRupiah(item.nominal)}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Badge className={`text-[11px] font-bold ${
                        item.status === "Lunas"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
                          : item.status === "Menunggu Verifikasi"
                            ? "bg-blue-50 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800"
                            : "bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800"
                      }`}>
                        ✓ {item.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
