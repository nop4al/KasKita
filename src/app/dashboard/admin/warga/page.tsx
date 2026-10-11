"use client";

import * as React from "react";
import {
  Users,
  UserPlus,
  Search,
  CheckCircle2,
  Clock,
  Shield,
  Phone,
  Home,
  Mail,
  RefreshCw,
  UserCheck,
  AlertCircle,
  Filter,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface WargaUser {
  id: string;
  nama: string;
  email: string;
  role: "admin" | "warga";
  status: "active" | "pending";
  noRumah?: string;
  noHP?: string;
  blok?: string;
  createdAt: string;
}

export default function MonitoringWargaPage() {
  const [users, setUsers] = React.useState<WargaUser[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState<"all" | "active" | "pending">("all");
  const [approvingId, setApprovingId] = React.useState<string | null>(null);

  // Form tambah warga oleh admin
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [addingUser, setAddingUser] = React.useState(false);
  const [formData, setFormData] = React.useState({
    nama: "",
    email: "",
    password: "",
    noRumah: "",
    blok: "",
    noHP: "",
  });

  const fetchUsers = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setUsers(json.data);
      } else {
        toast.error(json.error || "Gagal memuat data warga.");
      }
    } catch {
      toast.error("Terjadi kesalahan saat mengambil data.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleApprove = async (id: string, nama: string) => {
    setApprovingId(id);
    try {
      const res = await fetch(`/api/users/${id}/approve`, {
        method: "PATCH",
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Akun "${nama}" berhasil disetujui!`);
        fetchUsers();
      } else {
        toast.error(data.error || "Gagal menyetujui akun.");
      }
    } catch {
      toast.error("Terjadi kesalahan koneksi.");
    } finally {
      setApprovingId(null);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingUser(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setShowAddModal(false);
        setFormData({
          nama: "",
          email: "",
          password: "",
          noRumah: "",
          blok: "",
          noHP: "",
        });
        fetchUsers();
      } else {
        toast.error(data.error || "Gagal menambahkan warga.");
      }
    } catch {
      toast.error("Tidak bisa terhubung ke server.");
    } finally {
      setAddingUser(false);
    }
  };

  // Metrik Data Warga
  const totalWarga = users.filter((u) => u.role === "warga").length;
  const activeWarga = users.filter((u) => u.role === "warga" && u.status === "active").length;
  const pendingWarga = users.filter((u) => u.status === "pending").length;

  // Filter Data
  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.noRumah && u.noRumah.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.blok && u.blok.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchSearch) return false;
    if (filterStatus === "active") return u.status === "active";
    if (filterStatus === "pending") return u.status === "pending";
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <PageHeader
        categoryText="KasKita · Kelola Data Lingkungan"
        badgeText="Panel Pengurus"
        title="Monitoring Data Warga & Verifikasi Akun"
        description="Pantau seluruh warga yang terdaftar, setujui permohonan registrasi mandiri, dan tambahkan data warga baru."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchUsers}
              disabled={loading}
              className="text-xs h-9.5 rounded-xl gap-1.5 font-bold"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </Button>
            <Button
              size="sm"
              onClick={() => setShowAddModal(true)}
              className="text-xs h-9.5 rounded-xl gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs"
            >
              <UserPlus className="h-4 w-4" />
              <span>+ Tambah Warga Baru</span>
            </Button>
          </div>
        }
      />

      {/* 3 Kartu Ringkasan Status Warga */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-5">
        <StatCard
          badgeText="TERDAFTAR"
          title="Total Warga Terdata"
          value={`${totalWarga} Orang`}
          isCurrency={false}
          icon={Users}
          variant="emerald"
          description="Total warga RT 04 yang tercatat di sistem"
          subLabel="Status Sistem"
          subValue="Aktif Sinkron"
        />
        <StatCard
          badgeText="SUDAH DIVERIFIKASI"
          title="Warga Aktif"
          value={`${activeWarga} Warga`}
          isCurrency={false}
          icon={CheckCircle2}
          variant="emerald"
          description="Bisa login dan melihat kwitansi serta kas RT"
          subLabel="Akses Portal"
          subValue="Diizinkan"
        />
        <StatCard
          badgeText="PERLU PERSETUJUAN"
          title="Menunggu Persetujuan"
          value={`${pendingWarga} Pendaftar`}
          isCurrency={false}
          icon={Clock}
          variant={pendingWarga > 0 ? "rose" : "neutral"}
          description="Daftar mandiri dari warga yang butuh approval"
          subLabel="Tindakan"
          subValue={pendingWarga > 0 ? "Perlu Ditinjau" : "Semua Beres"}
        />
      </section>

      {/* Tabel Monitoring Data Warga */}
      <Card className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50/70 dark:bg-zinc-800/40 p-5 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-base font-extrabold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <Users className="h-4.5 w-4.5 text-emerald-600" />
                <span>Daftar Akun & Data Warga RT 04</span>
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Total {filteredUsers.length} akun ditampilkan
              </CardDescription>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Cari nama, email, blok..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-9.5 text-xs rounded-xl w-full sm:w-60 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700"
                />
              </div>

              <div className="flex items-center gap-1 bg-slate-200/60 dark:bg-zinc-800/80 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setFilterStatus("all")}
                  className={`px-2.5 py-1 text-xs rounded-lg font-bold transition-colors ${
                    filterStatus === "all"
                      ? "bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs"
                      : "text-slate-600 dark:text-zinc-400 hover:text-slate-900"
                  }`}
                >
                  Semua ({users.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterStatus("active")}
                  className={`px-2.5 py-1 text-xs rounded-lg font-bold transition-colors ${
                    filterStatus === "active"
                      ? "bg-white dark:bg-zinc-700 text-emerald-600 dark:text-emerald-400 shadow-xs"
                      : "text-slate-600 dark:text-zinc-400 hover:text-slate-900"
                  }`}
                >
                  Aktif ({users.filter((u) => u.status === "active").length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterStatus("pending")}
                  className={`px-2.5 py-1 text-xs rounded-lg font-bold transition-colors ${
                    filterStatus === "pending"
                      ? "bg-white dark:bg-zinc-700 text-amber-600 dark:text-amber-400 shadow-xs"
                      : "text-slate-600 dark:text-zinc-400 hover:text-slate-900"
                  }`}
                >
                  Pending ({pendingWarga})
                </button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/30">
                <TableHead className="font-bold text-xs text-slate-700 dark:text-zinc-300 py-3.5 pl-6">
                  Nama Warga
                </TableHead>
                <TableHead className="font-bold text-xs text-slate-700 dark:text-zinc-300 py-3.5">
                  Kontak / Email
                </TableHead>
                <TableHead className="font-bold text-xs text-slate-700 dark:text-zinc-300 py-3.5">
                  Alamat Rumah
                </TableHead>
                <TableHead className="font-bold text-xs text-slate-700 dark:text-zinc-300 py-3.5">
                  Peran (Role)
                </TableHead>
                <TableHead className="font-bold text-xs text-slate-700 dark:text-zinc-300 py-3.5">
                  Status Akun
                </TableHead>
                <TableHead className="font-bold text-xs text-slate-700 dark:text-zinc-300 py-3.5 text-right pr-6">
                  Aksi
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-xs text-slate-500">
                    <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-emerald-600" />
                    Memuat data warga...
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-xs text-slate-500">
                    <AlertCircle className="h-6 w-6 mx-auto mb-2 text-slate-400" />
                    Tidak ada data warga yang cocok dengan filter.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((item) => (
                  <TableRow
                    key={item.id}
                    className="border-b border-slate-100 dark:border-zinc-800 hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    <TableCell className="font-bold text-slate-900 dark:text-zinc-100 text-xs sm:text-sm py-4 pl-6">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0">
                          {item.nama.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-900 dark:text-zinc-100">{item.nama}</p>
                          <span className="text-[11px] font-normal text-slate-400 font-mono">
                            ID: {item.id}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="text-xs text-slate-600 dark:text-zinc-400 py-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-zinc-200">
                          <Mail className="h-3 w-3 text-slate-400" />
                          <span>{item.email}</span>
                        </div>
                        {item.noHP && (
                          <div className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-400">
                            <Phone className="h-3 w-3 text-slate-400" />
                            <span>{item.noHP}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="text-xs text-slate-700 dark:text-zinc-300 py-4">
                      <div className="flex items-center gap-1.5">
                        <Home className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>
                          {item.blok || "RT 04"} · No. {item.noRumah || "-"}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="py-4">
                      {item.role === "admin" ? (
                        <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-none font-bold text-[11px] gap-1">
                          <Shield className="h-3 w-3" />
                          <span>Pengurus / Bendahara</span>
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-slate-600 dark:text-zinc-300 font-semibold text-[11px]">
                          Warga
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell className="py-4">
                      {item.status === "active" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="h-3 w-3" />
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          <Clock className="h-3 w-3" />
                          Pending (Menunggu)
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="text-right pr-6 py-4">
                      {item.status === "pending" ? (
                        <Button
                          size="sm"
                          onClick={() => handleApprove(item.id, item.nama)}
                          disabled={approvingId === item.id}
                          className="h-8 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg gap-1.5 shadow-xs"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>{approvingId === item.id ? "Menyetujui..." : "Setujui Akun"}</span>
                        </Button>
                      ) : (
                        <span className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500">
                          Terverifikasi
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal / Dialog Tambah Warga Baru */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in-0 duration-150">
          <Card className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl overflow-hidden">
            <CardHeader className="bg-slate-50 dark:bg-zinc-800/50 p-5 border-b border-slate-100 dark:border-zinc-800">
              <CardTitle className="text-base font-extrabold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-emerald-600" />
                <span>Tambah & Daftarkan Warga Baru</span>
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-zinc-400">
                Warga yang didaftarkan oleh admin akan langsung berstatus <b>Aktif</b> dan dapat login.
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleAddSubmit}>
              <CardContent className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                    Nama Lengkap Warga
                  </label>
                  <Input
                    required
                    placeholder="Contoh: Pak Suparman"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    className="h-10 text-xs rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                      Alamat Email
                    </label>
                    <Input
                      required
                      type="email"
                      placeholder="suparman@warga.rt04"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="h-10 text-xs rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                      Password Akun
                    </label>
                    <Input
                      required
                      type="password"
                      placeholder="Minimal 6 karakter"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="h-10 text-xs rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                      No. Rumah
                    </label>
                    <Input
                      placeholder="Misal: 15"
                      value={formData.noRumah}
                      onChange={(e) => setFormData({ ...formData, noRumah: e.target.value })}
                      className="h-10 text-xs rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                      Blok / Gang
                    </label>
                    <Input
                      placeholder="Misal: Gang Cempaka"
                      value={formData.blok}
                      onChange={(e) => setFormData({ ...formData, blok: e.target.value })}
                      className="h-10 text-xs rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                      No. WhatsApp / HP
                    </label>
                    <Input
                      placeholder="08123456789"
                      value={formData.noHP}
                      onChange={(e) => setFormData({ ...formData, noHP: e.target.value })}
                      className="h-10 text-xs rounded-xl"
                    />
                  </div>
                </div>
              </CardContent>

              <div className="p-4 bg-slate-50 dark:bg-zinc-800/40 border-t border-slate-100 dark:border-zinc-800 flex justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                  disabled={addingUser}
                  className="h-9.5 text-xs rounded-xl font-bold"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={addingUser}
                  className="h-9.5 text-xs rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                >
                  {addingUser ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <UserCheck className="h-4 w-4" />
                      <span>Simpan & Aktifkan</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
