// src/app/dashboard/warga/riwayat/page.tsx
"use client";

import { useEffect, useState } from "react";
import {
  bacaTransaksi,
  formatRupiah,
  type Transaksi,
  type DetailIuran,
} from "@/lib/kas";

// Ganti nama ini sesuai warga yang login (nanti bisa dari sistem auth)
const NAMA_WARGA_LOGIN = "Pak Budi";

export default function RiwayatPembayaranPage() {
  const [data, setData] = useState<Transaksi[]>([]);
  const [siap, setSiap] = useState(false);
  const [transaksiTerpilih, setTransaksiTerpilih] = useState<Transaksi | null>(null);

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

  // Filter transaksi pemasukan yang memiliki detail iuran
  const riwayatIuran = data
    .filter((item) => item.jenis === "Pemasukan" && item.detailIuran && item.detailIuran.length > 0)
    .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());

  // Hitung total keseluruhan iuran yang terkumpul
  const totalKeseluruhan = riwayatIuran.reduce((sum, item) => sum + item.nominal, 0);

  // Hitung total yang dibayar oleh warga yang login
  const totalSaya = riwayatIuran.reduce((sum, item) => {
    const detailSaya = item.detailIuran?.find(
      (d) => d.namaWarga.toLowerCase() === NAMA_WARGA_LOGIN.toLowerCase()
    );
    return sum + (detailSaya?.nominal || 0);
  }, 0);

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-800 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* HEADER */}
        <header>
          <p className="text-sm font-medium text-blue-600">
            KasKita / Portal Warga
          </p>
          <h1 className="mt-2 text-3xl font-bold">Riwayat Pembayaran Iuran</h1>
          <p className="mt-2 text-sm text-slate-500">
            Daftar seluruh iuran warga yang tercatat di kas RT.
          </p>
        </header>

        {/* KARTU RINGKASAN */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
            <p className="text-sm text-blue-700">Warga Login</p>
            <p className="mt-2 text-lg font-bold text-blue-900">
              {NAMA_WARGA_LOGIN}
            </p>
            <p className="text-xs text-blue-600">
              Total dibayar: {formatRupiah(totalSaya)}
            </p>
          </div>
          <div className="rounded-2xl border bg-white p-5">
            <p className="text-sm text-slate-500">Total Iuran Terkumpul</p>
            <p className="mt-2 break-words text-2xl font-bold text-emerald-600">
              {formatRupiah(totalKeseluruhan)}
            </p>
          </div>
          <div className="rounded-2xl border bg-white p-5">
            <p className="text-sm text-slate-500">Jumlah Transaksi</p>
            <p className="mt-2 text-2xl font-bold text-slate-800">
              {riwayatIuran.length}
            </p>
            <p className="text-xs text-slate-400">periode iuran tercatat</p>
          </div>
        </section>

        {/* DAFTAR TRANSAKSI IURAN */}
        {riwayatIuran.map((item) => (
          <section
            key={item.id}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
          >
            {/* HEADER TRANSAKSI */}
            <div className="flex flex-col gap-2 border-b border-slate-100 bg-slate-50 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-800">
                  {item.keterangan || item.kategori}
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  {item.tanggal} • {item.kategori} • {item.detailIuran?.length} warga
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">Total Terkumpul</p>
                <p className="text-lg font-bold text-emerald-600">
                  {formatRupiah(item.nominal)}
                </p>
              </div>
            </div>

            {/* TABEL DETAIL WARGA */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-125 text-left text-sm">
                <thead className="bg-white text-xs uppercase text-slate-500">
                  <tr className="border-b border-slate-100">
                    <th className="px-5 py-3">No</th>
                    <th className="px-5 py-3">Nama Warga</th>
                    <th className="px-5 py-3">Blok / No. Rumah</th>
                    <th className="px-5 py-3 text-right">Nominal</th>
                    <th className="px-5 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {item.detailIuran?.map((detail: DetailIuran, idx: number) => {
                    const isSaya =
                      detail.namaWarga.toLowerCase() ===
                      NAMA_WARGA_LOGIN.toLowerCase();
                    return (
                      <tr
                        key={idx}
                        className={isSaya ? "bg-blue-50/50" : "hover:bg-slate-50"}
                      >
                        <td className="px-5 py-3 text-slate-400">{idx + 1}</td>
                        <td className="px-5 py-3 font-medium">
                          {detail.namaWarga}
                          {isSaya && (
                            <span className="ml-2 rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white">
                              Kamu
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-slate-500">
                          {detail.blok || "-"}
                        </td>
                        <td className="px-5 py-3 text-right font-semibold text-emerald-600">
                          {formatRupiah(detail.nominal)}
                        </td>
                        <td className="px-5 py-3 text-center">
                          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                            Lunas
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="border-t-2 border-slate-200 bg-slate-50">
                  <tr>
                    <td colSpan={3} className="px-5 py-3 text-right font-bold text-slate-700">
                      Total
                    </td>
                    <td className="px-5 py-3 text-right font-bold text-emerald-700">
                      {formatRupiah(item.nominal)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>
        ))}

        {siap && riwayatIuran.length === 0 && (
          <section className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <p className="text-slate-500">
              Belum ada riwayat pembayaran iuran yang tercatat.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}