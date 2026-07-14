import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { seedDataDemo, bersihkanDataToko } from '@/lib/demo-seed'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Dipanggil Railway Cron Job 1x/hari (SATU cron untuk banyak app via
// DEMO_RESET_TARGETS) — BUKAN oleh sesi user. Proteksinya secret di header
// Authorization: Bearer <DEMO_RESET_SECRET>, bukan cookie JWT.
//
// Tenant demo dicari lewat flag isDemo=true (bukan hardcode slug), jadi kalau
// demo dipindah cukup pindahkan flag-nya.
export async function POST(req: Request) {
  const auth = req.headers.get('authorization') || ''
  const token = auth.replace('Bearer ', '')
  const secret = process.env.DEMO_RESET_SECRET
  if (!secret || token !== secret) {
    // fail-closed: kalau secret belum di-set atau tak cocok, tolak.
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const tenants = await prisma.tenant.findMany({ where: { isDemo: true }, select: { id: true, nama: true } })
  if (tenants.length === 0) {
    return NextResponse.json({ ok: true, pesan: 'Tidak ada tenant demo (isDemo=true belum di-set).' })
  }

  const hasil: { tenantId: string; nama: string }[] = []
  for (const t of tenants) {
    await bersihkanDataToko(t.id)
    await seedDataDemo(t.id)
    hasil.push({ tenantId: t.id, nama: t.nama })
  }
  return NextResponse.json({ ok: true, direset: hasil })
}
