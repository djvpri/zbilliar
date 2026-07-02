export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// Migration 2026-07-02: Dual secret support during transition
const NEW_SECRET = process.env.CROSS_APP_SECRET || 'uurclTHL375CiZeWi2g4T3GczU2YNY9I1wzjlsVTgSk'
const OLD_SECRET = 'z-ecosystem-admin-2026'
const VALID_SECRETS = [NEW_SECRET, OLD_SECRET]

function checkAuth(req: NextRequest) {
  const auth = req.headers.get('authorization') || ''
  const token = auth.replace('Bearer ', '')
  return VALID_SECRETS.includes(token)
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const tenants = await prisma.tenant.findMany({
      select: { id: true, nama: true, slug: true, plan: true, isActive: true, planExpires: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    })

    const users = await prisma.user.findMany({
      select: { id: true, nama: true, username: true, role: true, aktif: true, tenantId: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      tenants: tenants.map(t => ({
        id: t.id, name: t.nama, plan: t.plan || 'free',
        active: t.isActive, expires_at: t.planExpires,
      })),
      users: users.map(u => ({
        id: u.id, name: u.nama, email: u.username, role: u.role,
        active: u.aktif, tenantId: u.tenantId,
      })),
    })
  } catch (error) {
    console.error('Cross-app GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { action, email, data } = await req.json()

    // --- Tenant actions ---
    if (action === 'createTenant') {
      const name = String(data?.name || '').trim()
      if (!name) return NextResponse.json({ error: 'name wajib diisi' }, { status: 400 })
      let slug = name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim()
      if (!slug) slug = 'tenant'
      let finalSlug = slug
      let counter = 1
      while (await prisma.tenant.findUnique({ where: { slug: finalSlug } })) finalSlug = `${slug}-${counter++}`
      const tenant = await prisma.tenant.create({ data: { nama: name, slug: finalSlug, plan: data?.plan || 'free' } })
      return NextResponse.json({ success: true, tenant: { id: tenant.id, name: tenant.nama } }, { status: 201 })
    }

    if (action === 'updateTenant') {
      if (!data?.tenantId) return NextResponse.json({ error: 'tenantId wajib' }, { status: 400 })
      await prisma.tenant.update({
        where: { id: data.tenantId },
        data: { nama: data.name || undefined, isActive: data.isActive ?? undefined },
      })
      return NextResponse.json({ success: true })
    }

    if (action === 'deleteTenant') {
      if (!data?.tenantId) return NextResponse.json({ error: 'tenantId wajib' }, { status: 400 })
      await prisma.tenant.update({ where: { id: data.tenantId }, data: { isActive: false } })
      await prisma.user.updateMany({ where: { tenantId: data.tenantId }, data: { aktif: false } })
      return NextResponse.json({ success: true, deactivated: true })
    }

    if (action === 'updatePlan') {
      if (!data?.tenantId || !data?.plan) return NextResponse.json({ error: 'tenantId & plan wajib' }, { status: 400 })
      await prisma.tenant.update({
        where: { id: data.tenantId },
        data: { plan: data.plan, planExpires: data.planExpires ? new Date(data.planExpires) : null },
      })
      return NextResponse.json({ success: true })
    }

    // --- User actions ---
    if (action === 'create') {
      if (!data?.name || !data?.email || !data?.password) {
        return NextResponse.json({ error: 'name, email, password wajib' }, { status: 400 })
      }
      const existing = await prisma.user.findUnique({ where: { username: data.email } })
      if (existing) return NextResponse.json({ error: 'Username sudah digunakan' }, { status: 409 })

      let tenantId = data.tenantId
      if (!tenantId) {
        const firstTenant = await prisma.tenant.findFirst({ orderBy: { createdAt: 'asc' } })
        if (!firstTenant) return NextResponse.json({ error: 'Belum ada tenant' }, { status: 400 })
        tenantId = firstTenant.id
      }

      const hashed = await bcrypt.hash(data.password, 10)
      const user = await prisma.user.create({
        data: { nama: data.name, username: data.email, password: hashed, role: data.role || 'KASIR', tenantId },
      })
      return NextResponse.json({ success: true, user: { id: user.id, name: user.nama, email: user.username } }, { status: 201 })
    }

    if (action === 'delete') {
      if (!email) return NextResponse.json({ error: 'email wajib' }, { status: 400 })
      const result = await prisma.user.updateMany({ where: { username: email }, data: { aktif: false } })
      if (!result.count) return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 })
      return NextResponse.json({ success: true, deactivated: true })
    }

    if (action === 'updateRole') {
      if (!email || !data?.role) return NextResponse.json({ error: 'email & role wajib' }, { status: 400 })
      const validRoles = ['KASIR', 'ADMIN', 'OWNER']
      if (!validRoles.includes(data.role.toUpperCase())) {
        return NextResponse.json({ error: `Role tidak valid. Pilih: ${validRoles.join(', ')}` }, { status: 400 })
      }
      const result = await prisma.user.updateMany({
        where: { username: email },
        data: { role: data.role.toUpperCase() as any },
      })
      if (!result.count) return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 })
      return NextResponse.json({ success: true })
    }

    if (action === 'reactivate') {
      if (!email) return NextResponse.json({ error: 'email wajib' }, { status: 400 })
      const result = await prisma.user.updateMany({ where: { username: email }, data: { aktif: true } })
      if (!result.count) return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 })
      return NextResponse.json({ success: true, reactivated: true })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (error) {
    console.error('Cross-app POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
