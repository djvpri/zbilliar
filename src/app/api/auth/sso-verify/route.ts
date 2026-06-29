import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/auth'

// Penerima SSO dari ZOne (/api/sso/zbilliar) — token JWT pendek umur (60s)
// ditandatangani dengan CROSS_APP_SECRET, BUKAN JWT_SECRET lokal ZBilliar.
const CROSS_APP_SECRET = process.env.CROSS_APP_SECRET || 'z-ecosystem-admin-2026'

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json()
    if (!token) return NextResponse.json({ error: 'Token wajib diisi' }, { status: 400 })

    let payload: any
    try {
      payload = jwt.verify(token, CROSS_APP_SECRET)
    } catch {
      return NextResponse.json({ error: 'Token SSO tidak valid atau kedaluwarsa' }, { status: 401 })
    }

    if (payload.app !== 'zbilliar') {
      return NextResponse.json({ error: 'Token ini bukan untuk ZBilliar' }, { status: 400 })
    }

    const email = String(payload.email || '').trim().toLowerCase()
    if (!email) return NextResponse.json({ error: 'Email tidak ada di token' }, { status: 400 })

    const user = await prisma.user.findFirst({
      where: { username: { equals: email, mode: 'insensitive' } },
      include: { tenant: { select: { id: true, nama: true, isActive: true } } },
    })

    if (!user) {
      return NextResponse.json(
        { error: `Akun ${email} belum terdaftar di ZBilliar. Hubungi admin.`, code: 'USER_NOT_FOUND' },
        { status: 404 }
      )
    }
    if (!user.aktif) return NextResponse.json({ error: 'Akun Anda dinonaktifkan.' }, { status: 403 })
    if (!user.tenant.isActive) return NextResponse.json({ error: 'Outlet Anda dinonaktifkan.' }, { status: 403 })

    const sessionToken = signToken({
      id: user.id,
      username: user.username,
      role: user.role,
      nama: user.nama,
      tenantId: user.tenantId,
    })

    const res = NextResponse.json({ success: true, redirect: '/dashboard' })
    res.cookies.set('token', sessionToken, { httpOnly: true, maxAge: 60 * 60 * 12 })
    return res
  } catch (err) {
    console.error('SSO verify error:', err)
    return NextResponse.json({ error: 'Gagal memproses SSO' }, { status: 500 })
  }
}
