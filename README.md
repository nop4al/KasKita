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

---

## 📦 Build Produksi

Untuk melakukan verifikasi build produksi:
```bash
npm run build
npm run start
```
