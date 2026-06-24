import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const token = getTokenFromRequest(req)
  const user = token ? verifyToken(token) : null
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { items, total } = await req.json()
  const trx = await prisma.transaksi.create({
    data: { userId: user.id, jenis: 'WARUNG', total, items }
  })
  return NextResponse.json(trx)
}
