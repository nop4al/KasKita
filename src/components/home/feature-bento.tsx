import * as React from "react";
import {
  BookOpen,
  Receipt,
  MessageCircle,
  ShieldCheck,
  CheckCircle2,
  Users,
  Smartphone,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function FeatureBento() {
  return (
    <section id="fitur" className="space-y-6">
      <div className="space-y-1">
        <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-3 py-1 rounded-full">
          Kenapa Pakai KasKita?
        </span>
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-zinc-100">
          Dibuat Khusus Buat Kebutuhan Warga &amp; Pengurus RT
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 max-w-2xl">
          Ga perlu pusing rumus Excel rumit, uang kas ga kecampur uang pribadi, dan warga tenang karena catatannya transparan.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Bento 1: Buku Kas Praktis (Col 1-7) */}
        <Card className="md:col-span-7 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden flex flex-col justify-between">
          <CardContent className="p-6 sm:p-7 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                <BookOpen className="h-6 w-6" strokeWidth={2.4} />
              </div>
              <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold border-none">
                Gampang Dipakai
              </Badge>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-zinc-100">
                Catatan Kas Rapi Tanpa Rumus Excel
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">
                Tiap ada iuran warga masuk atau beli lampu jalan, tinggal pencet tombol tambah. Saldo langsung terhitung otomatis tanpa takut salah hitung atau rumus hilang saat ganti pengurus.
              </p>
            </div>

            {/* Visual Mini */}
            <div className="rounded-2xl bg-slate-50 dark:bg-zinc-800/60 p-4 border border-slate-100 dark:border-zinc-800 space-y-2 text-xs">
              <div className="flex justify-between items-center p-2 rounded-xl bg-white dark:bg-zinc-900 shadow-2xs">
                <span className="font-bold text-slate-800 dark:text-zinc-200">Iuran Warga Gang Mawar (15 Rumah)</span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">+Rp 750.000</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-xl bg-white dark:bg-zinc-900 shadow-2xs">
                <span className="font-bold text-slate-800 dark:text-zinc-200">Beli 4 Lampu Jalan Gang 3</span>
                <span className="font-extrabold text-rose-600 dark:text-rose-400 text-sm">-Rp 180.000</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bento 2: Kwitansi Resmi Warga (Col 8-12) */}
        <Card className="md:col-span-5 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden flex flex-col justify-between">
          <CardContent className="p-6 sm:p-7 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                <Receipt className="h-6 w-6" strokeWidth={2.4} />
              </div>
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 text-xs font-bold border-none">
                Bukti Sah
              </Badge>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-zinc-100">
                Kwitansi Sah Digital Buat Warga
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">
                Tiap warga yang sudah bayar iuran dapat bukti kwitansi tanda terima berstempel sah. Bisa diunduh PDF atau ditunjukkan langsung dari HP.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-1">
              <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block">
                BENDAHARA RT 04 · TERCATAT LUNAS
              </span>
              <p className="text-xl font-black text-emerald-700 dark:text-emerald-400">
                SUDAH LUNAS 👍
              </p>
              <span className="text-xs text-slate-500 dark:text-zinc-400 block font-mono">
                No: KASKITA-RT04-202610-014
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Bento 3: Pengingat WhatsApp Santun (Col 1-6) */}
        <Card className="md:col-span-6 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden flex flex-col justify-between">
          <CardContent className="p-6 sm:p-7 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#25D366]/20 text-[#1da851]">
                <MessageCircle className="h-6 w-6" strokeWidth={2.4} />
              </div>
              <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold border-none">
                Anti Sungkan
              </Badge>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-zinc-100">
                Ingatkan Iuran Lewat WhatsApp dengan Bahasa Santun
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">
                Pengurus ga perlu canggung nagih tetangga. KasKita siapkan draf pesan pengingat kekeluargaan yang sopan dan siap dikirim ke WhatsApp warga.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 text-xs text-slate-600 dark:text-zinc-300 italic">
              &quot;Assalamu&apos;alaikum Bapak/Ibu, mengingatkan iuran kebersihan &amp; ronda RT 04 bulan Oktober...&quot;
            </div>
          </CardContent>
        </Card>

        {/* Bento 4: Multi-RT Aman & Mandiri (Col 7-12) */}
        <Card className="md:col-span-6 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden flex flex-col justify-between">
          <CardContent className="p-6 sm:p-7 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                <ShieldCheck className="h-6 w-6" strokeWidth={2.4} />
              </div>
              <Badge className="bg-slate-100 text-slate-800 dark:bg-zinc-800 dark:text-zinc-300 text-xs font-bold border-none">
                Bisa Buat Semua RT
              </Badge>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-zinc-100">
                Bisa Dipakai RT Mana Pun di Indonesia
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">
                Setiap RT punya ruang catatan sendiri. Data RT 04 Sukamaju ga akan kecampur sama RT sebelah. Privasi nomor HP dan nama warga dijamin aman.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Data Warga Aman</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Bisa Cetak PDF</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
