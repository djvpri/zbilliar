'use client'
import { useEffect, useState } from 'react'
import { fmtRp } from '@/lib/utils'

type Shift = { id: string; mulai: string; selesai?: string; totalSesi: number; totalPendapatan: number; user: { nama: string } }

const SHIFT_TYPES = ['Pagi (07.00 – 15.00)', 'Siang (15.00 – 23.00)', 'Malam (23.00 – 07.00)']

export default function ShiftPage() {
  const [shifts, setShifts] = useState<Shift[]>([])
  const [nama, setNama] = useState('')
  const [tipe, setTipe] = useState(SHIFT_TYPES[0])

  useEffect(() => { fetch('/api/shift').then(r => r.json()).then(setShifts) }, [])

  async function mulaiShift() {
    if (!nama) return
    await fetch('/api/shift', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'mulai' })
    })
    setNama('')
    fetch('/api/shift').then(r => r.json()).then(setShifts)
  }

  function fmtTime(iso: string) {
    return new Date(iso).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div style={{ maxWidth: 520 }}>
      <h2 style={{ fontSize: 16, fontWeight: 500, marginBottom: 16 }}>Manajemen shift</h2>

      <div className="card" style={{ padding: 20, marginBottom: 20, borderColor: 'var(--blue)', background: 'var(--blue-light)' }}>
        <h3 style={{ fontSize: 14, fontWeight: 500, color: 'var(--blue)', marginBottom: 14 }}>Ganti shift sekarang</h3>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>Nama operator</label>
          <input className="inp" value={nama} onChange={e => setNama(e.target.value)} placeholder="Nama kasir baru" />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>Jenis shift</label>
          <select className="inp" value={tipe} onChange={e => setTipe(e.target.value)}>
            {SHIFT_TYPES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <button className="btn btn-primary" onClick={mulaiShift}>
          <i className="ti ti-player-play" style={{ fontSize: 13, verticalAlign: '-2px', marginRight: 6 }} />
          Mulai shift
        </button>
      </div>

      <h3 style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 10 }}>Riwayat shift</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {shifts.map(s => (
          <div key={s.id} className="card" style={{ padding: '12px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 14, fontWeight: 500 }}>{s.user.nama}</span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{fmtTime(s.mulai)}{s.selesai ? ` – ${fmtTime(s.selesai)}` : ' (aktif)'}</span>
            </div>
            <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
              <span><span style={{ color: 'var(--text-muted)' }}>Sesi: </span><b>{s.totalSesi}</b></span>
              <span><span style={{ color: 'var(--text-muted)' }}>Pendapatan: </span><b>{fmtRp(s.totalPendapatan)}</b></span>
            </div>
          </div>
        ))}
        {shifts.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-hint)', fontSize: 13, padding: 20 }}>Belum ada riwayat shift</div>
        )}
      </div>
    </div>
  )
}
