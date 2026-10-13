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

<<<<<<< HEAD
type UnpaidDue = {
  id: string;
  user_id: string;
  amount: number;
  resident: PaymentRequest["resident"];
};

=======
>>>>>>> e3b245bd40389fcb388fa69dac567f5617ff8cf6
type ApiResponse<T> = {
  success?: boolean;
  data?: T;
  error?: string;
};

export default function AdminIuranPage() {
  const [period, setPeriod] = React.useState(() => new Date().toISOString().slice(0, 7));
  const [requests, setRequests] = React.useState<PaymentRequest[]>([]);
<<<<<<< HEAD
  const [unpaidDues, setUnpaidDues] = React.useState<UnpaidDue[]>([]);
=======
>>>>>>> e3b245bd40389fcb388fa69dac567f5617ff8cf6
  const [loading, setLoading] = React.useState(true);
  const [generating, setGenerating] = React.useState(false);
  const [verifyingId, setVerifyingId] = React.useState<string | null>(null);

<<<<<<< HEAD
  const loadDues = React.useCallback(async (signal?: AbortSignal) => {
    try {
      const requestsParams = new URLSearchParams({ period, status: "awaiting_verification" });
      const unpaidParams = new URLSearchParams({ period, status: "pending" });
      const [requestsResponse, unpaidResponse] = await Promise.all([
        fetch(`/api/dues?${requestsParams}`, { signal }),
        fetch(`/api/dues?${unpaidParams}`, { signal }),
      ]);
      const [requestsResult, unpaidResult] = await Promise.all([
        requestsResponse.json() as Promise<ApiResponse<PaymentRequest[]>>,
        unpaidResponse.json() as Promise<ApiResponse<UnpaidDue[]>>,
      ]);
      if (!requestsResponse.ok || !requestsResult.success || !requestsResult.data) {
        throw new Error(requestsResult.error || "Gagal memuat pengajuan pembayaran.");
      }
      if (!unpaidResponse.ok || !unpaidResult.success || !unpaidResult.data) {
        throw new Error(unpaidResult.error || "Gagal memuat daftar warga yang belum membayar.");
      }
      if (!signal?.aborted) {
        setRequests(requestsResult.data);
        setUnpaidDues(unpaidResult.data);
      }
    } catch (error) {
      if (!signal?.aborted) {
        toast.error(error instanceof Error ? error.message : "Gagal memuat data iuran.");
=======
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
>>>>>>> e3b245bd40389fcb388fa69dac567f5617ff8cf6
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [period]);

  React.useEffect(() => {
    const controller = new AbortController();
<<<<<<< HEAD
    const requestsParams = new URLSearchParams({ period, status: "awaiting_verification" });
    const unpaidParams = new URLSearchParams({ period, status: "pending" });
    void Promise.all([
      fetch(`/api/dues?${requestsParams}`, { signal: controller.signal }),
      fetch(`/api/dues?${unpaidParams}`, { signal: controller.signal }),
    ])
      .then(async ([requestsResponse, unpaidResponse]) => {
        const [requestsResult, unpaidResult] = await Promise.all([
          requestsResponse.json() as Promise<ApiResponse<PaymentRequest[]>>,
          unpaidResponse.json() as Promise<ApiResponse<UnpaidDue[]>>,
        ]);
        if (!requestsResponse.ok || !requestsResult.success || !requestsResult.data) {
          throw new Error(requestsResult.error || "Gagal memuat pengajuan pembayaran.");
        }
        if (!unpaidResponse.ok || !unpaidResult.success || !unpaidResult.data) {
          throw new Error(unpaidResult.error || "Gagal memuat daftar warga yang belum membayar.");
        }
        if (!controller.signal.aborted) {
          setRequests(requestsResult.data);
          setUnpaidDues(unpaidResult.data);
        }
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          toast.error(error instanceof Error ? error.message : "Gagal memuat data iuran.");
=======
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
>>>>>>> e3b245bd40389fcb388fa69dac567f5617ff8cf6
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
<<<<<<< HEAD
=======

>>>>>>> e3b245bd40389fcb388fa69dac567f5617ff8cf6
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
<<<<<<< HEAD
      await loadDues();
=======
      await loadRequests();
>>>>>>> e3b245bd40389fcb388fa69dac567f5617ff8cf6
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
<<<<<<< HEAD
      await loadDues();
=======
      await loadRequests();
>>>>>>> e3b245bd40389fcb388fa69dac567f5617ff8cf6
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
<<<<<<< HEAD
        description="Buat tagihan periode, lihat warga yang belum membayar, dan verifikasi pembayaran masuk."
=======
        description="Buat tagihan periode berjalan dan verifikasi pembayaran sebelum dicatat sebagai pemasukan kas."
>>>>>>> e3b245bd40389fcb388fa69dac567f5617ff8cf6
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
<<<<<<< HEAD

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4 text-rose-600" />
            Warga belum membayar
          </CardTitle>
          <CardDescription>
            Daftar ini mencakup warga dengan tagihan berstatus belum lunas pada periode terpilih.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Memuat daftar warga...
            </p>
          ) : unpaidDues.length === 0 ? (
            <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
              Tidak ada tagihan belum lunas untuk periode ini. Buat tagihan periode jika belum tersedia.
            </p>
          ) : (
            <div className="divide-y">
              {unpaidDues.map((due) => (
                <div key={due.id} className="flex items-center justify-between gap-4 py-3">
                  <div>
                    <p className="font-semibold">{due.resident?.nama ?? "Warga"}</p>
                    <p className="text-sm text-muted-foreground">
                      {[due.resident?.blok, due.resident?.no_rumah].filter(Boolean).join(" / ") || due.user_id}
                    </p>
                  </div>
                  <span className="shrink-0 font-semibold">{formatRupiah(due.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
=======
>>>>>>> e3b245bd40389fcb388fa69dac567f5617ff8cf6
    </div>
  );
}
