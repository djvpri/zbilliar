import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const token = getTokenFromRequest(req)
  const user = token ? verifyToken(token) : null
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { items, total, bayar } = await req.json()
  const trx = await prisma.transaksi.create({
    data: { 
      userId: user.id, 
      jenis: 'WARUNG', 
      total, 
      items,
      bayar: bayar || null,
      kembalian: bayar ? (bayar - total) : null,
      tenantId: user.tenantId 
    }
  })
  return NextResponse.json(trx)
}

export async function GET(req: NextRequest) {
  const token = getTokenFromRequest(req)
  const user = token ? verifyToken(token) : null
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const transaksi = await prisma.transaksi.findMany({
    where: { jenis: 'WARUNG', tenantId: user.tenantId },
    orderBy: { createdAt: 'desc' },
    take: 20,
    include: { user: { select: { nama: true } } }
  })
  return NextResponse.json(transaksi)
}
