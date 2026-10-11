"use client";

import * as React from "react";
import Link from "next/link";
import {
  MapPin,
  Users,
  Wallet,
  ArrowRight,
  ShieldCheck,
  Receipt,
  Search,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatRupiah } from "@/lib/mock-data";

interface NeighborhoodData {
  id: string;
  name: string;
  kelurahan: string;
  kota: string;
  kkCount: number;
  saldoKas: number;
  iuranBulanan: number;
  kolektibilitas: string;
  adminName: string;
  highlight: string;
}

const mockNeighborhoods: NeighborhoodData[] = [
  {
    id: "rt04-sukamaju",
    name: "RT 04 / RW 08",
    kelurahan: "Kel. Sukamaju",
    kota: "Kota Depok",
    kkCount: 64,
    saldoKas: 5250000,
    iuranBulanan: 50000,
    kolektibilitas: "48 dari 64 Rumah Lunas (75%)",
    adminName: "Pak Bambang (Bendahara)",
    highlight: "Iuran sampah & lampu jalan gang",
  },
  {
    id: "rt02-menteng",
    name: "RT 02 / RW 05",
    kelurahan: "Kel. Menteng",
    kota: "Jakarta Pusat",
    kkCount: 48,
    saldoKas: 14800000,
    iuranBulanan: 150000,
    kolektibilitas: "44 dari 48 Rumah Lunas (92%)",
    adminName: "Pak Hendrawan (Ketua RT)",
    highlight: "Pos keamanan 24 jam & kebersihan taman",
  },
  {
    id: "rt06-ciumbuleuit",
    name: "RT 06 / RW 02",
    kelurahan: "Kel. Ciumbuleuit",
    kota: "Kota Bandung",
    kkCount: 72,
    saldoKas: 8920000,
    iuranBulanan: 75000,
    kolektibilitas: "60 dari 72 Rumah Lunas (84%)",
    adminName: "Pak Ridwan (Bendahara)",
    highlight: "Kas kematian warga & kerja bakti selokan",
  },
  {
    id: "rt01-gubeng",
    name: "RT 01 / RW 04",
    kelurahan: "Kel. Gubeng",
    kota: "Kota Surabaya",
    kkCount: 55,
    saldoKas: 6150000,
    iuranBulanan: 45000,
    kolektibilitas: "44 dari 55 Rumah Lunas (80%)",
    adminName: "Pak Soetrisno (Ketua RT)",
    highlight: "Paving jalan gang & penghijauan RT",
  },
];

export function HeroPreview() {
  const [selectedId, setSelectedId] = React.useState<string>("rt04-sukamaju");
  const [searchTerm, setSearchTerm] = React.useState<string>("");

  const filtered = mockNeighborhoods.filter(
    (n) =>
      n.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.kelurahan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.kota.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const current =
    mockNeighborhoods.find((n) => n.id === selectedId) || mockNeighborhoods[0];

  return (
    <Card className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-md overflow-hidden">
      {/* Top Banner Simulator */}
      <div className="bg-slate-50 dark:bg-zinc-800/60 p-4 sm:p-5 border-b border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-black uppercase text-slate-800 dark:text-zinc-200">
            Contoh Tampilan Kas RT Berbagai Wilayah
          </span>
          <span className="text-slate-300 dark:text-zinc-700 hidden sm:inline">•</span>
          <span className="text-xs text-slate-500 dark:text-zinc-400 hidden sm:inline">
            Klik nama RT di bawah untuk ganti lingkungan
          </span>
        </div>

        {/* Cari RT */}
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Ketik nama RT atau kota..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9 pl-9 pr-3 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-emerald-500 w-full sm:w-56"
          />
        </div>
      </div>

      {/* Pilihan Tombol RT */}
      <div className="p-3 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900 overflow-x-auto flex items-center gap-2">
        {filtered.map((item) => (
          <button
            key={item.id}
            onClick={() => setSelectedId(item.id)}
            className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
              selectedId === item.id
                ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                : "bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:border-emerald-400"
            }`}
          >
            <span>{item.name}</span>
            <span className="opacity-75 font-normal ml-1">({item.kota})</span>
          </button>
        ))}
      </div>

      {/* Tampilan Live Kas RT Terpilih */}
      <CardContent className="p-5 sm:p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-zinc-800 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full">
                {current.name}
              </span>
              <span className="text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-1 font-medium">
                <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                {current.kelurahan}, {current.kota}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-zinc-100">
              Buku Kas Lingkungan {current.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Pengelola: <strong className="text-slate-700 dark:text-zinc-200">{current.adminName}</strong> · Fokus: {current.highlight}
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Link
              href="/dashboard/admin"
              className={cn(
                buttonVariants({ variant: "default", size: "sm" }),
                "bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 px-4 rounded-xl shadow-xs"
              )}
            >
              <ShieldCheck className="h-4 w-4 mr-1.5" />
              <span>Buka Demo Pengurus</span>
            </Link>
            <Link
              href="/dashboard/warga"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "font-bold text-xs h-10 px-4 rounded-xl border-slate-200 dark:border-zinc-700 hover:bg-slate-100"
              )}
            >
              <Receipt className="h-4 w-4 mr-1.5" />
              <span>Buka Demo Warga</span>
            </Link>
          </div>
        </div>

        {/* 3 Kotak Angka Ramah Warga */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4.5 rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-1">
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
              <Wallet className="h-4 w-4 text-emerald-600" /> Sisa Uang Kas RT
            </span>
            <p className="text-2xl sm:text-3xl font-black text-emerald-950 dark:text-emerald-100">
              {formatRupiah(current.saldoKas)}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              Transparan untuk seluruh warga
            </p>
          </div>

          <div className="p-4.5 rounded-2xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20 space-y-1">
            <span className="text-xs font-bold text-blue-800 dark:text-blue-300 flex items-center gap-1.5">
              <Users className="h-4 w-4 text-blue-600" /> Warga Terdaftar
            </span>
            <p className="text-2xl sm:text-3xl font-black text-blue-950 dark:text-blue-100">
              {current.kkCount} Rumah (KK)
            </p>
            <p className="text-[11px] text-blue-700 dark:text-blue-300 font-bold">
              {current.kolektibilitas}
            </p>
          </div>

          <div className="p-4.5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-800/40 space-y-1">
            <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Receipt className="h-4 w-4 text-emerald-600" /> Iuran Bulanan
            </span>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-zinc-100">
              {formatRupiah(current.iuranBulanan)}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              Per rumah per bulan (sampah &amp; ronda)
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
