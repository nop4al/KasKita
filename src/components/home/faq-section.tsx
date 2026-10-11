"use client";

import * as React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function FAQSection() {
  const faqs = [
    {
      q: "Bisa dipakai buat RT di luar Jabodetabek ga?",
      a: "Bisa banget! KasKita dibuat untuk semua RT dan RW di seluruh Indonesia, baik perumahan perumahan klaster, gang perkampungan kota, maupun lingkungan desa.",
    },
    {
      q: "Kalau ada warga sepuh yang bayar uang cash/tunai gimana?",
      a: "Tetap bisa jalan seperti biasa. Bendahara tinggal terima uang tunai dari warga, lalu klik tombol 'Catat Iuran' dan pilih metode 'Tunai'. Bukti kwitansi juga bisa dicetak di kertas kalau warga mau simpan fisik.",
    },
    {
      q: "Apakah data uang kas RT kita bisa diintip sama RT sebelah?",
      a: "Tidak bisa. Setiap RT punya akun dan catatan sendiri yang terkunci rapat. Hanya warga yang terdaftar di RT Anda yang bisa melihat catatan kas lingkungan Anda.",
    },
    {
      q: "Bisa dicetak ga buat bahan rapat bulanan bapak-bapak?",
      a: "Bisa sekali! Ada tombol unduh laporan PDF yang langsung rapi dan siap dicetak atau dishare ke grup WhatsApp warga sebelum rapat bulanan dimulai.",
    },
    {
      q: "Gimana kalau nanti ganti ketua RT atau bendahara baru?",
      a: "Ga perlu takut catatan hilang! Semua data tersimpan aman di aplikasi. Pengurus lama tinggal serahkan akses ke pengurus baru, semua riwayat kas tahun-tahun sebelumnya tetap utuh.",
    },
  ];

  return (
    <section id="faq" className="space-y-6">
      <div className="space-y-1">
        <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-3 py-1 rounded-full">
          Tanya Jawab Warga
        </span>
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-zinc-100">
          Hal yang Sering Ditanyakan Pengurus &amp; Warga
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 max-w-2xl">
          Pertanyaan sehari-hari seputar cara kerja KasKita di lingkungan RT.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-7 shadow-sm">
        <Accordion className="w-full">
          {faqs.map((item, idx) => (
            <AccordionItem key={idx} value={`item-${idx}`} className="border-slate-100 dark:border-zinc-800">
              <AccordionTrigger className="text-left font-black text-sm text-slate-900 dark:text-zinc-100 hover:no-underline hover:text-emerald-600 dark:hover:text-emerald-400 py-4">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed pt-1 pb-4">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
