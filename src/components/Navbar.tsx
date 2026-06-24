'use client'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

const navItems = [
  { href: '/dashboard', icon: 'ti-layout-grid', label: 'Meja', testid: 'nav-meja' },
  { href: '/dashboard/warung', icon: 'ti-shopping-bag', label: 'Warung', testid: 'nav-warung' },
  { href: '/dashboard/member', icon: 'ti-users', label: 'Member', testid: 'nav-member' },
  { href: '/dashboard/laporan', icon: 'ti-chart-bar', label: 'Laporan', testid: 'nav-laporan' },
  { href: '/dashboard/shift', icon: 'ti-user-check', label: 'Shift', testid: 'nav-shift' },
]

export default function Navbar({ user }: { user?: { nama: string; role: string } }) {
  const pathname = usePathname()
  const router = useRouter()
  const [time, setTime] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('id-ID'))
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [])

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <nav style={{ background: 'var(--surface)', borderBottom: '0.5px solid var(--border)' }} data-testid="navbar">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Mobile hamburger */}
          <button
            className="btn"
            style={{ display: 'none', padding: '4px 8px', fontSize: 18 }}
            onClick={() => setMobileOpen(!mobileOpen)}
            data-testid="mobile-menu-toggle"
          >
            <i className={`ti ti-menu-${mobileOpen ? '2' : 'equal'}`} />
          </button>
          <i className="ti ti-circles-relation" style={{ fontSize: 20, color: 'var(--blue)' }} />
          <span style={{ fontSize: 15, fontWeight: 500 }}>Biliar Pro</span>
          {user && (
            <span className="badge badge-blue" data-testid="user-badge">{user.nama} · {user.role}</span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
            <i className="ti ti-clock" style={{ fontSize: 13, verticalAlign: '-2px', marginRight: 4 }} />
            {time}
          </span>
          <button className="btn" style={{ fontSize: 12, padding: '4px 10px' }} onClick={logout} data-testid="btn-logout">
            <i className="ti ti-logout" style={{ fontSize: 13, verticalAlign: '-2px', marginRight: 4 }} />
            Keluar
          </button>
        </div>
      </div>
      <div style={{
        display: 'flex', gap: 2, padding: '0 12px 8px', flexWrap: 'wrap',
      }}>
        {navItems.map(item => (
          <a
            key={item.href}
            href={item.href}
            data-testid={item.testid}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '5px 12px', borderRadius: 8, fontSize: 13,
              textDecoration: 'none',
              background: pathname === item.href ? 'var(--bg)' : 'transparent',
              color: pathname === item.href ? 'var(--text)' : 'var(--text-muted)',
              fontWeight: pathname === item.href ? 500 : 400,
              border: pathname === item.href ? '0.5px solid var(--border)' : '0.5px solid transparent',
            }}
          >
            <i className={`ti ${item.icon}`} style={{ fontSize: 14 }} />
            {item.label}
          </a>
        ))}
      </div>
    </nav>
  )
}
