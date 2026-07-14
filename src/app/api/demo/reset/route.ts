import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'
import { seedDataDemo, bersihkanDataToko } from '@/lib/demo-seed'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// POST /api/demo/reset — tombol "Reset Demo" manual saat user eksplor.
// Pakai sesi JWT biasa, TAPI dengan pengecekan KRUSIAL isDemo di bawah.
export async function POST(req: NextRequest) {
  const tk = getTokenFromRequest(req)
  const user = tk ? verifyToken(tk) : null
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // KRUSIAL: cuma tenant demo yang boleh direset lewat sini. Tanpa cek ini,
  // endpoint bisa dipakai untuk menghapus SELURUH data toko ASLI yang login.
  const tenant = await prisma.tenant.findUnique({ where: { id: user.tenantId }, select: { isDemo: true } })
  if (!tenant?.isDemo) {
    return NextResponse.json({ error: 'Bukan tenant demo, tidak bisa direset lewat sini' }, { status: 403 })
  }

  await bersihkanDataToko(user.tenantId)
  await seedDataDemo(user.tenantId)
  return NextResponse.json({ ok: true })
}
