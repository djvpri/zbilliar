import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const token = getTokenFromRequest(req)
  const user = token ? verifyToken(token) : null
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const members = await prisma.member.findMany({ 
    where: { tenantId: user.tenantId },
    orderBy: { poin: 'desc' } 
  })
  return NextResponse.json(members)
}

export async function POST(req: NextRequest) {
  const token = getTokenFromRequest(req)
  const user = token ? verifyToken(token) : null
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { nama, telp } = await req.json()
  const member = await prisma.member.create({ 
    data: { nama, telp, tenantId: user.tenantId } 
  })
  return NextResponse.json(member)
}
