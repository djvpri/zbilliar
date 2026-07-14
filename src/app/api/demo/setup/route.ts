// POST /api/demo/setup — inisialisasi tenant demo setelah deploy
// Dilindungi DEMO_RESET_SECRET, dipanggil manual 1x setelah deployment baru.
export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { bersihkanDataToko, seedDataDemo } from '@/lib/demo-seed'

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization') || ''
  const token = auth.replace('Bearer ', '')
  const secret = process.env.DEMO_RESET_SECRET
  if (!secret || token !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
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
    } else {
      // Pastikan isDemo = true kalau sebelumnya belum di-set
      await prisma.tenant.update({ where: { id: tenant.id }, data: { isDemo: true } })
    }

    await bersihkanDataToko(tenant.id)
    await seedDataDemo(tenant.id)

    return NextResponse.json({
      ok: true,
      tenant: { id: tenant.id, slug: tenant.slug, nama: tenant.nama },
      login: { admin: 'demo@zomet.my.id / admin123', kasir: 'kasir@billiardjaya.com / kasir123' },
    })
  } catch (e: any) {
    return NextResponse.json({ error: 'Setup gagal', detail: e.message }, { status: 500 })
  }
}
