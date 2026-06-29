import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const token = getTokenFromRequest(req)
  const user = token ? verifyToken(token) : null
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const meja = await prisma.meja.findMany({
    where: { aktif: true, tenantId: user.tenantId },
    orderBy: { nomor: 'asc' },
    include: {
      sesi: {
        where: { status: { in: ['AKTIF', 'RESERVED'] } },
        take: 1,
        orderBy: { mulai: 'desc' },
        include: { member: { select: { nama: true } } }
      }
    }
  })
  return NextResponse.json(meja)
}

export async function POST(req: NextRequest) {
  const token = getTokenFromRequest(req)
  const user = token ? verifyToken(token) : null
  if (!user || user.role === 'KASIR') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { nomor, nama } = await req.json()
  if (!nomor) return NextResponse.json({ error: 'Nomor meja wajib' }, { status: 400 })

  const existing = await prisma.meja.findFirst({ where: { nomor, tenantId: user.tenantId } })
  if (existing) return NextResponse.json({ error: 'Nomor meja sudah ada' }, { status: 409 })

  const meja = await prisma.meja.create({
    data: { nomor, nama: nama || null, tenantId: user.tenantId }
  })
  return NextResponse.json(meja)
}

export async function PUT(req: NextRequest) {
  const token = getTokenFromRequest(req)
  const user = token ? verifyToken(token) : null
  if (!user || user.role === 'KASIR') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id, nomor, nama, aktif } = await req.json()
  const meja = await prisma.meja.findFirst({ where: { id, tenantId: user.tenantId } })
  if (!meja) return NextResponse.json({ error: 'Meja tidak ditemukan' }, { status: 404 })

  const updated = await prisma.meja.update({
    where: { id: id },
    data: { nomor: nomor ?? undefined, nama: nama ?? undefined, aktif: aktif ?? undefined }
  })
  return NextResponse.json(updated)
}
