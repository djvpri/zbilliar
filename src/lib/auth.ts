import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

const SECRET = process.env.JWT_SECRET || 'biliar-pro-secret-2024'

export function signToken(payload: object) {
  return jwt.sign(payload, SECRET, { expiresIn: '12h' })
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, SECRET) as { id: string; username: string; role: string; nama: string }
  } catch {
    return null
  }
}

export function getTokenFromRequest(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth?.startsWith('Bearer ')) return auth.slice(7)
  return req.cookies.get('token')?.value || null
}
