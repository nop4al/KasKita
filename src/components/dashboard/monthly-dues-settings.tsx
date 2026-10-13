"use client";

import * as React from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatRupiah } from "@/lib/mock-data";

type SettingsResponse = {
  success?: boolean;
  data?: {
    monthly_dues: number;
    cleaning_fee: number;
    security_fee: number;
  };
  error?: string;
};

export function MonthlyDuesSettings() {
  const [monthlyDues, setMonthlyDues] = React.useState<number | null>(null);
  const [minimumAmount, setMinimumAmount] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    const controller = new AbortController();

    async function loadSettings() {
      try {
        const response = await fetch("/api/settings", { signal: controller.signal });
        const result = await response.json() as SettingsResponse;
        if (!response.ok || !result.success || !result.data) {
          throw new Error(result.error || "Gagal memuat pengaturan iuran.");
        }
        if (!controller.signal.aborted) {
          setMonthlyDues(result.data.monthly_dues);
          setMinimumAmount(result.data.cleaning_fee + result.data.security_fee);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          toast.error(error instanceof Error ? error.message : "Gagal memuat pengaturan iuran.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadSettings();
    return () => controller.abort();
  }, []);

  async function saveSettings(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (monthlyDues === null) return;

    setSaving(true);
    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ monthlyDues }),
      });
      const result = await response.json() as SettingsResponse;
      if (!response.ok || !result.success || !result.data) {
        throw new Error(result.error || "Gagal menyimpan nominal iuran.");
      }

      setMonthlyDues(result.data.monthly_dues);
      setMinimumAmount(result.data.cleaning_fee + result.data.security_fee);
      toast.success("Nominal iuran bulanan berhasil diperbarui.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menyimpan nominal iuran.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card id="pengaturan" className="scroll-mt-24 rounded-2xl">
      <CardHeader>
        <CardTitle>Pengaturan iuran bulanan</CardTitle>
        <CardDescription>
          Nominal ini digunakan untuk tagihan baru. Tagihan yang sudah dibuat tidak berubah.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={saveSettings} className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <label className="grid flex-1 gap-1.5 text-sm font-medium">
            Nominal iuran per bulan (rupiah)
            <input
              type="number"
              min={minimumAmount}
              step="1"
              required
              disabled={loading || saving || monthlyDues === null}
              value={monthlyDues ?? ""}
              onChange={(event) => setMonthlyDues(
                event.target.value === "" ? null : Number(event.target.value)
              )}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              aria-describedby="monthly-dues-minimum"
            />
            <span id="monthly-dues-minimum" className="text-xs font-normal text-muted-foreground">
              Minimum {formatRupiah(minimumAmount)} untuk menutup biaya kebersihan dan keamanan.
            </span>
          </label>
          <Button type="submit" disabled={loading || saving || monthlyDues === null}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Menyimpan..." : "Simpan nominal"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
