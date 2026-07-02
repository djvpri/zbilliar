// Seed data DEMO untuk ZBilliar — mengisi tenant akun demo dengan meja, member,
// menu warung, sesi biliar, transaksi (sewa + warung), dan shift, tersebar ~6 minggu.
//
// IDEMPOTENT / RESET MANUAL: tiap dijalankan, data demo lama tenant ini DIHAPUS
// lalu diisi ulang (user/tenant TIDAK dihapus). Reset:  node scripts/seed-demo.js
// Target tenant: env DEMO_SLUG (default 'demo'), fallback tenant pertama.

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const DEMO_SLUG = process.env.DEMO_SLUG || 'demo'
const now = new Date()
const rint = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
function daysAgo(n, hour) {
  const d = new Date(now); d.setDate(d.getDate() - n)
  d.setHours(hour != null ? hour : rint(13, 23), rint(0, 59), 0, 0); return d
}

const NAMA = ['Budi', 'Andi', 'Rizky', 'Agus', 'Hendra', 'Bayu', 'Eko', 'Dimas', 'Fajar', 'Yoga',
  'Reza', 'Galih', 'Aldi', 'Putra', 'Wahyu', 'Joko', 'Surya', 'Rian']
const MENU = [
  ['Kopi Hitam', 8000, 'minuman'], ['Es Teh', 5000, 'minuman'], ['Air Mineral', 4000, 'minuman'],
  ['Kopi Susu', 12000, 'minuman'], ['Soft Drink', 8000, 'minuman'], ['Indomie Goreng', 12000, 'makanan'],
  ['Roti Bakar', 15000, 'makanan'], ['Kentang Goreng', 18000, 'makanan'], ['Rokok (bungkus)', 25000, 'lainnya'],
]

async function main() {
  let tenant = await prisma.tenant.findFirst({ where: { slug: DEMO_SLUG } })
  if (!tenant) tenant = await prisma.tenant.findFirst()
  if (!tenant) throw new Error('Tidak ada tenant di ZBilliar. Buat tenant dulu.')
  const tenantId = tenant.id
  const user = await prisma.user.findFirst({ where: { tenantId } })
  if (!user) throw new Error('Tidak ada user di tenant. Buat user dulu.')
  console.log(`Target tenant: ${tenant.nama} (${tenant.slug}) | kasir: ${user.nama}`)

  // RESET
  await prisma.transaksi.deleteMany({ where: { tenantId } })
  await prisma.sesi.deleteMany({ where: { tenantId } })
  await prisma.shift.deleteMany({ where: { tenantId } })
  await prisma.member.deleteMany({ where: { tenantId } })
  await prisma.menuItem.deleteMany({ where: { tenantId } })
  await prisma.meja.deleteMany({ where: { tenantId } })
  console.log('Data demo lama dibersihkan.')

  // Meja (8)
  const meja = []
  for (let i = 1; i <= 8; i++) {
    meja.push(await prisma.meja.create({ data: { tenantId, nomor: i, nama: `Meja ${i}` } }))
  }
  // Member
  const member = []
  for (let i = 0; i < 10; i++) {
    member.push(await prisma.member.create({
      data: { tenantId, nama: `${pick(NAMA)} ${pick(NAMA)}`, telp: `0812${String(rint(10000000, 99999999))}`,
        poin: rint(0, 500), level: pick(['SILVER', 'SILVER', 'GOLD', 'PLATINUM']) },
    }))
  }
  // Menu warung
  const menu = []
  for (const [nama, harga, kategori] of MENU) menu.push(await prisma.menuItem.create({ data: { tenantId, nama, harga, kategori } }))

  // Sesi biliar + transaksi sewa, tersebar ~42 hari
  let sesiCount = 0, trxCount = 0, omzet = 0
  const TARIF = 40000 // per jam
  for (let i = 0; i < 60; i++) {
    const mulai = daysAgo(rint(0, 42))
    const durasi = pick([30, 45, 60, 90, 120])
    const selesai = new Date(mulai.getTime() + durasi * 60000)
    const biaya = Math.round(TARIF * durasi / 60)
    const aktif = false
    const sesi = await prisma.sesi.create({
      data: {
        tenantId, mejaId: pick(meja).id, tarif: TARIF, mulai, selesai, durasi, biaya,
        status: 'SELESAI', memberId: Math.random() < 0.4 ? pick(member).id : null,
        pelanggan: Math.random() < 0.5 ? `${pick(NAMA)}` : null,
      },
    })
    sesiCount++
    // Transaksi SEWA
    const bayar = Math.ceil(biaya / 5000) * 5000
    await prisma.transaksi.create({
      data: { tenantId, sesiId: sesi.id, userId: user.id, jenis: 'SEWA', total: biaya, bayar, kembalian: bayar - biaya, createdAt: selesai },
    })
    trxCount++; omzet += biaya
  }

  // 2 sesi AKTIF (sedang berjalan)
  for (let i = 0; i < 2; i++) {
    await prisma.sesi.create({
      data: { tenantId, mejaId: meja[i].id, tarif: TARIF, mulai: new Date(now.getTime() - rint(20, 80) * 60000), status: 'AKTIF',
        pelanggan: pick(NAMA) },
    })
  }

  // Transaksi WARUNG (makanan/minuman) terpisah
  for (let i = 0; i < 25; i++) {
    const n = rint(1, 3)
    const items = []
    let total = 0
    for (let j = 0; j < n; j++) { const m = pick(menu); const qty = rint(1, 3); items.push({ nama: m.nama, qty, harga: m.harga }); total += m.harga * qty }
    const bayar = Math.ceil(total / 5000) * 5000
    await prisma.transaksi.create({
      data: { tenantId, userId: user.id, jenis: 'WARUNG', total, bayar, kembalian: bayar - total, items, createdAt: daysAgo(rint(0, 42)) },
    })
    trxCount++; omzet += total
  }

  // Shift (beberapa tertutup)
  for (let i = 1; i <= 6; i++) {
    const mulai = daysAgo(i * 6, 13)
    await prisma.shift.create({
      data: { tenantId, userId: user.id, mulai, selesai: new Date(mulai.getTime() + rint(8, 11) * 3600000),
        totalSesi: rint(8, 20), totalPendapatan: rint(800000, 2500000) },
    })
  }

  console.log('✅ Seed demo ZBilliar selesai:')
  console.log(`   meja=${meja.length}, member=${member.length}, menu=${menu.length}, sesi=${sesiCount}, transaksi=${trxCount} (omzet Rp${omzet.toLocaleString('id-ID')})`)
}

main()
  .catch((e) => { console.error('❌', e.message); process.exit(1) })
  .finally(() => prisma.$disconnect())
