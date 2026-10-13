"use client";

import * as React from "react";
import Link from "next/link";
import { Check, RefreshCw, Users } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatRupiah } from "@/lib/mock-data";

type PaymentRequest = {
  id: string;
  user_id: string;
  period: string;
  amount: number;
  payment_method: string | null;
  payment_reference: string | null;
  payment_submitted_at: string | null;
  resident: {
    nama: string;
    no_rumah: string | null;
    blok: string | null;
  } | null;
};

type ApiResponse<T> = {
  success?: boolean;
  data?: T;
  error?: string;
};

export default function AdminIuranPage() {
  const [period, setPeriod] = React.useState(() => new Date().toISOString().slice(0, 7));
  const [requests, setRequests] = React.useState<PaymentRequest[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [generating, setGenerating] = React.useState(false);
  const [verifyingId, setVerifyingId] = React.useState<string | null>(null);

  const loadRequests = React.useCallback(async (signal?: AbortSignal) => {
    try {
      const params = new URLSearchParams({
        period,
        status: "awaiting_verification",
      });
      const response = await fetch(`/api/dues?${params}`, { signal });
      const result = await response.json() as ApiResponse<PaymentRequest[]>;
      if (!response.ok || !result.success || !result.data) {
        throw new Error(result.error || "Gagal memuat pengajuan pembayaran.");
      }
      if (!signal?.aborted) setRequests(result.data);
    } catch (error) {
      if (!signal?.aborted) {
        toast.error(error instanceof Error ? error.message : "Gagal memuat pengajuan pembayaran.");
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [period]);

  React.useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({
      period,
      status: "awaiting_verification",
    });

    void fetch(`/api/dues?${params}`, { signal: controller.signal })
      .then(async (response) => {
        const result = await response.json() as ApiResponse<PaymentRequest[]>;
        if (!response.ok || !result.success || !result.data) {
          throw new Error(result.error || "Gagal memuat pengajuan pembayaran.");
        }
        if (!controller.signal.aborted) setRequests(result.data);
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          toast.error(error instanceof Error
            ? error.message
            : "Gagal memuat pengajuan pembayaran.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [period]);

  async function handleGenerateInvoices() {
    setGenerating(true);
    try {
      const response = await fetch("/api/dues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ period: `${period}-01` }),
      });
      const result = await response.json() as ApiResponse<{
        generated_count: number;
        updated_count: number;
        skipped_count: number;
      }>;
      if (!response.ok || !result.success || !result.data) {
        throw new Error(result.error || "Gagal membuat tagihan.");
      }
      toast.success(
        `Tagihan diproses: ${result.data.generated_count} dibuat, ${result.data.updated_count} diperbarui, ${result.data.skipped_count} dilewati.`
      );
      setLoading(true);
      await loadRequests();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal membuat tagihan.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleVerify(requestItem: PaymentRequest) {
    setVerifyingId(requestItem.id);
    try {
      const response = await fetch(`/api/dues/${requestItem.id}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentMethod: requestItem.payment_method || "cash",
          paymentReference: requestItem.payment_reference,
        }),
      });
      const result = await response.json() as ApiResponse<unknown>;
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Gagal memverifikasi pembayaran.");
      }
      toast.success("Pembayaran diverifikasi dan dicatat di buku kas.");
      await loadRequests();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal memverifikasi pembayaran.");
    } finally {
      setVerifyingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        categoryText="KasKita · Panel Pengurus"
        badgeText="Verifikasi pembayaran"
        title="Kelola Iuran Warga"
        description="Buat tagihan periode berjalan dan verifikasi pembayaran sebelum dicatat sebagai pemasukan kas."
        actions={
          <Link
            href="/dashboard/admin"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Kembali ke Ringkasan
          </Link>
        }
      />

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4 text-emerald-600" />
            Tagihan dan pengajuan pembayaran
          </CardTitle>
          <CardDescription>
            Warga tetap berstatus menunggu verifikasi sampai pengurus mengonfirmasi pembayaran.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="grid gap-1.5 text-sm font-medium">
              Periode
              <input
                type="month"
                value={period}
                onChange={(event) => {
                  setLoading(true);
                  setPeriod(event.target.value);
                }}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              />
            </label>
            <Button onClick={handleGenerateInvoices} disabled={generating || !period}>
              <RefreshCw className={`mr-2 h-4 w-4 ${generating ? "animate-spin" : ""}`} />
              {generating ? "Memproses..." : "Buat tagihan periode"}
            </Button>
          </div>

          {loading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Memuat pengajuan pembayaran...
            </p>
          ) : requests.length === 0 ? (
            <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
              Belum ada pengajuan pembayaran yang menunggu verifikasi untuk periode ini.
            </p>
          ) : (
            <div className="space-y-3">
              {requests.map((requestItem) => (
                <div
                  key={requestItem.id}
                  className="flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-1">
                    <p className="font-semibold">
                      {requestItem.resident?.nama ?? "Warga"}{" "}
                      <span className="text-sm font-normal text-muted-foreground">
                        {[
                          requestItem.resident?.blok,
                          requestItem.resident?.no_rumah,
                        ].filter(Boolean).join(" / ") || `ID ${requestItem.user_id}`}
                      </span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {requestItem.payment_method || "Metode belum dicantumkan"}
                      {requestItem.payment_reference
                        ? ` · Referensi: ${requestItem.payment_reference}`
                        : ""}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Diajukan: {requestItem.payment_submitted_at
                        ? new Date(requestItem.payment_submitted_at).toLocaleString("id-ID")
                        : "—"}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <span className="font-bold">{formatRupiah(requestItem.amount)}</span>
                    <Button
                      size="sm"
                      onClick={() => void handleVerify(requestItem)}
                      disabled={verifyingId !== null}
                    >
                      <Check className="mr-2 h-4 w-4" />
                      {verifyingId === requestItem.id ? "Memverifikasi..." : "Verifikasi"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
