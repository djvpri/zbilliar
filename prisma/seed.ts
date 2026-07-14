import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { bersihkanDataToko, seedDataDemo } from '../src/lib/demo-seed'

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
    await prisma.plan.upsert({ where: { id: p.id }, update: p, create: p })
  }
  console.log('Plans: OK')

  // === DEMO TENANT + USERS ===
  const demoSlug = 'billiard-jaya'
  let tenant = await prisma.tenant.findUnique({ where: { slug: demoSlug } })

  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: {
        nama: 'Billiard Jaya',
        slug: demoSlug,
        alamat: 'Jl. Merdeka No. 123, Jakarta',
        telepon: '021-12345678',
        plan: 'pro',
        planExpires: new Date('2027-12-31'),
        isDemo: true,
      },
    })

    const hash = await bcrypt.hash('admin123', 10)
    await prisma.user.create({
      data: { nama: 'Akun Demo', username: 'demo@zomet.my.id', password: hash, role: 'ADMIN', tenantId: tenant.id },
    })
    const hash2 = await bcrypt.hash('kasir123', 10)
    await prisma.user.create({
      data: { nama: 'Kasir Billiard', username: 'kasir@billiardjaya.com', password: hash2, role: 'KASIR', tenantId: tenant.id },
    })
    console.log('Tenant + users: created')
  } else {
    console.log('Tenant: already exists, re-seeding data...')
  }

  // === SEED DATA DEMO (meja, menu, member, history) ===
  await bersihkanDataToko(tenant.id)
  await seedDataDemo(tenant.id)

  console.log('Seed selesai!')
  console.log(`Tenant: ${tenant.nama} (${tenant.slug})`)
  console.log('Login admin : demo@zomet.my.id / admin123')
  console.log('Login kasir : kasir@billiardjaya.com / kasir123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
