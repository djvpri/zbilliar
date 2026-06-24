import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const token = getTokenFromRequest(req)
  if (!token || !verifyToken(token)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const meja = await prisma.meja.findMany({
    where: { aktif: true },
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
