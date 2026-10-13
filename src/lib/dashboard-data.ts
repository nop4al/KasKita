import type { Database } from "@/lib/supabase/database.types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type TransactionRow = Database["public"]["Tables"]["ledger_transactions"]["Row"];
type DueRow = Database["public"]["Tables"]["dues"]["Row"];

export interface Transaksi {
  id: string;
  nomorBukti: string;
  tanggal: string;
  keterangan: string;
  nominal: number;
  tipe: "Pemasukan" | "Pengeluaran";
  kategori: string;
  penanggungJawab: string;
}

export interface RiwayatIuranItem {
  id: string;
  nomorResi: string;
  bulan: string;
  tanggalBayar: string;
  nominal: number;
  metode: string;
  status: "Lunas" | "Menunggu Verifikasi" | "Belum Lunas";
}

export interface DashboardSummary {
  totalSaldo: number;
  pemasukanBulanIni: number;
  pengeluaranBulanIni: number;
  totalWarga: number;
  wargaAktif: number;
  wargaPending: number;
  iuranLunas: number;
  iuranMenungguVerifikasi: number;
  iuranBelumLunas: number;
  totalWargaAktif: number;
  bulan: string;
  tahun: string;
  transaksi: Transaksi[];
}

export interface WargaDashboardSummary {
  totalSaldoKasRT: number;
  statusIuranBulanIni: "Lunas" | "Menunggu Verifikasi" | "Belum Lunas";
  bulanIni: string;
  tahun: string;
  nominalIuran: number;
  jatuhTempo: string;
  iuranWarga: {
    bulan: string;
    tahun: string;
    status: "Lunas" | "Menunggu Verifikasi" | "Belum Lunas";
    dueId: string | null;
    jatuhTempo: string;
    nominal: number;
    rincian: { kebersihan: number; keamanan: number };
    nomorBukti: string;
    metodePembayaran: string | null;
    referensiPembayaran: string | null;
    diajukanPada: string | null;
    warga: {
      nama: string;
      noRumah: string;
      blok: string;
      noKK: string;
      rtRw: string;
    };
  };
  riwayatIuran: RiwayatIuranItem[];
  iuranTerakhirLunas: RiwayatIuranItem | null;
}

function toTransaction(row: TransactionRow): Transaksi {
  return {
    id: row.id,
    nomorBukti: row.receipt_number,
    tanggal: row.transaction_date,
    keterangan: row.description,
    nominal: row.amount,
    tipe: row.type === "income" ? "Pemasukan" : "Pengeluaran",
    kategori: row.category,
    penanggungJawab: row.person_in_charge,
  };
}

function periodLabel(period: string): string {
  const [year, month] = period.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });
}

