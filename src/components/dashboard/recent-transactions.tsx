import * as React from "react";
import { format, parseISO } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Receipt,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatRupiah, type Transaksi } from "@/lib/mock-data";

export interface RecentTransactionsProps {
  transactions: Transaksi[];
  className?: string;
  limit?: number;
}

export function RecentTransactions({
  transactions,
  className,
  limit = 5,
}: RecentTransactionsProps) {
  const displayed = transactions.slice(0, limit);

  return (
    <Card
      className={cn(
        "rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden",
        className
      )}
    >
      <CardHeader className="bg-slate-50/70 dark:bg-zinc-800/40 p-5 border-b border-slate-100 dark:border-zinc-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">
                <Receipt className="h-4 w-4" />
              </div>
              <CardTitle className="text-base font-extrabold text-slate-900 dark:text-zinc-100">
                Catatan Uang Masuk &amp; Keluar
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              Catatan mutasi kas RT paling baru yang sudah diverifikasi bendahara
            </CardDescription>
          </div>
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 self-start sm:self-auto">
            {transactions.length} Catatan Aktif
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="divide-y divide-slate-100 dark:divide-zinc-800">
          {displayed.map((item) => {
            const isPemasukan = item.tipe === "Pemasukan";
            let formattedDate = item.tanggal;
            try {
              formattedDate = format(parseISO(item.tanggal), "d MMMM yyyy", {
                locale: idLocale,
              });
            } catch {
              // fallback
            }

            return (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 sm:p-4.5 hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors"
              >
                {/* Kolom Kiri: Ikon & Uraian */}
                <div className="flex items-start gap-3.5 min-w-0 pr-2">
                  <div
                    className={cn(
                      "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold shadow-xs",
                      isPemasukan
                        ? "bg-emerald-500 text-white"
                        : "bg-rose-500 text-white"
                    )}
                  >
                    {isPemasukan ? (
                      <ArrowDownLeft className="h-5 w-5" strokeWidth={2.6} />
                    ) : (
                      <ArrowUpRight className="h-5 w-5" strokeWidth={2.6} />
                    )}
                  </div>

                  <div className="min-w-0 space-y-1">
                    <p className="text-sm font-bold text-slate-900 dark:text-zinc-100 leading-snug truncate">
                      {item.keterangan}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
                      <span>{formattedDate}</span>
                      <span>•</span>
                      <span className="bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full font-medium text-[11px] text-slate-700 dark:text-zinc-300">
                        {item.kategori}
                      </span>
                      {item.penanggungJawab && (
                        <span className="hidden md:inline italic text-[11px]">
                          ({item.penanggungJawab})
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Kolom Kanan: Nominal & Status */}
                <div className="text-right shrink-0 space-y-1 pl-2">
                  <p
                    className={cn(
                      "text-sm sm:text-base font-extrabold tracking-tight",
                      isPemasukan
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400"
                    )}
                  >
                    {isPemasukan ? "+" : "-"}
                    {formatRupiah(item.nominal)}
                  </p>
                  <Badge
                    className={cn(
                      "text-[10px] font-bold px-2 py-0 border",
                      isPemasukan
                        ? "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
                        : "bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800"
                    )}
                  >
                    {isPemasukan ? "Kas Masuk" : "Kas Keluar"}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
