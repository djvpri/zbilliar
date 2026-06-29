import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // === PLANS ===
  const plans = [
    { id: 'free', nama: 'Free', hargaBulan: 0, hargaTahun: 0, maxMeja: 2, maxUser: 1, fitur: ['meja', 'sesi', 'laporan-harian'], urutan: 1 },
    { id: 'basic', nama: 'Basic', hargaBulan: 100000, hargaTahun: 1000000, maxMeja: 5, maxUser: 3, fitur: ['meja', 'sesi', 'laporan', 'member', 'warung'], urutan: 2 },
    { id: 'pro', nama: 'Pro', hargaBulan: 250000, hargaTahun: 2500000, maxMeja: 15, maxUser: 10, fitur: ['meja', 'sesi', 'laporan', 'member', 'warung', 'reserve', 'multi-shift'], urutan: 3 },
    { id: 'enterprise', nama: 'Enterprise', hargaBulan: 500000, hargaTahun: 5000000, maxMeja: 99, maxUser: 99, fitur: ['meja', 'sesi', 'laporan', 'member', 'warung', 'reserve', 'multi-shift', 'api-access'], urutan: 4 },
  ]

  for (const p of plans) {
    await prisma.plan.upsert({
      where: { id: p.id },
      update: p,
      create: p,
    })
  }

  // === DEMO TENANT ===
  const demoSlug = 'billiard-jaya'
  const existing = await prisma.tenant.findUnique({ where: { slug: demoSlug } })
  if (existing) {
    console.log('Demo tenant already exists, skipping seed')
    return
  }

  const tenant = await prisma.tenant.create({
    data: {
      nama: 'Billiard Jaya',
      slug: demoSlug,
      alamat: 'Jl. Merdeka No. 123, Jakarta',
      telepon: '021-12345678',
      plan: 'pro',
      planExpires: new Date('2027-12-31'),
    }
  })

  // === USERS ===
  const hash = await bcrypt.hash('admin123', 10)
  await prisma.user.create({
    data: { nama: 'Admin Billiard', username: 'admin@billiardjaya.com', password: hash, role: 'ADMIN', tenantId: tenant.id }
  })
  const hash2 = await bcrypt.hash('kasir123', 10)
  await prisma.user.create({
    data: { nama: 'Kasir Billiard', username: 'kasir@billiardjaya.com', password: hash2, role: 'KASIR', tenantId: tenant.id }
  })

  // === MEJA ===
  for (let i = 1; i <= 8; i++) {
    await prisma.meja.create({
      data: { nomor: i, nama: `Meja ${i}`, tenantId: tenant.id }
    })
  }

  // === MENU ===
  const menuItems = [
    { nama: 'Air Mineral', harga: 5000, kategori: 'minuman' },
    { nama: 'Teh Manis', harga: 7000, kategori: 'minuman' },
    { nama: 'Kopi Hitam', harga: 8000, kategori: 'minuman' },
    { nama: 'Jus Jeruk', harga: 10000, kategori: 'minuman' },
    { nama: 'Indomie Goreng', harga: 12000, kategori: 'makanan' },
    { nama: 'Kentang Goreng', harga: 15000, kategori: 'makanan' },
    { nama: 'Pisang Goreng', harga: 10000, kategori: 'makanan' },
    { nama: 'Rokok Surya', harga: 25000, kategori: 'lainnya' },
    { nama: 'Teh Botol', harga: 7000, kategori: 'minuman' },
    { nama: 'Nasi Goreng', harga: 20000, kategori: 'makanan' },
  ]

  for (const m of menuItems) {
    await prisma.menuItem.create({
      data: { ...m, tenantId: tenant.id }
    })
  }

  // === MEMBER ===
  const members = [
    { nama: 'Budi Santoso', telp: '08123456789' },
    { nama: 'Siti Rahmawati', telp: '08198765432' },
    { nama: 'Ahmad Fauzi', telp: '08561122334' },
  ]
  for (const m of members) {
    await prisma.member.create({
      data: { ...m, tenantId: tenant.id, level: 'SILVER' }
    })
  }

  console.log('Seed completed!')
  console.log(`Tenant: ${tenant.nama} (${tenant.slug})`)
  console.log('Login: admin@billiardjaya.com / admin123')
  console.log('Login: kasir@billiardjaya.com / kasir123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
