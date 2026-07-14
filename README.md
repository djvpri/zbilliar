# Biliar Pro

Sistem manajemen rental biliar berbasis web — Next.js 14 + PostgreSQL + Railway.

## Fitur
- **Dashboard meja** — timer real-time per meja, mulai/checkout/reserve
- **Kasir otomatis** — hitung tarif per jam, cetak ringkasan
- **Warung** — penjualan minuman & makanan dengan keranjang
- **Member** — daftar member, poin otomatis per transaksi
- **Laporan** — omzet harian/mingguan/bulanan, statistik per meja
- **Shift** — ganti operator, riwayat shift & pendapatan

## Stack
- **Frontend**: Next.js 14 App Router, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL via Prisma ORM
- **Hosting**: Railway
- **Auth**: JWT (cookie httpOnly)

## Setup Lokal

```bash
# 1. Clone & install
git clone <repo-url>
cd biliar-pro
npm install

# 2. Setup env
cp .env.example .env
# Edit .env — isi DATABASE_URL dengan PostgreSQL lokal

# 3. Setup database
npm run db:push       # buat tabel
npm run db:seed       # isi data awal

# 4. Jalankan
npm run dev
```

Buka http://localhost:3000
- Admin: `admin` / `admin123`
- Kasir: `kasir1` / `kasir123`

## Deploy ke Railway

### 1. Buat project di Railway
1. Buka [railway.app](https://railway.app) → New Project
2. Pilih **Deploy from GitHub repo**
3. Connect repo ini

### 2. Tambah PostgreSQL
1. Di project Railway → **+ New** → **Database** → **PostgreSQL**
2. Salin `DATABASE_URL` dari tab **Connect**

### 3. Set environment variables
Di Railway project → tab **Variables**:
```
DATABASE_URL=postgresql://...  (dari PostgreSQL service)
JWT_SECRET=your-secret-key-min-32-chars
NODE_ENV=production
```

### 4. Deploy
Railway otomatis build & deploy. Perintah start:
```
npm run db:migrate && npm run db:seed && npm start
```

### 5. Custom domain (opsional)
Di tab **Settings** → **Domains** → Generate domain atau pasang domain sendiri.

## Struktur Proyek

```
src/
├── app/
│   ├── api/
│   │   ├── auth/login/      # POST login
│   │   ├── auth/logout/     # POST logout
│   │   ├── meja/            # GET daftar meja
│   │   ├── meja/sesi/       # POST mulai/checkout/reserve
│   │   ├── warung/menu/     # GET/POST menu
│   │   ├── warung/transaksi/ # POST transaksi warung
│   │   ├── member/          # GET/POST member
│   │   ├── laporan/         # GET laporan omzet
│   │   └── shift/           # GET/POST shift
│   ├── dashboard/
│   │   ├── page.tsx         # Halaman meja (index)
│   │   ├── warung/          # Halaman warung
│   │   ├── member/          # Halaman member
│   │   ├── laporan/         # Halaman laporan
│   │   └── shift/           # Halaman shift
│   └── login/               # Halaman login
├── components/
│   └── Navbar.tsx
└── lib/
    ├── prisma.ts            # Prisma client singleton
    ├── auth.ts              # JWT helpers
    └── utils.ts             # Format rupiah, durasi, dll
prisma/
├── schema.prisma            # Definisi tabel
└── seed.ts                  # Data awal (10 meja, menu, user)
```

## Sistem Demo (reset harian)

Pola demo ekosistem Zomet: SATU tenant demo bersama, direset ke kondisi bersih
1×/hari oleh cron.

- **Tenant demo**: `billiard-jaya` (dari seed), ditandai `isDemo=true` (migrasi
  `add_tenant_isdemo`). Login: `admin@billiardjaya.com` / `admin123`.
- **Data demo** diisi oleh [`src/lib/demo-seed.ts`](src/lib/demo-seed.ts)
  (`seedDataDemo` / `bersihkanDataToko`) — 8 meja, menu warung, member, riwayat
  sesi & transaksi 14 hari, beberapa meja AKTIF/RESERVED "sekarang". Timestamp
  **relatif ke `now()`**. User/Tenant TIDAK dihapus, hanya data operasionalnya.
- **Endpoint**:
  - `POST /api/demo/reset-daily` — dipanggil cron, proteksi header
    `Authorization: Bearer <DEMO_RESET_SECRET>` (fail-closed). Cari semua
    `isDemo=true` → bersihkan + seed.
  - `POST /api/demo/reset` — "Reset Demo" manual (JWT), guard KRUSIAL `isDemo`.
- **Env service utama**: `DEMO_RESET_SECRET=<secret-khusus-app-ini>`.
- **Cron (compassionate-optimism, satu untuk banyak app)**: tambah app ini ke
  `DEMO_RESET_TARGETS`, format `url|secret` dipisah koma:
  ```
  DEMO_RESET_TARGETS=https://zpos.zomet.my.id|secretZpos,https://zbilliar.zomet.my.id|secretZbilliar
  ```
  Cron POST ke `https://zbilliar.zomet.my.id/api/demo/reset-daily`.

## Pengembangan Lanjutan
- [ ] Cetak struk (PDF/thermal printer)
- [ ] Notifikasi WhatsApp untuk member
- [ ] Sistem reservasi online
- [ ] Laporan export Excel
- [ ] Multi-cabang
