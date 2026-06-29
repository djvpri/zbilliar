import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const token = getTokenFromRequest(req)
  const user = token ? verifyToken(token) : null
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const shifts = await prisma.shift.findMany({
    where: { tenantId: user.tenantId },
    orderBy: { mulai: 'desc' }, take: 10,
    include: { user: { select: { nama: true } } }
  })
  return NextResponse.json(shifts)
}

export async function POST(req: NextRequest) {
  const token = getTokenFromRequest(req)
  const user = token ? verifyToken(token) : null
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { action, shiftId, totalSesi, totalPendapatan } = await req.json()

  if (action === 'mulai') {
    const activeShift = await prisma.shift.findFirst({
      where: { userId: user.id, selesai: null, tenantId: user.tenantId }
    })
    if (activeShift) return NextResponse.json({ error: 'Shift masih aktif' }, { status: 400 })
    const shift = await prisma.shift.create({ 
      data: { userId: user.id, tenantId: user.tenantId } 
    })
    return NextResponse.json(shift)
  }
  if (action === 'selesai' && shiftId) {
    const shift = await prisma.shift.findFirst({
      where: { id: shiftId, tenantId: user.tenantId }
    })
    if (!shift) return NextResponse.json({ error: 'Shift tidak ditemukan' }, { status: 404 })
    const updated = await prisma.shift.update({
      where: { id: shiftId },
      data: { selesai: new Date(), totalSesi: totalSesi || 0, totalPendapatan: totalPendapatan || 0 }
    })
    return NextResponse.json(updated)
  }
  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