function dueDateFor(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function mapDue(row: DueRow): RiwayatIuranItem {
  return {
    id: row.id,
    nomorResi: row.receipt_number ?? "",
    bulan: periodLabel(row.period),
    tanggalBayar: row.paid_at?.slice(0, 10) ?? "",
    nominal: row.amount,
    metode: row.payment_method ?? "-",
    status: row.status === "paid"
      ? "Lunas"
      : row.status === "awaiting_verification"
        ? "Menunggu Verifikasi"
        : "Belum Lunas",
  };
}

export async function getAdminDashboardSummary(): Promise<DashboardSummary> {
  const supabase = await createSupabaseServerClient();
  const [totalsResult, profilesResult, duesResult, transactionsResult] =
    await Promise.all([
      supabase.from("ledger_summary").select("*").single(),
      supabase.from("profiles").select("status").eq("role", "warga"),
      supabase.from("dues").select("status").eq("period", new Date().toISOString().slice(0, 7) + "-01"),
      supabase
        .from("ledger_transactions")
        .select("*")
        .order("transaction_date", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  if (totalsResult.error) throw totalsResult.error;
  if (profilesResult.error) throw profilesResult.error;
  if (duesResult.error) throw duesResult.error;
  if (transactionsResult.error) throw transactionsResult.error;

  const profiles = profilesResult.data;
  const activeCount = profiles.filter((profile) => profile.status === "active").length;
  const paidCount = duesResult.data.filter((due) => due.status === "paid").length;
  const waitingCount = duesResult.data.filter((due) => due.status === "awaiting_verification").length;
  const now = new Date();
  return {
    totalSaldo: totalsResult.data.balance,
    pemasukanBulanIni: totalsResult.data.month_income,
    pengeluaranBulanIni: totalsResult.data.month_expense,
    totalWarga: profiles.length,
    wargaAktif: activeCount,
    wargaPending: profiles.length - activeCount,
    iuranLunas: paidCount,
    iuranMenungguVerifikasi: waitingCount,
    iuranBelumLunas: Math.max(activeCount - paidCount - waitingCount, 0),
    totalWargaAktif: activeCount,
    bulan: now.toLocaleDateString("id-ID", { month: "long" }),
    tahun: String(now.getFullYear()),
    transaksi: transactionsResult.data.map(toTransaction),
  };
}

export async function getWargaDashboardSummary(
  userId: string
): Promise<WargaDashboardSummary> {
  const supabase = await createSupabaseServerClient();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const currentPeriod = `${year}-${String(month).padStart(2, "0")}-01`;

  const [profileResult, settingsResult, currentDueResult, duesResult, totalsResult] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).single(),
      supabase.from("app_settings").select("*").eq("id", 1).single(),
      supabase
        .from("dues")
        .select("*")
        .eq("user_id", userId)
        .eq("period", currentPeriod)
        .maybeSingle(),
      supabase
        .from("dues")
        .select("*")
        .eq("user_id", userId)
        .order("period", { ascending: false })
        .limit(12),
      supabase.from("ledger_summary").select("balance").single(),
    ]);

  if (profileResult.error) throw profileResult.error;
  if (settingsResult.error) throw settingsResult.error;
  if (currentDueResult.error) throw currentDueResult.error;
  if (duesResult.error) throw duesResult.error;
  if (totalsResult.error) throw totalsResult.error;

  const currentDue = currentDueResult.data;
  const settings = settingsResult.data;
  const monthLabel = periodLabel(currentPeriod);
  const dueDate = currentDue?.due_date ??
    dueDateFor(year, month, settings.due_day);
  const history = duesResult.data.map(mapDue);
  const paidHistory = history.find((item) => item.status === "Lunas") ?? null;
  const currentStatus = currentDue?.status === "paid"
    ? "Lunas"
    : currentDue?.status === "awaiting_verification"
      ? "Menunggu Verifikasi"
      : "Belum Lunas";

  return {
    totalSaldoKasRT: totalsResult.data.balance,
    statusIuranBulanIni: currentStatus,
    bulanIni: monthLabel,
    tahun: String(year),
    nominalIuran: currentDue?.amount ?? settings.monthly_dues,
    jatuhTempo: dueDate,
    iuranWarga: {
      bulan: monthLabel,
      tahun: String(year),
      status: currentStatus,
      dueId: currentDue?.id ?? null,
      jatuhTempo: dueDate,
      nominal: currentDue?.amount ?? settings.monthly_dues,
      rincian: {
        kebersihan: currentDue?.cleaning_fee ?? settings.cleaning_fee,
        keamanan: currentDue?.security_fee ?? settings.security_fee,
      },
      nomorBukti: currentDue?.receipt_number ?? "",
      metodePembayaran: currentDue?.payment_method ?? null,
      referensiPembayaran: currentDue?.payment_reference ?? null,
      diajukanPada: currentDue?.payment_submitted_at ?? null,
      warga: {
        nama: profileResult.data.nama,
        noRumah: profileResult.data.no_rumah ?? "-",
        blok: profileResult.data.blok ?? "-",
        noKK: "",
        rtRw: "RT 04 / RW 08",
      },
    },
    riwayatIuran: history,
    iuranTerakhirLunas: paidHistory,
  };
}
