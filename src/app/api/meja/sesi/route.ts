import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'
import { hitungBiaya } from '@/lib/utils'

export async function POST(req: NextRequest) {
  const token = getTokenFromRequest(req)
  const user = token ? verifyToken(token) : null
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { mejaId, pelanggan, memberId, tarif, action, sesiId } = await req.json()

  if (action === 'mulai') {
    const existing = await prisma.sesi.findFirst({ 
      where: { mejaId, status: 'AKTIF', tenantId: user.tenantId } 
    })
    if (existing) return NextResponse.json({ error: 'Meja sedang dipakai' }, { status: 400 })
    const sesi = await prisma.sesi.create({
      data: { mejaId, pelanggan, memberId: memberId || null, tarif, status: 'AKTIF', tenantId: user.tenantId }
    })
    return NextResponse.json(sesi)
  }

  if (action === 'reserve') {
    const sesi = await prisma.sesi.create({
      data: { mejaId, pelanggan, tarif, status: 'RESERVED', tenantId: user.tenantId }
    })
    return NextResponse.json(sesi)
  }

  if (action === 'checkout' && sesiId) {
    const sesi = await prisma.sesi.findFirst({ 
      where: { id: sesiId, tenantId: user.tenantId } 
    })
    if (!sesi) return NextResponse.json({ error: 'Sesi tidak ditemukan' }, { status: 404 })
    const selesai = new Date()
    const { menit, biaya } = hitungBiaya(sesi.tarif, sesi.mulai, selesai)
    const updated = await prisma.sesi.update({
      where: { id: sesiId },
      data: { selesai, durasi: menit, biaya, status: 'SELESAI' }
    })
    await prisma.transaksi.create({
      data: { sesiId, userId: user.id, jenis: 'SEWA', total: biaya, tenantId: user.tenantId }
    })
    if (sesi.memberId) {
      const poinBaru = Math.floor(biaya / 1000)
      await prisma.member.update({
        where: { id: sesi.memberId, tenantId: user.tenantId },
        data: { poin: { increment: poinBaru } }
      })
    }
    return NextResponse.json({ ...updated, biaya })
  }

  if (action === 'batal-reserve' && sesiId) {
    await prisma.sesi.updateMany({ 
      where: { id: sesiId, tenantId: user.tenantId }, 
      data: { status: 'SELESAI' } 
    })
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Action tidak valid' }, { status: 400 })
}
