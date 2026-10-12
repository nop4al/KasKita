// src/lib/kas.ts

export type JenisTransaksi = "Pemasukan" | "Pengeluaran";

export type DetailIuran = {
  namaWarga: string;
  blok: string;
  nominal: number;
};

export type Transaksi = {
  id: string;
  jenis: JenisTransaksi;
  tanggal: string;
  kategori: string;
  nominal: number;
  keterangan: string;
  detailIuran?: DetailIuran[];
  isSaldoAwal?: boolean;
};

const STORAGE_KEY = "kaskita-transaksi";

// --- DATA AWAL ---
export const DATA_AWAL: Transaksi[] = [
  {
    id: "trx-000",
    jenis: "Pemasukan",
    tanggal: "2026-09-30",
    kategori: "Saldo Awal",
    nominal: 4100000,
    keterangan: "Saldo awal kas RT periode sebelumnya",
    isSaldoAwal: true,
  },
  {
    id: "trx-001",
    jenis: "Pemasukan",
    tanggal: "2026-10-09",
    kategori: "Iuran Warga",
    nominal: 750000,
    keterangan: "Iuran Bulanan Warga Gang Mawar (15 Rumah)",
    detailIuran: [
      { namaWarga: "Pak Budi", blok: "Gang Mawar No. 1", nominal: 50000 },
      { namaWarga: "Bu Ani", blok: "Gang Mawar No. 2", nominal: 50000 },
      { namaWarga: "Pak Candra", blok: "Gang Mawar No. 3", nominal: 50000 },
      { namaWarga: "Bu Dewi", blok: "Gang Mawar No. 4", nominal: 50000 },
      { namaWarga: "Pak Eko", blok: "Gang Mawar No. 5", nominal: 50000 },
      { namaWarga: "Bu Fitri", blok: "Gang Mawar No. 6", nominal: 50000 },
      { namaWarga: "Pak Gunawan", blok: "Gang Mawar No. 7", nominal: 50000 },
      { namaWarga: "Bu Hesti", blok: "Gang Mawar No. 8", nominal: 50000 },
      { namaWarga: "Pak Irfan", blok: "Gang Mawar No. 9", nominal: 50000 },
      { namaWarga: "Bu Joko", blok: "Gang Mawar No. 10", nominal: 50000 },
      { namaWarga: "Pak Kurnia", blok: "Gang Mawar No. 11", nominal: 50000 },
      { namaWarga: "Bu Lestari", blok: "Gang Mawar No. 12", nominal: 50000 },
      { namaWarga: "Pak Marno", blok: "Gang Mawar No. 13", nominal: 50000 },
      { namaWarga: "Bu Ningsih", blok: "Gang Mawar No. 14", nominal: 50000 },
      { namaWarga: "Pak Oki", blok: "Gang Mawar No. 15", nominal: 50000 },
    ],
  },
  {
    id: "trx-002",
    jenis: "Pengeluaran",
    tanggal: "2026-10-07",
    kategori: "Fasilitas Umum",
    nominal: 180000,
    keterangan: "Beli 4 Bohlam Lampu Jalan Gang 3 & Kabel",
  },
  {
    id: "trx-003",
    jenis: "Pemasukan",
    tanggal: "2026-10-05",
    kategori: "Iuran Warga",
    nominal: 500000,
    keterangan: "Iuran Sampah & Ronda Gang Melati (10 Rumah)",
    detailIuran: [
      { namaWarga: "Pak Andi", blok: "Gang Melati No. 1", nominal: 50000 },
      { namaWarga: "Bu Bella", blok: "Gang Melati No. 2", nominal: 50000 },
      { namaWarga: "Pak Coki", blok: "Gang Melati No. 3", nominal: 50000 },
      { namaWarga: "Bu Dian", blok: "Gang Melati No. 4", nominal: 50000 },
      { namaWarga: "Pak Erwin", blok: "Gang Melati No. 5", nominal: 50000 },
      { namaWarga: "Bu Fani", blok: "Gang Melati No. 6", nominal: 50000 },
      { namaWarga: "Pak Gilang", blok: "Gang Melati No. 7", nominal: 50000 },
      { namaWarga: "Bu Hana", blok: "Gang Melati No. 8", nominal: 50000 },
      { namaWarga: "Pak Indra", blok: "Gang Melati No. 9", nominal: 50000 },
      { namaWarga: "Bu Jihan", blok: "Gang Melati No. 10", nominal: 50000 },
    ],
  },
  {
    id: "trx-004",
    jenis: "Pengeluaran",
    tanggal: "2026-10-03",
    kategori: "Kegiatan Warga",
    nominal: 170000,
    keterangan: "Beli Gorengan & Kopi Kerja Bakti Bersihin Selokan",
  },
  {
    id: "trx-005",
    jenis: "Pemasukan",
    tanggal: "2026-10-01",
    kategori: "Donasi Warga",
    nominal: 250000,
    keterangan: "Sumbangan Sukarela Warga No. 12 Buat Pos Kamling",
  },
];

export function bacaTransaksi(): Transaksi[] {
  if (typeof window === "undefined") return DATA_AWAL;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? (JSON.parse(data) as Transaksi[]) : DATA_AWAL;
  } catch {
    return DATA_AWAL;
  }
}

export function simpanTransaksi(data: Transaksi[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  window.dispatchEvent(new Event("kaskita-update"));
}

export function formatRupiah(nominal: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(nominal);
}

export function hitungKeuangan(data: Transaksi[]) {
  const pemasukan = data
    .filter((item) => item.jenis === "Pemasukan")
    .reduce((total, item) => total + item.nominal, 0);

  const pengeluaran = data
    .filter((item) => item.jenis === "Pengeluaran")
    .reduce((total, item) => total + item.nominal, 0);

  return {
    pemasukan,
    pengeluaran,
    saldo: pemasukan - pengeluaran,
  };
}