// src/app/dashboard/warga/transparansi/page.tsx
"use client";

import { useEffect, useState } from "react";
import {
  bacaTransaksi,
  formatRupiah,
  hitungKeuangan,
  type Transaksi,
} from "@/lib/kas";

export default function TransparansiKasPage() {
  const [data, setData] = useState<Transaksi[]>([]);
  const [siap, setSiap] = useState(false);
  const [filterJenis, setFilterJenis] = useState<
    "Semua" | "Pemasukan" | "Pengeluaran"
  >("Semua");

  useEffect(() => {
    setData(bacaTransaksi());
    setSiap(true);

    const perbarui = () => setData(bacaTransaksi());
    window.addEventListener("kaskita-update", perbarui);
    window.addEventListener("storage", perbarui);

    return () => {
      window.removeEventListener("kaskita-update", perbarui);
      window.removeEventListener("storage", perbarui);
    };
  }, []);

  const ringkasan = hitungKeuangan(data);

  // Sembunyikan saldo awal dari warga agar tidak membingungkan
  const dataTransparan = data.filter((item) => !item.isSaldoAwal);

  const dataTampil = dataTransparan.filter(
    (item) => filterJenis === "Semua" || item.jenis === filterJenis
  );

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-800 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* HEADER */}
        <header>
          <p className="text-sm font-medium text-blue-600">
            KasKita / Portal Warga
          </p>
          <h1 className="mt-2 text-3xl font-bold">Transparansi Kas RT</h1>
          <p className="mt-2 text-sm text-slate-500">
            Lihat bagaimana uang kas RT kamu digunakan secara terbuka.
          </p>
        </header>

        {/* KARTU RINGKASAN */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border bg-white p-5">
            <p className="text-sm text-slate-500">Total Pemasukan</p>
            <p className="mt-3 break-words text-2xl font-bold text-emerald-600">
              {formatRupiah(ringkasan.pemasukan)}
            </p>
          </div>
          <div className="rounded-2xl border bg-white p-5">
            <p className="text-sm text-slate-500">Total Pengeluaran</p>
            <p className="mt-3 break-words text-2xl font-bold text-red-600">
              {formatRupiah(ringkasan.pengeluaran)}
            </p>
          </div>
          <div className="rounded-2xl border bg-white p-5">
            <p className="text-sm text-slate-500">Saldo Kas Saat Ini</p>
            <p className="mt-3 break-words text-2xl font-bold text-blue-600">
              {formatRupiah(ringkasan.saldo)}
            </p>
          </div>
        </section>

        {/* INFO TRANSPARANSI */}
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <p className="text-sm text-emerald-800">
            💡 <strong>Transparansi:</strong> Semua pemasukan dan pengeluaran
            kas RT ditampilkan secara terbuka. Untuk melihat rincian iuran
            kamu, buka halaman <strong>Riwayat Pembayaran</strong>.
          </p>
        </section>

        {/* FILTER */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <label className="text-sm font-medium">
            Filter Jenis Transaksi
            <select
              value={filterJenis}
              onChange={(e) =>
                setFilterJenis(
                  e.target.value as "Semua" | "Pemasukan" | "Pengeluaran"
                )
              }
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500 sm:w-64"
            >
              <option value="Semua">Semua Jenis</option>
              <option value="Pemasukan">Pemasukan</option>
              <option value="Pengeluaran">Pengeluaran</option>
            </select>
          </label>
        </section>

        {/* TABEL TRANSPARANSI (TANPA TOMBOL DETAIL) */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 p-5">
            <h2 className="text-lg font-bold">Rincian Arus Kas RT</h2>
            <p className="mt-1 text-sm text-slate-500">
              {dataTampil.length} transaksi ditampilkan
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-150 text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-4">Tanggal</th>
                  <th className="px-5 py-4">Jenis</th>
                  <th className="px-5 py-4">Kategori / Keterangan</th>
                  <th className="px-5 py-4 text-right">Nominal</th>
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
                      className={`whitespace-nowrap px-5 py-4 text-right font-semibold ${
                        item.jenis === "Pemasukan"
                          ? "text-emerald-600"
                          : "text-red-600"
                      }`}
                    >
                      {item.jenis === "Pemasukan" ? "+" : "-"}
                      {formatRupiah(item.nominal)}
                    </td>
                  </tr>
                ))}
                {siap && dataTampil.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-5 py-12 text-center text-slate-500"
                    >
                      Belum ada transaksi.
                    </td>
                  </tr>
                )}
              </tbody>
              {dataTampil.length > 0 && (
                <tfoot className="border-t-2 border-slate-200 bg-slate-50">
                  <tr>
                    <td
                      colSpan={3}
                      className="px-5 py-4 text-right font-bold text-slate-700"
                    >
                      Total Pemasukan
                    </td>
                    <td className="px-5 py-4 text-right font-bold text-emerald-600">
                      {formatRupiah(hitungKeuangan(dataTampil).pemasukan)}
                    </td>
                  </tr>
                  <tr>
                    <td
                      colSpan={3}
                      className="px-5 py-4 text-right font-bold text-slate-700"
                    >
                      Total Pengeluaran
                    </td>
                    <td className="px-5 py-4 text-right font-bold text-red-600">
                      {formatRupiah(hitungKeuangan(dataTampil).pengeluaran)}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}