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
    <>
      <nav style={{ background: 'var(--surface)', borderBottom: '0.5px solid var(--border)', position: 'sticky', top: 0, zIndex: 50 }} data-testid="navbar">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              className="btn nav-mobile-ham"
              style={{ padding: '4px 8px', fontSize: 18 }}
              onClick={() => setMobileOpen(!mobileOpen)}
              data-testid="mobile-menu-toggle"
            >
              <i className={`ti ti-${mobileOpen ? 'x' : 'menu-2'}`} />
            </button>
            <i className="ti ti-circles-relation" style={{ fontSize: 20, color: 'var(--blue)' }} />
            <span style={{ fontSize: 15, fontWeight: 500 }}>ZBilliar</span>
            {user && (
              <span className="badge badge-blue nav-user-badge" data-testid="user-badge">{user.nama} · {user.role}</span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span className="nav-clock" style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
              <i className="ti ti-clock" style={{ fontSize: 13, verticalAlign: '-2px', marginRight: 4 }} />
              {time}
            </span>
            <button className="btn" style={{ fontSize: 12, padding: '4px 10px' }} onClick={logout} data-testid="btn-logout">
              <i className="ti ti-logout" style={{ fontSize: 13, verticalAlign: '-2px', marginRight: 4 }} />
              Keluar
            </button>
          </div>
        </div>
        <div className="nav-links-desktop" style={{ display: 'flex', gap: 2, padding: '0 12px 8px', flexWrap: 'wrap' }}>
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

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200 }}
          onClick={() => setMobileOpen(false)}
        >
          <div
            style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 240, background: 'var(--surface)', borderRight: '0.5px solid var(--border)', display: 'flex', flexDirection: 'column', padding: 16, gap: 4, overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, paddingBottom: 12, borderBottom: '0.5px solid var(--border)' }}>
              <i className="ti ti-circles-relation" style={{ fontSize: 20, color: 'var(--blue)' }} />
              <span style={{ fontSize: 15, fontWeight: 500 }}>ZBilliar</span>
            </div>
            {navItems.map(item => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                data-testid={`mobile-${item.testid}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 8, fontSize: 14,
                  textDecoration: 'none',
                  background: pathname === item.href ? 'var(--blue-light)' : 'transparent',
                  color: pathname === item.href ? 'var(--blue)' : 'var(--text)',
                  fontWeight: pathname === item.href ? 500 : 400,
                }}
              >
                <i className={`ti ${item.icon}`} style={{ fontSize: 18 }} />
                {item.label}
              </a>
            ))}
            {user && (
              <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '0.5px solid var(--border)' }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>
                  {user.nama} · {user.role}
                </div>
                <button className="btn btn-danger" style={{ width: '100%', fontSize: 13 }} onClick={logout}>
                  <i className="ti ti-logout" style={{ marginRight: 6, verticalAlign: '-2px' }} />
                  Keluar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
