// src/app/dashboard/laporan-keuangan/page.tsx
"use client";

import { useEffect, useState } from "react";
import {
  bacaTransaksi,
  simpanTransaksi,
  formatRupiah,
  hitungKeuangan,
  DATA_AWAL,
  type Transaksi,
} from "@/lib/kas";

function tanggalHariIni() {
  const sekarang = new Date();
  const lokal = new Date(
    sekarang.getTime() - sekarang.getTimezoneOffset() * 60000
  );
  return lokal.toISOString().slice(0, 10);
}

export default function LaporanKeuanganPage() {
  const [data, setData] = useState<Transaksi[]>([]);
  const [siap, setSiap] = useState(false);
  const [filterJenis, setFilterJenis] = useState<"Semua" | "Pemasukan" | "Pengeluaran">("Semua");
  const [filterBulan, setFilterBulan] = useState<string>("Semua");
  const [transaksiTerpilih, setTransaksiTerpilih] = useState<Transaksi | null>(null);

  // State untuk form pengeluaran
  const [tampilForm, setTampilForm] = useState(false);
  const [tglKeluar, setTglKeluar] = useState(tanggalHariIni());
  const [katKeluar, setKatKeluar] = useState("Fasilitas Umum");
  const [nomKeluar, setNomKeluar] = useState("");
  const [ketKeluar, setKetKeluar] = useState("");

  useEffect(() => {
    const dataDariStorage = bacaTransaksi();
    if (dataDariStorage.length === 0) {
      setData(DATA_AWAL);
    } else {
      setData(dataDariStorage);
    }
    setSiap(true);

    const perbarui = () => setData(bacaTransaksi());
    window.addEventListener("kaskita-update", perbarui);
    window.addEventListener("storage", perbarui);

    return () => {
      window.removeEventListener("kaskita-update", perbarui);
      window.removeEventListener("storage", perbarui);
    };
  }, []);

  function tambahPengeluaran(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const angka = Number(nomKeluar);

    if (!tglKeluar || !katKeluar || !Number.isFinite(angka) || angka <= 0) {
      alert("Periksa kembali tanggal, kategori, dan nominal pengeluaran.");
      return;
    }

    const transaksiBaru: Transaksi = {
      id: crypto.randomUUID(),
      jenis: "Pengeluaran",
      tanggal: tglKeluar,
      kategori: katKeluar,
      nominal: angka,
      keterangan: ketKeluar.trim(),
    };

    const dataBaru = [transaksiBaru, ...data];
    simpanTransaksi(dataBaru);
    setData(dataBaru);
    setNomKeluar("");
    setKetKeluar("");
    setTampilForm(false);
    alert("Pengeluaran berhasil dicatat.");
  }

  function hapusTransaksi(id: string) {
    if (!confirm("Yakin ingin menghapus transaksi ini?")) return;
    const dataBaru = data.filter((item) => item.id !== id);
    simpanTransaksi(dataBaru);
    setData(dataBaru);
  }

  const ringkasan = hitungKeuangan(data);

  const daftarBulan = Array.from(
    new Set(data.map((item) => item.tanggal.slice(0, 7)))
  )
    .sort()
    .reverse();

  const dataTampil = data.filter((item) => {
    const cocokJenis = filterJenis === "Semua" || item.jenis === filterJenis;
    const cocokBulan =
      filterBulan === "Semua" || item.tanggal.startsWith(filterBulan);
    return cocokJenis && cocokBulan;
  });

  const totalTampil = hitungKeuangan(dataTampil);

  function formatNamaBulan(yyyyMM: string) {
    const [tahun, bulan] = yyyyMM.split("-");
    const namaBulan = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];
    return `${namaBulan[parseInt(bulan) - 1]} ${tahun}`;
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-800 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* HEADER */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600">
              KasKita / Dashboard
            </p>
            <h1 className="mt-2 text-3xl font-bold">Laporan Keuangan</h1>
            <p className="mt-2 text-sm text-slate-500">
              Rekap seluruh pemasukan dan pengeluaran kas RT.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setTampilForm(!tampilForm)}
              className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-red-700"
            >
              {tampilForm ? "✕ Tutup Form" : "+ Catat Pengeluaran"}
            </button>
            <button
              onClick={() => window.print()}
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              🖨️ Cetak
            </button>
          </div>
        </header>

        {/* FORM PENGELUARAN */}
        {tampilForm && (
          <section className="rounded-2xl border-2 border-red-200 bg-red-50 p-5">
            <h2 className="text-lg font-bold text-red-800">
              Catat Pengeluaran Baru
            </h2>
            <form onSubmit={tambahPengeluaran} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium">
                  Tanggal
                  <input
                    type="date"
                    required
                    value={tglKeluar}
                    onChange={(e) => setTglKeluar(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-red-500"
                  />
                </label>
                <label className="text-sm font-medium">
                  Kategori
                  <select
                    value={katKeluar}
                    onChange={(e) => setKatKeluar(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-red-500"
                  >
                    <option value="Fasilitas Umum">Fasilitas Umum</option>
                    <option value="Kebersihan">Kebersihan</option>
                    <option value="Keamanan">Keamanan</option>
                    <option value="Perawatan">Perawatan</option>
                    <option value="Kegiatan Warga">Kegiatan Warga</option>
                    <option value="Operasional">Operasional</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </label>
                <label className="text-sm font-medium sm:col-span-2">
                  Nominal (Rp)
                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={nomKeluar}
                    onChange={(e) => setNomKeluar(e.target.value)}
                    placeholder="Contoh: 180000"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-red-500"
                  />
                </label>
                <label className="text-sm font-medium sm:col-span-2">
                  Keterangan
                  <input
                    type="text"
                    value={ketKeluar}
                    onChange={(e) => setKetKeluar(e.target.value)}
                    placeholder="Contoh: Beli lampu jalan gang 3"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-red-500"
                  />
                </label>
              </div>
              <button
                type="submit"
                className="w-full rounded-xl bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700 sm:w-auto"
              >
                + Simpan Pengeluaran
              </button>
            </form>
          </section>
        )}

        {/* FILTER */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <label className="flex-1 text-sm font-medium">
              Periode Bulan
              <select
                value={filterBulan}
                onChange={(e) => setFilterBulan(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500"
              >
                <option value="Semua">Semua Periode</option>
                {daftarBulan.map((bulan) => (
                  <option key={bulan} value={bulan}>
                    {formatNamaBulan(bulan)}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex-1 text-sm font-medium">
              Jenis Transaksi
              <select
                value={filterJenis}
                onChange={(e) =>
                  setFilterJenis(e.target.value as "Semua" | "Pemasukan" | "Pengeluaran")
                }
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500"
              >
                <option value="Semua">Semua Jenis</option>
                <option value="Pemasukan">Pemasukan</option>
                <option value="Pengeluaran">Pengeluaran</option>
              </select>
            </label>
          </div>
        </section>

        {/* KARTU RINGKASAN */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border bg-white p-5">
            <p className="text-sm text-slate-500">Total Pemasukan</p>
            <p className="mt-3 break-words text-2xl font-bold text-emerald-600">
              {formatRupiah(ringkasan.pemasukan)}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {data.filter((d) => d.jenis === "Pemasukan").length} transaksi
            </p>
          </div>
          <div className="rounded-2xl border bg-white p-5">
            <p className="text-sm text-slate-500">Total Pengeluaran</p>
            <p className="mt-3 break-words text-2xl font-bold text-red-600">
              {formatRupiah(ringkasan.pengeluaran)}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {data.filter((d) => d.jenis === "Pengeluaran").length} transaksi
            </p>
          </div>
          <div className="rounded-2xl border bg-white p-5">
            <p className="text-sm text-slate-500">Saldo Akhir</p>
            <p className="mt-3 break-words text-2xl font-bold text-blue-600">
              {formatRupiah(ringkasan.saldo)}
            </p>
            <p className="mt-1 text-xs text-slate-400">Saldo saat ini</p>
          </div>
        </section>

        {/* RINGKASAN PERIODE TERFILTER */}
        {(filterBulan !== "Semua" || filterJenis !== "Semua") && (
          <section className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
            <h3 className="text-sm font-bold text-blue-800">
              Ringkasan Periode Terpilih
            </h3>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <p className="text-xs text-blue-600">Pemasukan</p>
                <p className="text-lg font-bold text-emerald-700">
                  {formatRupiah(totalTampil.pemasukan)}
                </p>
              </div>
              <div>
                <p className="text-xs text-blue-600">Pengeluaran</p>
                <p className="text-lg font-bold text-red-700">
                  {formatRupiah(totalTampil.pengeluaran)}
                </p>
              </div>
              <div>
                <p className="text-xs text-blue-600">Selisih</p>
                <p className="text-lg font-bold text-blue-700">
                  {formatRupiah(totalTampil.saldo)}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* TABEL LAPORAN */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 p-5">
            <h2 className="text-lg font-bold">Rincian Transaksi</h2>
            <p className="mt-1 text-sm text-slate-500">
              {dataTampil.length} transaksi ditemukan
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-162.5 text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-4">Tanggal</th>
                  <th className="px-5 py-4">Jenis</th>
                  <th className="px-5 py-4">Kategori / Keterangan</th>
                  <th className="px-5 py-4">Nominal</th>
                  <th className="px-5 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dataTampil.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap px-5 py-4">
                      {item.tanggal}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          item.jenis === "Pemasukan"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {item.jenis}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold">{item.kategori}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {item.keterangan || "-"}
                      </p>
                      {item.detailIuran && item.detailIuran.length > 0 && (
                        <p className="mt-1 text-xs text-blue-500">
                          {item.detailIuran.length} warga
                        </p>
                      )}
                    </td>
                    <td
                      className={`whitespace-nowrap px-5 py-4 font-semibold ${
                        item.jenis === "Pemasukan"
                          ? "text-emerald-600"
                          : "text-red-600"
                      }`}
                    >
                      {item.jenis === "Pemasukan" ? "+" : "-"}
                      {formatRupiah(item.nominal)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {item.detailIuran && item.detailIuran.length > 0 && (
                          <button
                            onClick={() => setTransaksiTerpilih(item)}
                            className="rounded-lg border border-blue-100 px-3 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50"
                          >
                            Detail
                          </button>
                        )}
                        <button
                          onClick={() => hapusTransaksi(item.id)}
                          className="rounded-lg border border-red-100 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {siap && dataTampil.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-12 text-center text-slate-500"
                    >
                      Belum ada transaksi pada periode ini.
                    </td>
                  </tr>
                )}
              </tbody>
              {dataTampil.length > 0 && (
                <tfoot className="border-t-2 border-slate-200 bg-slate-50">
                  <tr>
                    <td colSpan={3} className="px-5 py-4 text-right font-bold">
                      Total Pemasukan
                    </td>
                    <td className="px-5 py-4 font-bold text-emerald-600">
                      {formatRupiah(totalTampil.pemasukan)}
                    </td>
                    <td></td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="px-5 py-4 text-right font-bold">
                      Total Pengeluaran
                    </td>
                    <td className="px-5 py-4 font-bold text-red-600">
                      {formatRupiah(totalTampil.pengeluaran)}
                    </td>
                    <td></td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="px-5 py-4 text-right font-bold">
                      Selisih
                    </td>
                    <td className="px-5 py-4 font-bold text-blue-600">
                      {formatRupiah(totalTampil.saldo)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </section>
      </div>

      {/* MODAL DETAIL IURAN */}
      {transaksiTerpilih && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Detail Iuran Warga</h3>
              <button
                onClick={() => setTransaksiTerpilih(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              {transaksiTerpilih.keterangan} — {transaksiTerpilih.tanggal}
            </p>

            <div className="mt-4 max-h-80 overflow-y-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Nama Warga</th>
                    <th className="px-3 py-2">Blok</th>
                    <th className="px-3 py-2 text-right">Nominal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transaksiTerpilih.detailIuran?.map((detail, idx) => (
                    <tr key={idx}>
                      <td className="px-3 py-2 font-medium">
                        {detail.namaWarga}
                      </td>
                      <td className="px-3 py-2 text-slate-500">
                        {detail.blok || "-"}
                      </td>
                      <td className="px-3 py-2 text-right font-semibold text-emerald-600">
                        {formatRupiah(detail.nominal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t border-slate-200">
                  <tr>
                    <td colSpan={2} className="px-3 py-2 font-bold">
                      Total
                    </td>
                    <td className="px-3 py-2 text-right font-bold text-emerald-700">
                      {formatRupiah(transaksiTerpilih.nominal)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <button
              onClick={() => setTransaksiTerpilih(null)}
              className="mt-4 w-full rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </main>
  );
}