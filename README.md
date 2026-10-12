# KasKita 🇮🇩

**KasKita** adalah aplikasi web modern dan bersahabat untuk pengelolaan kas dan iuran rukun tetangga (RT) dan rukun warga (RW) di Indonesia. Dirancang dengan pendekatan anti-slop, mudah dipahami oleh bapak/ibu pengurus RT maupun seluruh warga kampung.

---

## 🌟 Fitur Utama

- **Landing Page Multi-RT**: Halaman depan informatif dengan simulasi pemilihan RT dari berbagai kota di Indonesia.
- **Panel Pengurus RT (`/dashboard/admin`)**:
  - Ringkasan total saldo kas, pemasukan bulan berjalan, dan pengeluaran lingkungan.
  - Catat iuran masuk warga, pengeluaran kas operasional, dan warga baru.
  - Buku kas transparan dengan filter kategori dan pencarian.
  - Integrasi template pengingat iuran langsung ke grup WhatsApp RT.
- **Portal Transparansi Warga (`/dashboard/warga`)**:
  - Kartu status iuran keluarga (Lunas / Belum Bayar).
  - Rincian alokasi biaya lingkungan (sampah, pos ronda, sosial).
  - Tombol bayar cepat via QRIS & kwitansi digital.
  - Buku kas RT terbuka demi transparansi gotong royong.
- **Loading Transition Bersahabat**: Splash screen kas RT minimalis dengan animasi halus.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router & Turbopack)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/) / Base UI
- **Icons**: [Lucide React](https://lucide.dev/)
- **Theme**: Dark / Light Mode via `next-themes`

---

## 🚀 Memulai (Local Setup)

1. **Clone Repository**:
   ```bash
   git clone https://github.com/nop4al/KasKita.git
   cd KasKita
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Jalankan Development Server**:
   ```bash
   npm run dev
   ```

4. **Buka di Browser**:
   Buka [http://localhost:3000](http://localhost:3000) pada browser Anda.
   - Halaman Depan: `http://localhost:3000`
   - Panel Pengurus: `http://localhost:3000/dashboard/admin`
   - Portal Warga: `http://localhost:3000/dashboard/warga`

## 🗄️ Konfigurasi Supabase

KasKita memakai Supabase Auth untuk akun dan sesi, serta PostgreSQL untuk profil,
transaksi kas, dan tagihan iuran.

1. Buat project di [Supabase](https://supabase.com/) dan salin URL project, anon
   key, dan service-role key dari **Project Settings → API Keys**.
2. Salin `.env.example` menjadi `.env.local`, lalu isi nilainya. Jangan pernah
   menambahkan service-role key dengan awalan `NEXT_PUBLIC_` atau memasukkannya
   ke Git.
3. Jalankan `supabase/migrations/20261012000000_initial_schema.sql` pada SQL
   Editor project Supabase.
4. Jalankan aplikasi dan daftarkan akun pertama melalui `/register`. Pastikan
   email dikonfirmasi jika konfirmasi email Supabase aktif. Kemudian jalankan
   SQL berikut dengan email yang sama persis seperti saat mendaftar:

   ```sql
   update public.profiles
   set role = 'admin', status = 'active'
   where email = 'email-admin-anda@example.com';
   ```

   Ganti `email-admin-anda@example.com` dengan email akun Anda. SQL Editor harus
   melaporkan `UPDATE 1`; jika `UPDATE 0`, akun belum terdaftar di project ini
   atau emailnya tidak cocok, jadi akun belum bisa login.

5. Pendaftaran mandiri warga lain akan berstatus pending; admin dapat menyetujui
   akun mereka dari halaman kelola warga.

Migrasi mengaktifkan Row Level Security: warga hanya dapat membaca profil dan
riwayat iurannya sendiri, sedangkan transaksi kas dapat dibaca akun aktif.
Operasi administratif menggunakan `SUPABASE_SERVICE_ROLE_KEY` hanya di server.
Pengaturan awal iuran bulanan adalah Rp50.000 (kebersihan Rp25.000 dan keamanan
Rp25.000, jatuh tempo tanggal 10); sesuaikan baris `app_settings` bila diperlukan.

---

## 📦 Build Produksi

Untuk melakukan verifikasi build produksi:
```bash
npm run build
npm run start
```
