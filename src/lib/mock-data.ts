export interface StatData {
  totalSaldo: number;
  pemasukanBulanIni: number;
  pengeluaranBulanIni: number;
}

export interface Transaksi {
  id: string;
  nomorBukti: string;
  tanggal: string; // ISO format: YYYY-MM-DD
  keterangan: string;
  nominal: number;
  tipe: "Pemasukan" | "Pengeluaran";
  kategori: string;
  penanggungJawab: string;
}

export interface IuranWarga {
  bulan: string;
  tahun: string;
  status: "Lunas" | "Belum Lunas";
  jatuhTempo: string;
  nominal: number;
  rincian: {
    kebersihan: number;
    keamanan: number;
  };
  nomorBukti?: string;
  warga: {
    nama: string;
    noRumah: string;
    blok: string;
    noKK: string;
    rtRw: string;
  };
}

export interface RiwayatIuranItem {
  id: string;
  nomorResi: string;
  bulan: string;
  tanggalBayar: string;
  nominal: number;
  metode: string;
  status: "Lunas" | "Menunggu Konfirmasi" | "Belum Lunas";
}

export const mockStats: StatData = {
  totalSaldo: 5250000,
  pemasukanBulanIni: 1500000,
  pengeluaranBulanIni: 350000,
};

export const mockTransaksi: Transaksi[] = [
  {
    id: "TRX-001",
    nomorBukti: "KK-26/10-001",
    tanggal: "2026-10-09",
    keterangan: "Iuran Bulanan Warga Gang Mawar (15 Rumah)",
    nominal: 750000,
    tipe: "Pemasukan",
    kategori: "Iuran Warga",
    penanggungJawab: "Pak Bambang (Bendahara)",
  },
  {
    id: "TRX-002",
    nomorBukti: "KK-26/10-002",
    tanggal: "2026-10-07",
    keterangan: "Beli 4 Bohlam Lampu Jalan Gang 3 & Kabel",
    nominal: 180000,
    tipe: "Pengeluaran",
    kategori: "Fasilitas Umum",
    penanggungJawab: "Pak Hendra (Seksi Sarpras)",
  },
  {
    id: "TRX-003",
    nomorBukti: "KK-26/10-003",
    tanggal: "2026-10-05",
    keterangan: "Iuran Sampah & Ronda Gang Melati (10 Rumah)",
    nominal: 500000,
    tipe: "Pemasukan",
    kategori: "Iuran Warga",
    penanggungJawab: "Pak Bambang (Bendahara)",
  },
  {
    id: "TRX-004",
    nomorBukti: "KK-26/10-004",
    tanggal: "2026-10-03",
    keterangan: "Beli Gorengan & Kopi Kerja Bakti Bersihin Selokan",
    nominal: 170000,
    tipe: "Pengeluaran",
    kategori: "Kegiatan Warga",
    penanggungJawab: "Pak RT Agus Salim",
  },
  {
    id: "TRX-005",
    nomorBukti: "KK-26/10-005",
    tanggal: "2026-10-01",
    keterangan: "Sumbangan Sukarela Warga No. 12 Buat Pos Kamling",
    nominal: 250000,
    tipe: "Pemasukan",
    kategori: "Donasi Warga",
    penanggungJawab: "Pak Bambang (Bendahara)",
  },
];

export const mockIuranWarga: IuranWarga = {
  bulan: "Oktober 2026",
  tahun: "2026",
  status: "Lunas",
  jatuhTempo: "2026-10-31",
  nominal: 50000,
  rincian: {
    kebersihan: 25000,
    keamanan: 25000,
  },
  nomorBukti: "KASKITA-RT04-202610-014",
  warga: {
    nama: "Pak Ahmad Fauzi",
    noRumah: "Rumah No. 14",
    blok: "Gang Cempaka",
    noKK: "3271040801980004",
    rtRw: "RT 04 / RW 08",
  },
};

export const mockRiwayatIuran: RiwayatIuranItem[] = [
  {
    id: "RI-001",
    nomorResi: "KASKITA-202610-014",
    bulan: "Oktober 2026",
    tanggalBayar: "2026-10-02",
    nominal: 50000,
    metode: "QRIS KasKita",
    status: "Lunas",
  },
  {
    id: "RI-002",
    nomorResi: "KASKITA-202609-014",
    bulan: "September 2026",
    tanggalBayar: "2026-09-04",
    nominal: 50000,
    metode: "Tunai ke Bendahara",
    status: "Lunas",
  },
  {
    id: "RI-003",
    nomorResi: "KASKITA-202608-014",
    bulan: "Agustus 2026",
    tanggalBayar: "2026-08-01",
    nominal: 50000,
    metode: "Transfer Bank",
    status: "Lunas",
  },
  {
    id: "RI-004",
    nomorResi: "KASKITA-202607-014",
    bulan: "Juli 2026",
    tanggalBayar: "2026-07-05",
    nominal: 50000,
    metode: "Tunai ke Bendahara",
    status: "Lunas",
  },
];

export function formatRupiah(nominal: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(nominal);
}
