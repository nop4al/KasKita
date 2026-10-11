import * as React from "react";
import { UserPlus, Receipt, TrendingUp, Check } from "lucide-react";
import { Card } from "@/components/ui/card";

export function WorkflowSection() {
  const steps = [
    {
      step: "1",
      icon: UserPlus,
      title: "Daftarkan RT & Besaran Iuran",
      description:
        "Pak RT atau bendahara mendaftar nama RT/RW dan menentukan nominal iuran bulanan (contoh: Sampah Rp 25.000 + Ronda Rp 25.000).",
    },
    {
      step: "2",
      icon: Receipt,
      title: "Masukkan Daftar Rumah Warga",
      description:
        "Cukup catat nomor rumah/gang dan nama kepala keluarga. Tagihan bulanan otomatis muncul tiap awal bulan.",
    },
    {
      step: "3",
      icon: TrendingUp,
      title: "Warga Cek Status & Uang Kas Terbuka",
      description:
        "Tandai yang sudah bayar, dan seluruh warga bisa cek saldo kas RT langsung dari HP kapan saja secara terbuka.",
    },
  ];

  return (
    <section id="cara-kerja" className="space-y-6">
      <div className="space-y-1">
        <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-3 py-1 rounded-full">
          Cara Mulainya Gampang
        </span>
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-zinc-100">
          3 Langkah Cepat Pakai KasKita di Lingkungan Anda
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 max-w-2xl">
          Ga ribet, ga perlu belajar akuntansi. Siapa pun pengurusnya langsung bisa pakai dalam hitungan menit.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {steps.map((item) => (
          <Card
            key={item.step}
            className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm p-6 sm:p-7 relative overflow-hidden flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white font-black text-lg">
                  {item.step}
                </span>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900">
                  <item.icon className="h-5 w-5" strokeWidth={2.4} />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-black text-slate-900 dark:text-zinc-100">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 mt-5 flex items-center text-xs font-bold text-emerald-700 dark:text-emerald-400 gap-1.5">
              <Check className="h-4 w-4" />
              <span>Praktis &amp; Langsung Jalan</span>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
