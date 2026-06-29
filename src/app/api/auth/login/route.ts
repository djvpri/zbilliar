import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  const { username, password } = await req.json()

  const user = await prisma.user.findUnique({
    where: { username },
    include: { tenant: { select: { id: true, nama: true, slug: true, plan: true, isActive: true } } }
  })

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return NextResponse.json({ error: 'Username atau password salah' }, { status: 401 })
  }
  if (!user.aktif) {
    return NextResponse.json({ error: 'Akun nonaktif' }, { status: 403 })
  }
  if (!user.tenant.isActive) {
    return NextResponse.json({ error: 'Outlet nonaktif, hubungi admin' }, { status: 403 })
  }

  const payload = { id: user.id, username: user.username, role: user.role, nama: user.nama, tenantId: user.tenantId }
  const token = signToken(payload)

  const res = NextResponse.json({
    ok: true,
    user: { id: user.id, nama: user.nama, role: user.role, tenant: { id: user.tenant.id, nama: user.tenant.nama, slug: user.tenant.slug } }
  })
  res.cookies.set('token', token, { httpOnly: true, maxAge: 60 * 60 * 12 })
  return res
}
