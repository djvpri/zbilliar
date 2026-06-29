import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

const CROSS_APP_SECRET = process.env.CROSS_APP_SECRET || 'z-ecosystem-admin-2026'

function checkAuth(req: NextRequest) {
  return req.headers.get('authorization') === `Bearer ${CROSS_APP_SECRET}`
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const tenants = await prisma.tenant.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, nama: true, slug: true, plan: true, isActive: true, planExpires: true }
    })
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, nama: true, username: true, tenantId: true, role: true, aktif: true }
    })
    return NextResponse.json({ 
      tenants: tenants.map(t => ({ id: t.id, name: t.nama, slug: t.slug, plan: t.plan || 'free', active: t.isActive, expires_at: t.planExpires })),
      users: users.map(u => ({ id: u.id, name: u.nama, email: u.username, tenantId: u.tenantId, role: u.role, active: u.aktif }))
    })
  } catch (err) {
    console.error('cross-app GET error:', err)
    return NextResponse.json({ error: 'Gagal memuat data' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { action, email, data } = await req.json()

    if (action === 'createUser') {
      const name = String(data?.name || '').trim()
      const username = String(data?.email || '').trim()
      const password = String(data?.password || '')
      const tenantSlug = String(data?.tenantSlug || '').trim()
      if (!name || !username || !password) {
        return NextResponse.json({ error: 'name, email, password wajib diisi' }, { status: 400 })
      }
      const tenant = await prisma.tenant.findFirst({
        where: tenantSlug ? { slug: tenantSlug } : {},
        orderBy: { createdAt: 'asc' }
      })
      if (!tenant) return NextResponse.json({ error: 'Tenant tidak ditemukan' }, { status: 400 })
      const existing = await prisma.user.findFirst({ where: { username, tenantId: tenant.id } })
      if (existing) return NextResponse.json({ error: 'Username sudah digunakan' }, { status: 409 })
      const passwordHash = await bcrypt.hash(password, 10)
      const user = await prisma.user.create({
        data: { nama: name, username, password: passwordHash, role: data?.role || 'KASIR', tenantId: tenant.id }
      })
      return NextResponse.json({ success: true, user: { id: user.id, name: user.nama, email: user.username } })
    }

    if (action === 'delete') {
      if (!email) return NextResponse.json({ error: 'email wajib diisi' }, { status: 400 })
      const user = await prisma.user.updateMany({
        where: { username: email },
        data: { aktif: false }
      })
      return NextResponse.json({ success: true, deactivated: true })
    }

    if (action === 'reactivate') {
      if (!email) return NextResponse.json({ error: 'email wajib diisi' }, { status: 400 })
      await prisma.user.updateMany({
        where: { username: email },
        data: { aktif: true }
      })
      return NextResponse.json({ success: true, reactivated: true })
    }

    if (action === 'updateRole') {
      if (!email) return NextResponse.json({ error: 'email wajib diisi' }, { status: 400 })
      const role = String(data?.role || 'KASIR').toUpperCase()
      if (!['KASIR', 'ADMIN', 'OWNER'].includes(role)) {
        return NextResponse.json({ error: 'Role tidak valid (KASIR, ADMIN, OWNER)' }, { status: 400 })
      }
      const result = await prisma.user.updateMany({
        where: { username: email },
        data: { role: role as any }
      })
      return NextResponse.json({ success: true, role })
    }

    if (action === 'updatePlan') {
      const tenantSlug = String(data?.slug || '').trim()
      const plan = String(data?.plan || 'free')
      if (!tenantSlug) return NextResponse.json({ error: 'slug wajib diisi' }, { status: 400 })
      const expiresAt = data?.planExpires ? new Date(data.planExpires) : undefined
      await prisma.tenant.update({
        where: { slug: tenantSlug },
        data: { plan, planExpires: expiresAt }
      })
      return NextResponse.json({ success: true })
    }

    if (action === 'createTenant') {
      const name = String(data?.name || '').trim()
      if (!name) return NextResponse.json({ error: 'name wajib diisi' }, { status: 400 })
      const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
      const existing = await prisma.tenant.findUnique({ where: { slug } })
      if (existing) return NextResponse.json({ error: 'Slug sudah digunakan' }, { status: 409 })
      const tenant = await prisma.tenant.create({
        data: { nama: name, slug, plan: 'free' }
      })
      return NextResponse.json({ success: true, tenant: { id: tenant.id, name: tenant.nama, slug: tenant.slug } })
    }

    if (action === 'deleteTenant') {
      const slug = String(data?.slug || '').trim()
      if (!slug) return NextResponse.json({ error: 'slug wajib diisi' }, { status: 400 })
      const tenant = await prisma.tenant.findUnique({ where: { slug } })
      if (!tenant) return NextResponse.json({ error: 'Tenant tidak ditemukan' }, { status: 404 })
      await prisma.transaksi.deleteMany({ where: { tenantId: tenant.id } })
      await prisma.sesi.deleteMany({ where: { tenantId: tenant.id } })
      await prisma.meja.deleteMany({ where: { tenantId: tenant.id } })
      await prisma.member.deleteMany({ where: { tenantId: tenant.id } })
      await prisma.menuItem.deleteMany({ where: { tenantId: tenant.id } })
      await prisma.shift.deleteMany({ where: { tenantId: tenant.id } })
      await prisma.user.deleteMany({ where: { tenantId: tenant.id } })
      await prisma.tenant.delete({ where: { id: tenant.id } })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (err) {
    console.error('cross-app POST error:', err)
    return NextResponse.json({ error: 'Gagal memproses aksi', detail: String(err) }, { status: 500 })
  }
}
