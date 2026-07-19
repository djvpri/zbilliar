import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth'
import Navbar from '@/components/Navbar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  const user = token ? verifyToken(token) : null
  if (!user) redirect('/login')

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar user={{ nama: user.nama, role: user.role }} />
      <main className="dashboard-main" style={{ padding: 20, maxWidth: 1200, margin: '0 auto' }}>{children}</main>
    </div>
  )
}
