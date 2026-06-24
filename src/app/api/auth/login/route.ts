import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  const { username, password } = await req.json()
  const user = await prisma.user.findUnique({ where: { username } })
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return NextResponse.json({ error: 'Username atau password salah' }, { status: 401 })
  }
  const token = signToken({ id: user.id, username: user.username, role: user.role, nama: user.nama })
  const res = NextResponse.json({ ok: true, user: { id: user.id, nama: user.nama, role: user.role } })
  res.cookies.set('token', token, { httpOnly: true, maxAge: 60 * 60 * 12 })
  return res
}
