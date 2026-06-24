'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error); setLoading(false); return }
    router.push('/dashboard')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ width: 360 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>
            <i className="ti ti-circles-relation" style={{ color: 'var(--blue)' }} />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 500, marginBottom: 4 }}>Biliar Pro</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Sistem manajemen rental biliar</p>
        </div>
        <div className="card" style={{ padding: 24 }}>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Username</label>
              <input className="inp" value={username} onChange={e => setUsername(e.target.value)} placeholder="admin / kasir1" required autoFocus />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Password</label>
              <input className="inp" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            {error && <p style={{ fontSize: 12, color: 'var(--red)', marginBottom: 14 }}>{error}</p>}
            <button className="btn btn-primary" style={{ width: '100%', padding: '10px' }} disabled={loading}>
              {loading ? 'Masuk...' : 'Masuk'}
            </button>
          </form>
          <p style={{ fontSize: 11, color: 'var(--text-hint)', textAlign: 'center', marginTop: 16 }}>
            Demo: admin / admin123 · kasir1 / kasir123
          </p>
        </div>
      </div>
    </div>
  )
}
