import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const token = getTokenFromRequest(req)
  const user = token ? verifyToken(token) : null
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const mode = searchParams.get('mode') || 'harian'

  const now = new Date()
  let mulai: Date

  if (mode === 'bulanan') {
    mulai = new Date(now.getFullYear(), now.getMonth(), 1)
  } else if (mode === 'mingguan') {
    mulai = new Date(now)
    mulai.setDate(now.getDate() - 6)
    mulai.setHours(0, 0, 0, 0)
  } else {
    mulai = new Date(now)
    mulai.setHours(0, 0, 0, 0)
  }

  const transaksi = await prisma.transaksi.findMany({
    where: { createdAt: { gte: mulai }, tenantId: user.tenantId },
    include: { user: { select: { nama: true } } }
  })

  const totalSewa = transaksi.filter(t => t.jenis === 'SEWA').reduce((s, t) => s + t.total, 0)
  const totalWarung = transaksi.filter(t => t.jenis === 'WARUNG').reduce((s, t) => s + t.total, 0)
  const totalSesi = transaksi.filter(t => t.jenis === 'SEWA').length

  const sesiPerMeja = await prisma.sesi.groupBy({
    by: ['mejaId'],
    where: { status: 'SELESAI', mulai: { gte: mulai }, tenantId: user.tenantId },
    _count: { id: true },
    _sum: { biaya: true }
  })

  return NextResponse.json({
    totalSewa,
    totalWarung,
    totalSesi,
    totalOmzet: totalSewa + totalWarung,
    sesiPerMeja,
    transaksiTerakhir: transaksi.slice(-10).reverse()
  })
}
