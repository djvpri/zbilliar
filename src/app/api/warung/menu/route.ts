import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const token = getTokenFromRequest(req)
  const user = token ? verifyToken(token) : null
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const menu = await prisma.menuItem.findMany({ 
    where: { aktif: true, tenantId: user.tenantId }, 
    orderBy: { kategori: 'asc' } 
  })
  return NextResponse.json(menu)
}

export async function POST(req: NextRequest) {
  const token = getTokenFromRequest(req)
  const user = token ? verifyToken(token) : null
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { nama, harga, kategori } = await req.json()
  const item = await prisma.menuItem.create({ 
    data: { nama, harga, kategori, tenantId: user.tenantId } 
  })
  return NextResponse.json(item)
}
