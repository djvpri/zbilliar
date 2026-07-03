import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import LandingPage from './landing/page'

export default async function Home() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (token && verifyToken(token)) redirect('/dashboard')
  return <LandingPage />
}
