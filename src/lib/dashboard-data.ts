/**
 * dashboard-data.ts — Dashboard summary data service for KasKita
 *
 * Provides API functions to compute dashboard metrics like
 * total saldo, pemasukan/pengeluaran bulan ini, and total warga.
 */

import { getWargaCount } from "./auth";

// ── Types ──────────────────────────────────────────────────────────
export interface DashboardSummary {
  totalSaldo: number;
  pemasukanBulanIni: number;
  pengeluaranBulanIni: number;
  totalWarga: number;
  wargaAktif: number;
  wargaPending: number;
  iuranLunas: number;
  iuranBelumLunas: number;
  totalRumah: number;
  bulan: string;
  tahun: string;
}

export interface WargaDashboardSummary {
  totalSaldoKasRT: number;
  statusIuranBulanIni: "Lunas" | "Belum Lunas";
  bulanIni: string;
  tahun: string;
  nominalIuran: number;
  jatuhTempo: string;
}

// ── In-memory transaction ledger (simplified) ──────────────────────
interface LedgerEntry {
  id: string;
  tanggal: string;
  tipe: "Pemasukan" | "Pengeluaran";
  nominal: number;
  keterangan: string;
  kategori: string;
}

const ledger: LedgerEntry[] = [
  {
    id: "TRX-001",
    tanggal: "2026-10-09",
    tipe: "Pemasukan",
    nominal: 750000,
    keterangan: "Iuran Bulanan Warga Gang Mawar (15 Rumah)",
    kategori: "Iuran Warga",
  },
  {
    id: "TRX-002",
    tanggal: "2026-10-07",
    tipe: "Pengeluaran",
    nominal: 180000,
    keterangan: "Beli 4 Bohlam Lampu Jalan Gang 3 & Kabel",
    kategori: "Fasilitas Umum",
  },
  {
    id: "TRX-003",
    tanggal: "2026-10-05",
    tipe: "Pemasukan",
    nominal: 500000,
    keterangan: "Iuran Sampah & Ronda Gang Melati (10 Rumah)",
    kategori: "Iuran Warga",
  },
  {
    id: "TRX-004",
    tanggal: "2026-10-03",
    tipe: "Pengeluaran",
    nominal: 170000,
    keterangan: "Beli Gorengan & Kopi Kerja Bakti Bersihin Selokan",
    kategori: "Kegiatan Warga",
  },
  {
    id: "TRX-005",
    tanggal: "2026-10-01",
    tipe: "Pemasukan",
    nominal: 250000,
    keterangan: "Sumbangan Sukarela Warga No. 12 Buat Pos Kamling",
    kategori: "Donasi Warga",
  },
];

// Baseline saldo from months before
const BASE_SALDO = 3900000;

// ── Public API ─────────────────────────────────────────────────────

/**
 * Get dashboard summary (admin-level).
 */
export function getAdminDashboardSummary(): DashboardSummary {
  const now = new Date();
  const bulanStr = now.toLocaleDateString("id-ID", { month: "long" });
  const tahun = now.getFullYear().toString();

  // Compute October 2026 totals
  let pemasukanBulanIni = 0;
  let pengeluaranBulanIni = 0;

  for (const entry of ledger) {
    if (entry.tanggal.startsWith("2026-10")) {
      if (entry.tipe === "Pemasukan") pemasukanBulanIni += entry.nominal;
      else pengeluaranBulanIni += entry.nominal;
    }
  }

  const totalSaldo = BASE_SALDO + pemasukanBulanIni - pengeluaranBulanIni;
  const wargaCount = getWargaCount();

  return {
    totalSaldo,
    pemasukanBulanIni,
    pengeluaranBulanIni,
    totalWarga: wargaCount.total,
    wargaAktif: wargaCount.active,
    wargaPending: wargaCount.pending,
    iuranLunas: 48,
    iuranBelumLunas: 16,
    totalRumah: 64,
    bulan: bulanStr,
    tahun,
  };
}

/**
 * Get warga dashboard summary (warga-level).
 */
export function getWargaDashboardSummary(userId: string): WargaDashboardSummary {
  const now = new Date();
  const bulanStr = now.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
  const tahun = now.getFullYear().toString();

  // Simulate: userId "warga-001" (Ahmad Fauzi) is lunas, others may vary
  const isLunas = userId === "warga-001";

  // Compute total kas from ledger
  let totalPemasukan = 0;
  let totalPengeluaran = 0;
  for (const entry of ledger) {
    if (entry.tipe === "Pemasukan") totalPemasukan += entry.nominal;
    else totalPengeluaran += entry.nominal;
  }
  const totalSaldo = BASE_SALDO + totalPemasukan - totalPengeluaran;

  return {
    totalSaldoKasRT: totalSaldo,
    statusIuranBulanIni: isLunas ? "Lunas" : "Belum Lunas",
    bulanIni: bulanStr,
    tahun,
    nominalIuran: 50000,
    jatuhTempo: `${tahun}-10-31`,
  };
}
