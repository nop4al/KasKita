import * as React from "react";
import Link from "next/link";
import { Landmark, ShieldCheck, UserCheck, Heart } from "lucide-react";

export function HomeFooter() {
  return (
    <footer className="border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs font-black">
                <Landmark className="h-5 w-5" strokeWidth={2.4} />
              </div>
              <span className="text-lg font-black tracking-tight text-slate-900 dark:text-zinc-100">
                KasKita
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 leading-relaxed max-w-sm">
              Aplikasi catatan kas &amp; iuran rukun tetangga dan rukun warga se-Indonesia. Bikin pembukuan pengurus rapi, warga tenang, lingkungan semakin guyub dan rukun.
            </p>
          </div>

          {/* Quick Demo Links */}
          <div className="space-y-2.5 text-xs">
            <p className="font-extrabold uppercase tracking-wider text-slate-900 dark:text-zinc-100">
              Coba Aplikasi
            </p>
            <ul className="space-y-2 text-slate-600 dark:text-zinc-400 font-medium">
              <li>
                <Link
                  href="/dashboard/admin"
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>Panel Pengurus (Pak RT / Bendahara)</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/warga"
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5"
                >
                  <UserCheck className="h-4 w-4 text-blue-600" />
                  <span>Portal Warga (Kwitansi Iuran)</span>
                </Link>
              </li>
              <li>
                <a href="#multi-rt" className="hover:text-slate-900 dark:hover:text-zinc-200 transition-colors">
                  Cari RT di Kota Anda
                </a>
              </li>
            </ul>
          </div>

          {/* Platform Info */}
          <div className="space-y-2.5 text-xs">
            <p className="font-extrabold uppercase tracking-wider text-slate-900 dark:text-zinc-100">
              Tentang KasKita
            </p>
            <ul className="space-y-2 text-slate-600 dark:text-zinc-400">
              <li>
                <span>Proyek Literasi Digital Warga</span>
              </li>
              <li>
                <span>Bebas Rumus Excel</span>
              </li>
              <li>
                <span>Privasi Nomor HP Warga Terjaga</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-zinc-400">
          <p>© 2026 KasKita. Seluruh Hak Cipta Dilindungi.</p>
          <p className="flex items-center gap-1">
            Dibuat untuk mempermudah hidup warga &amp; pengurus RT di seluruh Indonesia.
          </p>
        </div>
      </div>
    </footer>
  );
}
