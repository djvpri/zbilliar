import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

const SECRET = process.env.JWT_SECRET || 'biliar-pro-secret-2024'

export interface TokenPayload {
  id: string
  username: string
  role: string
  nama: string
  tenantId: string
}

export function signToken(payload: TokenPayload) {
  return jwt.sign(payload, SECRET, { expiresIn: '12h' })
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, SECRET) as TokenPayload
  } catch {
    return null
  }
}

export function getTokenFromRequest(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth?.startsWith('Bearer ')) return auth.slice(7)
  return req.cookies.get('token')?.value || null
}

export function requireUser(req: NextRequest): { id: string; username: string; role: string; nama: string; tenantId: string } {
  const token = getTokenFromRequest(req)
  const user = token ? verifyToken(token) : null
  if (!user) throw new Error('Unauthorized')
  return user
}
