// src/app/dashboard/catat-kas/page.tsx
"use client";

import { useEffect, useState } from "react";
import {
  bacaTransaksi,
  simpanTransaksi,
  formatRupiah,
  hitungKeuangan,
  DATA_AWAL,
  type Transaksi,
  type DetailIuran,
} from "@/lib/kas";

function tanggalHariIni() {
  const sekarang = new Date();
  const lokal = new Date(
    sekarang.getTime() - sekarang.getTimezoneOffset() * 60000
  );
  return lokal.toISOString().slice(0, 10);
}

export default function CatatKasPage() {
  const [data, setData] = useState<Transaksi[]>([]);
  const [siap, setSiap] = useState(false);
  const [tanggal, setTanggal] = useState(tanggalHariIni());
  const [kategori, setKategori] = useState("Iuran Warga");
  const [keterangan, setKeterangan] = useState("");
  const [detailIuran, setDetailIuran] = useState<DetailIuran[]>([
    { namaWarga: "", blok: "", nominal: 0 },
  ]);
  const [cari, setCari] = useState("");
  const [transaksiTerpilih, setTransaksiTerpilih] = useState<Transaksi | null>(null);

  useEffect(() => {
    const dataDariStorage = bacaTransaksi();
    if (dataDariStorage.length === 0) {
      setData(DATA_AWAL);
      simpanTransaksi(DATA_AWAL);
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

  function tambahBarisDetail() {
    setDetailIuran([...detailIuran, { namaWarga: "", blok: "", nominal: 0 }]);
  }

  function hapusBarisDetail(index: number) {
    setDetailIuran(detailIuran.filter((_, i) => i !== index));
  }

  function ubahDetail(index: number, field: keyof DetailIuran, value: string | number) {
    const baru = [...detailIuran];
    if (field === "nominal") {
      baru[index].nominal = Number(value);
    } else {
      baru[index][field] = value as string;
    }
    setDetailIuran(baru);
  }

  function tambahTransaksi(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const totalNominal = detailIuran.reduce((sum, item) => sum + item.nominal, 0);

    if (!tanggal || !kategori || totalNominal <= 0) {
      alert("Periksa kembali tanggal, kategori, dan nominal transaksi.");
      return;
    }

    const detailValid = detailIuran.every(
      (item) => item.namaWarga.trim() !== "" && item.nominal > 0
    );

    if (!detailValid) {
      alert("Mohon lengkapi semua data warga dan nominal iuran.");
      return;
    }

    const transaksiBaru: Transaksi = {
      id: crypto.randomUUID(),
      jenis: "Pemasukan",
      tanggal,
      kategori,
      nominal: totalNominal,
      keterangan: keterangan.trim() || `Iuran dari ${detailIuran.length} warga`,
      detailIuran: detailIuran.filter((item) => item.namaWarga.trim() !== ""),
    };

    const dataBaru = [transaksiBaru, ...data];
    simpanTransaksi(dataBaru);
    setData(dataBaru);
    setKeterangan("");
    setDetailIuran([{ namaWarga: "", blok: "", nominal: 0 }]);
    alert("Pemasukan berhasil dicatat.");
  }

  function hapusTransaksi(id: string) {
    if (!confirm("Yakin ingin menghapus transaksi ini?")) return;
    const dataBaru = data.filter((item) => item.id !== id);
    simpanTransaksi(dataBaru);
    setData(dataBaru);
  }

  const ringkasan = hitungKeuangan(data);

  // Hanya tampilkan transaksi Pemasukan
  const dataPemasukan = data.filter((item) => item.jenis === "Pemasukan");

  const dataTampil = dataPemasukan.filter(
    (item) =>
      item.keterangan.toLowerCase().includes(cari.toLowerCase()) ||
      item.kategori.toLowerCase().includes(cari.toLowerCase()) ||
      item.detailIuran?.some((d) =>
        d.namaWarga.toLowerCase().includes(cari.toLowerCase())
      )
  );

  return (
    <div className="space-y-6 text-slate-900 dark:text-zinc-100">
        <header>
          <p className="text-sm font-medium text-blue-600 dark:text-blue-400">KasKita / Dashboard</p>
          <h1 className="mt-2 text-3xl font-bold">Catat Uang Kas</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400">
            Catat pemasukan iuran kas RT beserta rincian per warga.
          </p>
        </header>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border bg-white dark:bg-zinc-900 p-5">
            <p className="text-sm text-slate-500 dark:text-zinc-400">Total Pemasukan</p>
            <p className="mt-3 break-words text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatRupiah(ringkasan.pemasukan)}
            </p>
    </div>
          <div className="rounded-2xl border bg-white dark:bg-zinc-900 p-5">
            <p className="text-sm text-slate-500 dark:text-zinc-400">Total Pengeluaran</p>
            <p className="mt-3 break-words text-xl font-bold text-red-600 dark:text-red-400">
              {formatRupiah(ringkasan.pengeluaran)}
            </p>
          </div>
          <div className="rounded-2xl border bg-white dark:bg-zinc-900 p-5">
            <p className="text-sm text-slate-500 dark:text-zinc-400">Saldo Kas</p>
            <p className="mt-3 break-words text-xl font-bold text-blue-600 dark:text-blue-400">
              {formatRupiah(ringkasan.saldo)}
            </p>
          </div>
        </section>

        {/* FORM TAMBAH PEMASUKAN */}
        <section className="rounded-2xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-5 sm:p-6">
          <h2 className="text-lg font-bold">Tambah Pemasukan Kas</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
            Masukkan rincian iuran dari setiap warga.
          </p>

          <form onSubmit={tambahTransaksi} className="mt-5 space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium">
                Tanggal
                <input
                  type="date"
                  required
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 px-4 py-3 outline-none focus:border-blue-500"
                />
              </label>

              <label className="text-sm font-medium">
                Kategori
                <select
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 outline-none focus:border-blue-500"
                >
                  <option value="Iuran Warga">Iuran Warga</option>
                  <option value="Donasi Warga">Donasi Warga</option>
                  <option value="Sumbangan">Sumbangan</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </label>

              <label className="text-sm font-medium sm:col-span-2">
                Keterangan (Opsional)
                <input
                  type="text"
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  placeholder="Contoh: Iuran Bulanan Gang Mawar"
                  className="mt-2 w-full rounded-xl border border-slate-200 dark:border-zinc-700 px-4 py-3 outline-none focus:border-blue-500"
                />
              </label>
            </div>

            {/* RINCIAN IURAN PER WARGA */}
            <div className="rounded-xl border border-slate-200 dark:border-zinc-700 p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-700 dark:text-zinc-200">Rincian Iuran Warga</h3>
                <button
                  type="button"
                  onClick={tambahBarisDetail}
                  className="rounded-lg bg-blue-50 dark:bg-blue-950/40 px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-950/60"
                >
                  + Tambah Warga
                </button>
              </div>

              <div className="mt-3 space-y-3">
                {detailIuran.map((item, index) => (
                  <div key={index} className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <input
                      type="text"
                      placeholder="Nama Warga"
                      value={item.namaWarga}
                      onChange={(e) => ubahDetail(index, "namaWarga", e.target.value)}
                      className="flex-1 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 px-3 py-2 text-sm outline-none focus:border-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Blok/No. Rumah"
                      value={item.blok}
                      onChange={(e) => ubahDetail(index, "blok", e.target.value)}
                      className="flex-1 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 px-3 py-2 text-sm outline-none focus:border-blue-500"
                    />
                    <input
                      type="number"
                      placeholder="Nominal"
                      value={item.nominal || ""}
                      onChange={(e) => ubahDetail(index, "nominal", e.target.value)}
                      className="w-full rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 px-3 py-2 text-sm outline-none focus:border-blue-500 sm:w-32"
                    />
                    {detailIuran.length > 1 && (
                      <button
                        type="button"
                        onClick={() => hapusBarisDetail(index)}
                        className="rounded-lg border border-red-100 dark:border-red-900 px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50"
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-4 flex justify-end border-t border-slate-100 dark:border-zinc-800 pt-3">
                <p className="text-sm font-bold text-slate-700 dark:text-zinc-200">
                  Total: {formatRupiah(detailIuran.reduce((sum, item) => sum + item.nominal, 0))}
                </p>
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 sm:w-auto"
            >
              + Simpan Pemasukan
            </button>
          </form>
        </section>

        {/* TABEL RIWAYAT PEMASUKAN */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
          <div className="flex flex-col gap-4 border-b border-slate-100 dark:border-zinc-800 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold">Riwayat Pemasukan Kas</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
                {dataTampil.length} transaksi ditemukan
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="search"
                value={cari}
                onChange={(e) => setCari(e.target.value)}
                placeholder="Cari nama warga / keterangan..."
                className="rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px] text-left text-sm">
              <thead className="bg-slate-50 dark:bg-zinc-800 text-xs uppercase text-slate-500 dark:text-zinc-400">
                <tr>
                  <th className="px-5 py-4">Tanggal</th>
                  <th className="px-5 py-4">Kategori / Keterangan</th>
                  <th className="px-5 py-4">Jumlah Warga</th>
                  <th className="px-5 py-4">Nominal</th>
                  <th className="px-5 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {dataTampil.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800">
                    <td className="whitespace-nowrap px-5 py-4">{item.tanggal}</td>
                    <td className="px-5 py-4">
                      <p className="font-semibold">{item.kategori}</p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
                        {item.keterangan || "-"}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      {item.detailIuran && item.detailIuran.length > 0 ? (
                        <span className="rounded-full bg-blue-50 dark:bg-blue-950/40 px-3 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300">
                          {item.detailIuran.length} Warga
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 dark:text-zinc-500">-</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 font-semibold text-emerald-600 dark:text-emerald-400">
                      +{formatRupiah(item.nominal)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {item.detailIuran && item.detailIuran.length > 0 && (
                          <button
                            onClick={() => setTransaksiTerpilih(item)}
                            className="rounded-lg border border-blue-100 dark:border-blue-900 px-3 py-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50"
                          >
                            Lihat Detail
                          </button>
                        )}
                        <button
                          onClick={() => hapusTransaksi(item.id)}
                          className="rounded-lg border border-red-100 dark:border-red-900 px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {siap && dataTampil.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-slate-500 dark:text-zinc-400">
                      Belum ada transaksi yang sesuai.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

      {/* MODAL DETAIL IURAN */}
      {transaksiTerpilih && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-zinc-900 p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Detail Iuran Warga</h3>
              <button
                onClick={() => setTransaksiTerpilih(null)}
                className="text-slate-400 dark:text-zinc-500 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
              {transaksiTerpilih.keterangan} — {transaksiTerpilih.tanggal}
            </p>

            <div className="mt-4 max-h-80 overflow-y-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-zinc-800 text-xs uppercase text-slate-500 dark:text-zinc-400">
                  <tr>
                    <th className="px-3 py-2">Nama Warga</th>
                    <th className="px-3 py-2">Blok</th>
                    <th className="px-3 py-2 text-right">Nominal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                  {transaksiTerpilih.detailIuran?.map((detail, idx) => (
                    <tr key={idx}>
                      <td className="px-3 py-2 font-medium">{detail.namaWarga}</td>
                      <td className="px-3 py-2 text-slate-500 dark:text-zinc-400">{detail.blok || "-"}</td>
                      <td className="px-3 py-2 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                        {formatRupiah(detail.nominal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t border-slate-200 dark:border-zinc-700">
                  <tr>
                    <td colSpan={2} className="px-3 py-2 font-bold">Total</td>
                    <td className="px-3 py-2 text-right font-bold text-emerald-700 dark:text-emerald-300">
                      {formatRupiah(transaksiTerpilih.nominal)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <button
              onClick={() => setTransaksiTerpilih(null)}
              className="mt-4 w-full rounded-xl bg-slate-100 dark:bg-zinc-800 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-zinc-200 hover:bg-slate-200 dark:hover:bg-zinc-700"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}