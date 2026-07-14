import { prisma } from './prisma'

// Data demo rental biliar — dipakai sistem demo (reset harian oleh cron via
// /api/demo/reset-daily). Sesi & transaksi dibuat RELATIF ke now() supaya demo
// selalu terlihat "baru terjadi", kapan pun dibuka. TIDAK menyentuh User/Tenant.

const MENU = [
  { nama: 'Air Mineral', harga: 5000, kategori: 'minuman' },
  { nama: 'Teh Manis', harga: 7000, kategori: 'minuman' },
  { nama: 'Kopi Hitam', harga: 8000, kategori: 'minuman' },
  { nama: 'Jus Jeruk', harga: 10000, kategori: 'minuman' },
  { nama: 'Indomie Goreng', harga: 12000, kategori: 'makanan' },
  { nama: 'Kentang Goreng', harga: 15000, kategori: 'makanan' },
  { nama: 'Pisang Goreng', harga: 10000, kategori: 'makanan' },
  { nama: 'Nasi Goreng', harga: 20000, kategori: 'makanan' },
  { nama: 'Teh Botol', harga: 7000, kategori: 'minuman' },
  { nama: 'Rokok Surya', harga: 25000, kategori: 'lainnya' },
]
const NAMA = ['Budi', 'Andi', 'Rian', 'Dewi', 'Sari', 'Joko', 'Eko', 'Maya', 'Hendra', 'Citra', 'Bagus', 'Fajar']
const MEMBER = [
  { nama: 'Budi Santoso', telp: '08123456789', level: 'GOLD', poin: 320 },
  { nama: 'Siti Rahmawati', telp: '08198765432', level: 'SILVER', poin: 85 },
  { nama: 'Ahmad Fauzi', telp: '08561122334', level: 'PLATINUM', poin: 640 },
  { nama: 'Rina Marlina', telp: '08771234567', level: 'SILVER', poin: 40 },
]
const TARIF = 30000 // per jam
const HARI = 14
const JUMLAH_MEJA = 8

function acak(a: number, b: number) { return Math.floor(Math.random() * (b - a + 1)) + a }
function pilih<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }
const bulat500 = (n: number) => Math.round(n / 500) * 500

// Hapus data operasional & katalog milik satu tenant (TIDAK menghapus
// User/Tenant). Urutan anak→induk supaya tidak kena pelanggaran FK.
export async function bersihkanDataToko(tenantId: string): Promise<void> {
  await prisma.transaksi.deleteMany({ where: { tenantId } })
  await prisma.sesi.deleteMany({ where: { tenantId } })
  await prisma.shift.deleteMany({ where: { tenantId } })
  await prisma.member.deleteMany({ where: { tenantId } })
  await prisma.menuItem.deleteMany({ where: { tenantId } })
  await prisma.meja.deleteMany({ where: { tenantId } })
  await prisma.tenantCounter.deleteMany({ where: { tenantId } })
}

export async function seedDataDemo(tenantId: string): Promise<void> {
  // Perlu satu user (kasir) untuk userId transaksi — pakai user tenant yang ada.
  const userDemo = await prisma.user.findFirst({ where: { tenantId }, orderBy: { createdAt: 'asc' } })
  if (!userDemo) return
  const userId = userDemo.id

  // Meja
  const mejaIds: number[] = []
  for (let i = 1; i <= JUMLAH_MEJA; i++) {
    const m = await prisma.meja.create({ data: { nomor: i, nama: `Meja ${i}`, tenantId } })
    mejaIds.push(m.id)
  }

  // Menu warung
  for (const m of MENU) await prisma.menuItem.create({ data: { ...m, tenantId } })

  // Member
  const memberIds: string[] = []
  for (const mb of MEMBER) {
    const m = await prisma.member.create({ data: { nama: mb.nama, telp: mb.telp, level: mb.level as never, poin: mb.poin, tenantId } })
    memberIds.push(m.id)
  }

  const now = new Date()

  // Riwayat 14 hari: sesi SEWA (SELESAI) + transaksi + transaksi warung
  for (let h = HARI - 1; h >= 0; h--) {
    const jumlahSesi = acak(3, 8)
    for (let s = 0; s < jumlahSesi; s++) {
      const jamMaks = h === 0 ? Math.max(10, now.getHours() - 1) : 22
      if (h === 0 && jamMaks < 10) continue
      const mulai = new Date(now); mulai.setDate(mulai.getDate() - h); mulai.setHours(acak(10, jamMaks), acak(0, 59), 0, 0)
      const durasi = acak(30, 180) // menit
      const selesai = new Date(mulai.getTime() + durasi * 60000)
      const biaya = bulat500((TARIF * durasi) / 60)
      const memberId = Math.random() < 0.3 && memberIds.length ? pilih(memberIds) : null
      const sesi = await prisma.sesi.create({
        data: { mejaId: pilih(mejaIds), tenantId, pelanggan: pilih(NAMA), memberId, tarif: TARIF, mulai, selesai, durasi, biaya, status: 'SELESAI', createdAt: mulai },
      })
      await prisma.transaksi.create({
        data: { sesiId: sesi.id, userId, jenis: 'SEWA', total: biaya, bayar: Math.ceil(biaya / 5000) * 5000, tenantId, createdAt: selesai },
      })
    }

    const jumlahWarung = acak(2, 6)
    for (let w = 0; w < jumlahWarung; w++) {
      const jamMaks = h === 0 ? Math.max(10, now.getHours()) : 22
      if (h === 0 && jamMaks < 10) continue
      const waktu = new Date(now); waktu.setDate(waktu.getDate() - h); waktu.setHours(acak(10, jamMaks), acak(0, 59), 0, 0)
      const items = Array.from({ length: acak(1, 3) }, () => { const mi = pilih(MENU); const qty = acak(1, 3); return { nama: mi.nama, harga: mi.harga, qty, subtotal: mi.harga * qty } })
      const total = items.reduce((a, it) => a + it.subtotal, 0)
      const bayar = Math.ceil(total / 5000) * 5000
      await prisma.transaksi.create({
        data: { userId, jenis: 'WARUNG', total, items, bayar, kembalian: bayar - total, tenantId, createdAt: waktu },
      })
    }
  }

  // Sesi AKTIF "sekarang" (meja sedang dipakai) → dashboard timer jalan
  const dipakai = new Set<number>()
  const jmlAktif = acak(1, 3)
  for (let a = 0; a < jmlAktif && a < mejaIds.length; a++) {
    let mid = pilih(mejaIds), guard = 0
    while (dipakai.has(mid) && guard++ < 10) mid = pilih(mejaIds)
    dipakai.add(mid)
    const mulai = new Date(now.getTime() - acak(15, 120) * 60000)
    await prisma.sesi.create({ data: { mejaId: mid, tenantId, pelanggan: pilih(NAMA), tarif: TARIF, mulai, status: 'AKTIF', createdAt: mulai } })
  }

  // Satu meja RESERVED
  const sisa = mejaIds.filter((m) => !dipakai.has(m))
  if (sisa.length) {
    await prisma.sesi.create({ data: { mejaId: pilih(sisa), tenantId, pelanggan: pilih(NAMA), tarif: TARIF, status: 'RESERVED' } })
  }

  // Shift operator hari ini
  await prisma.shift.create({ data: { userId, tenantId, mulai: new Date(now.getTime() - acak(2, 6) * 3600000), totalSesi: acak(5, 20), totalPendapatan: acak(50, 300) * 10000 } })
}
