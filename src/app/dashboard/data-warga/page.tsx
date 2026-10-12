
"use client";

import { useState } from "react";
import Link from "next/link";

type Warga = {
  id: number;
  nama: string;
  alamat: string;
  telepon: string;
};

const dataAwal: Warga[] = [
  { id: 1, nama: "Andi Saputra", alamat: "Jl. Melati No. 10", telepon: "081234567890" },
  { id: 2, nama: "Budi Santoso", alamat: "Jl. Mawar No. 5", telepon: "081298765432" },
  { id: 3, nama: "Citra Lestari", alamat: "Jl. Kenanga No. 8", telepon: "082112223333" },
];

export default function DataWargaPage() {
  const [warga, setWarga] = useState<Warga[]>(dataAwal);
  const [nama, setNama] = useState("");
  const [alamat, setAlamat] = useState("");
  const [telepon, setTelepon] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [pencarian, setPencarian] = useState("");

  function simpanWarga(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!nama.trim() || !alamat.trim() || !telepon.trim()) {
      alert("Semua kolom wajib diisi.");
      return;
    }

    if (editId !== null) {
      setWarga((daftar) =>
        daftar.map((item) =>
          item.id === editId
            ? { ...item, nama, alamat, telepon }
            : item
        )
      );
    } else {
      setWarga((daftar) => [
        ...daftar,
        { id: Date.now(), nama, alamat, telepon },
      ]);
    }

    resetForm();
  }

  function resetForm() {
    setNama("");
    setAlamat("");
    setTelepon("");
    setEditId(null);
  }

  function editWarga(item: Warga) {
    setEditId(item.id);
    setNama(item.nama);
    setAlamat(item.alamat);
    setTelepon(item.telepon);
  }

  function hapusWarga(id: number) {
    if (confirm("Yakin ingin menghapus data warga ini?")) {
      setWarga((daftar) => daftar.filter((item) => item.id !== id));
    }
  }

  const wargaTerfilter = warga.filter((item) =>
    `${item.nama} ${item.alamat} ${item.telepon}`
      .toLowerCase()
      .includes(pencarian.toLowerCase())
  );

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";

  return (
    <main className="min-h-screen bg-gray-50 text-gray-800">
      <div className="mx-auto max-w-7xl px-5 py-8 md:px-8">
        <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold text-emerald-700">KasKita / Dashboard</p>
            <h1 className="text-3xl font-bold tracking-tight">Data Warga</h1>
            <p className="mt-2 text-sm text-gray-500">Kelola data warga di lingkunganmu.</p>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <Link className="rounded-lg bg-emerald-600 px-4 py-2.5 font-medium text-white" href="/dashboard/data-warga">Data Warga</Link>
            <Link className="rounded-lg border bg-white px-4 py-2.5" href="/dashboard/manajemen-iuran">Manajemen Iuran</Link>
            <Link className="rounded-lg border bg-white px-4 py-2.5" href="/dashboard/riwayat-iuran">Riwayat Iuran</Link>
          </div>
        </header>

        <section className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Total Warga</p>
            <p className="mt-2 text-3xl font-bold">{warga.length}</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Data Ditampilkan</p>
            <p className="mt-2 text-3xl font-bold">{wargaTerfilter.length}</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Status Data</p>
            <p className="mt-2 text-xl font-bold text-emerald-700">Aktif</p>
          </div>
        </section>

        <section className="mb-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-bold">
            {editId !== null ? "Edit Data Warga" : "Tambah Warga"}
          </h2>
          <form onSubmit={simpanWarga} className="grid gap-4 md:grid-cols-3">
            <label className="text-sm font-medium">
              Nama lengkap
              <input className={`${inputClass} mt-2`} value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Masukkan nama" />
            </label>
            <label className="text-sm font-medium">
              Alamat
              <input className={`${inputClass} mt-2`} value={alamat} onChange={(e) => setAlamat(e.target.value)} placeholder="Masukkan alamat" />
            </label>
            <label className="text-sm font-medium">
              Nomor telepon
              <input className={`${inputClass} mt-2`} value={telepon} onChange={(e) => setTelepon(e.target.value)} placeholder="08xxxxxxxxxx" />
            </label>
            <div className="flex flex-wrap gap-2 md:col-span-3">
              <button className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700" type="submit">
                {editId !== null ? "Simpan Perubahan" : "+ Tambah Warga"}
              </button>
              {editId !== null && (
                <button className="rounded-xl border px-5 py-3 text-sm font-semibold" type="button" onClick={resetForm}>
                  Batal
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold">Daftar Warga</h2>
              <p className="mt-1 text-sm text-gray-500">Informasi warga yang terdaftar.</p>
            </div>
            <input
              className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:border-emerald-500 sm:max-w-xs"
              placeholder="Cari nama, alamat, telepon..."
              value={pencarian}
              onChange={(e) => setPencarian(e.target.value)}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-5 py-4 font-medium">No.</th>
                  <th className="px-5 py-4 font-medium">Nama Warga</th>
                  <th className="px-5 py-4 font-medium">Alamat</th>
                  <th className="px-5 py-4 font-medium">Telepon</th>
                  <th className="px-5 py-4 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {wargaTerfilter.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4 text-gray-500">{index + 1}</td>
                    <td className="px-5 py-4 font-semibold">{item.nama}</td>
                    <td className="px-5 py-4">{item.alamat}</td>
                    <td className="px-5 py-4">{item.telepon}</td>
                    <td className="px-5 py-4">
                      <div className="flex gap-3">
                        <button onClick={() => editWarga(item)} className="font-semibold text-emerald-700 hover:underline">Edit</button>
                        <button onClick={() => hapusWarga(item.id)} className="font-semibold text-red-600 hover:underline">Hapus</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {wargaTerfilter.length === 0 && (
                  <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-500">Data warga tidak ditemukan.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
