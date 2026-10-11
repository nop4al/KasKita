import * as React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  UserCheck,
  ArrowRight,
  Landmark,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { HomeNavbar } from "@/components/home/navbar";
import { HeroPreview } from "@/components/home/hero-preview";
import { FeatureBento } from "@/components/home/feature-bento";
import { WorkflowSection } from "@/components/home/workflow-section";
import { FAQSection } from "@/components/home/faq-section";
import { HomeFooter } from "@/components/home/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-foreground flex flex-col font-sans">
      {/* Top Navigation */}
      <HomeNavbar />

      <main className="flex-1 space-y-20 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* HERO SECTION */}
        <section className="space-y-8 pt-4 sm:pt-8 text-center sm:text-left">
          <div className="space-y-4 max-w-3xl">

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-zinc-100 leading-[1.1]">
              Catatan Kas RT Rapi, Iuran Warga Tanpa Ribet.
            </h1>

            {/* Subtext */}
            <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-400 leading-relaxed max-w-2xl font-medium">
              Bikin catatan kas lingkungan rapi, tagih iuran warga lewat WhatsApp tanpa rasa sungkan, dan kasih kwitansi sah ke setiap rumah.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: "default" }),
                  "bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold h-12 px-7 rounded-2xl shadow-sm gap-2 text-xs uppercase tracking-wider"
                )}
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Masuk Panel Pengurus (Pak RT)</span>
              </Link>

              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "font-extrabold h-12 px-7 rounded-2xl gap-2 text-xs uppercase tracking-wider border-slate-300 dark:border-zinc-700 hover:bg-white dark:hover:bg-zinc-900"
                )}
              >
                <UserCheck className="h-4 w-4 text-blue-600" />
                <span>Masuk Portal Warga (Cek Iuran)</span>
              </Link>
            </div>
          </div>

          {/* Metric Bar Ramah Warga */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 pt-4 border-t border-slate-200 dark:border-zinc-800 text-left">
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs">
              <p className="text-2xl font-black text-slate-900 dark:text-zinc-100">
                120+ RT
              </p>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
                Tersebar di Berbagai Kota
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-2xs">
              <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
                Rp 850jt+
              </p>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
                Uang Kas Dikelola Transparan
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs">
              <p className="text-2xl font-black text-slate-900 dark:text-zinc-100">
                98%
              </p>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
                Warga Disiplin Bayar Iuran
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20 shadow-2xs">
              <p className="text-2xl font-black text-blue-700 dark:text-blue-400">
                6.400+ Rumah
              </p>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
                Warga Terlayani Tenang &amp; Rukun
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 2: MULTI-RT INTERACTIVE PREVIEW */}
        <section id="multi-rt" className="space-y-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-3 py-1 rounded-full">
              Bisa Buat RT Mana Saja
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-zinc-100">
              Pilih Lingkungan RT &amp; Coba Demonya
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 max-w-2xl">
              Setiap rukun tetangga punya ruang buku kas tersendiri. Coba ganti RT di bawah ini untuk melihat contoh pembukuan di Depok, Menteng Jakarta, Bandung, dan Surabaya.
            </p>
          </div>

          <HeroPreview />
        </section>

        {/* SECTION 3: BENTO KEUNGGULAN KASKITA */}
        <FeatureBento />

        {/* SECTION 4: CARA PAKAI */}
        <WorkflowSection />

        {/* SECTION 5: FAQ */}
        <FAQSection />

        {/* SECTION 6: BANNER AJAKAN ADOPSI */}
        <Card className="relative overflow-hidden rounded-3xl border border-emerald-200/60 dark:border-emerald-800/60 bg-gradient-to-br from-emerald-600 via-emerald-600 to-emerald-800 p-8 sm:p-12 shadow-xl shadow-emerald-900/10 text-center text-white space-y-6">
          {/* Decorative ambient animated lights */}
          <div className="absolute -top-20 -right-20 h-56 w-56 rounded-full bg-white/10 blur-3xl pointer-events-none animate-float" />
          <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-emerald-400/20 blur-3xl pointer-events-none animate-pulse-ring" />

          <div className="relative z-10 flex flex-col items-center gap-4 max-w-2xl mx-auto">
            <span className="inline-flex items-center text-xs font-bold bg-white/20 hover:bg-white/25 transition-colors border border-white/20 px-3.5 py-1.5 rounded-full uppercase tracking-wider shadow-xs backdrop-blur-xs">
              GRATIS &amp; GAMPANG
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              Bikin Kas RT Anda Lebih Rapi &amp; Warga Tambah Rukun
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed font-medium">
              Pengurus ga lagi pusing catatan hilang, warga pun senang karena uang kas lingkungan bisa dipantau bersama secara jujur dan terbuka.
            </p>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/dashboard/admin"
              className={cn(
                buttonVariants({ variant: "default" }),
                "bg-white text-emerald-800 hover:bg-emerald-50 hover:text-emerald-900 font-black h-12 px-8 rounded-2xl text-xs uppercase tracking-wider shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200"
              )}
            >
              <span>Buka Demo Pengurus (RT 04)</span>
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Link>

            <Link
              href="/dashboard/warga"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "bg-emerald-800/60 text-white border-white/30 hover:bg-emerald-800/80 font-extrabold h-12 px-8 rounded-2xl text-xs uppercase tracking-wider shadow-md hover:scale-105 active:scale-95 transition-all duration-200 backdrop-blur-xs"
              )}
            >
              <span>Buka Demo Warga (Slip Kwitansi)</span>
            </Link>
          </div>
        </Card>
      </main>

      {/* Footer */}
      <HomeFooter />
    </div>
  );
}
