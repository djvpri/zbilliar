'use client'
import { useEffect, useState } from 'react'

type Member = { id: string; nama: string; telp?: string; poin: number; level: string; createdAt: string }

const LEVEL_BADGE: Record<string, string> = {
  GOLD: 'badge-amber', SILVER: 'badge-gray', PLATINUM: 'badge-blue'
}

export default function MemberPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [modal, setModal] = useState(false)
  const [nama, setNama] = useState('')
  const [telp, setTelp] = useState('')

  useEffect(() => { fetch('/api/member').then(r => r.json()).then(setMembers) }, [])

  async function tambah() {
    if (!nama) return
    await fetch('/api/member', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nama, telp })
    })
    setNama(''); setTelp(''); setModal(false)
    fetch('/api/member').then(r => r.json()).then(setMembers)
  }

  function initials(n: string) {
    return n.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 500 }}>Daftar member ({members.length})</h2>
        <button className="btn btn-primary" onClick={() => setModal(true)}>
          <i className="ti ti-plus" style={{ fontSize: 13, verticalAlign: '-2px', marginRight: 4 }} />Tambah member
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {members.map(m => (
          <div key={m.id} className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--blue-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 500, color: 'var(--blue)', flexShrink: 0 }}>
              {initials(m.nama)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{m.nama}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.telp || 'Tidak ada nomor'} · {m.poin} poin</div>
            </div>
            <span className={`badge ${LEVEL_BADGE[m.level] || 'badge-gray'}`}>{m.level}</span>
          </div>
        ))}
        {members.length === 0 && (
          <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-hint)' }}>
            <i className="ti ti-users" style={{ fontSize: 32, display: 'block', marginBottom: 8 }} />
            Belum ada member terdaftar
          </div>
        )}
      </div>

      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="card" style={{ padding: 24, width: 'min(340px, calc(100vw - 32px))' }}>
            <h3 style={{ fontSize: 16, fontWeight: 500, marginBottom: 16 }}>Tambah member baru</h3>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>Nama</label>
              <input className="inp" value={nama} onChange={e => setNama(e.target.value)} placeholder="Nama lengkap" autoFocus />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>No. HP</label>
              <input className="inp" value={telp} onChange={e => setTelp(e.target.value)} placeholder="0812xxxxxxxx" />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn" style={{ flex: 1 }} onClick={() => setModal(false)}>Batal</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={tambah}>Daftar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
