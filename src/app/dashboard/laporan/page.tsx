'use client'
import { useEffect, useState } from 'react'
import { fmtRp } from '@/lib/utils'

type LaporanData = {
  totalSewa: number; totalWarung: number; totalSesi: number; totalOmzet: number
  sesiPerMeja: { mejaId: number; _count: { id: number }; _sum: { biaya: number | null } }[]
  transaksiTerakhir: { id: string; jenis: string; total: number; createdAt: string; user: { nama: string } }[]
}

export default function LaporanPage() {
  const [data, setData] = useState<LaporanData | null>(null)
  const [mode, setMode] = useState('harian')

  useEffect(() => {
    fetch(`/api/laporan?mode=${mode}`).then(r => r.json()).then(setData)
  }, [mode])

  if (!data) return <div style={{ color: 'var(--text-muted)', padding: 40, textAlign: 'center' }}>Memuat laporan...</div>

  const maxSesi = Math.max(...data.sesiPerMeja.map(x => x._count.id), 1)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 500, marginRight: 8 }}>Laporan</h2>
        {['harian', 'mingguan', 'bulanan'].map(m => (
          <button key={m} className="btn" style={{ fontSize: 12, padding: '4px 12px', background: mode === m ? 'var(--blue)' : '', color: mode === m ? 'white' : '', borderColor: mode === m ? 'var(--blue)' : '' }} onClick={() => setMode(m)}>
            {m.charAt(0).toUpperCase() + m.slice(1)}
          </button>
        ))}
      </div>

      <div className="mobile-grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 20 }}>
        {[
          { label: 'Total omzet', val: fmtRp(data.totalOmzet) },
          { label: 'Pendapatan sewa', val: fmtRp(data.totalSewa) },
          { label: 'Pendapatan warung', val: fmtRp(data.totalWarung) },
          { label: 'Jumlah sesi', val: data.totalSesi },
        ].map(s => (
          <div key={s.label} style={{ background: '#F1EFE8', borderRadius: 8, padding: '12px 14px' }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 20, fontWeight: 500 }}>{s.val}</div>
          </div>
        ))}
      </div>

      <div className="mobile-grid-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card" style={{ padding: 16 }}>
          <h3 style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>Pemakaian per meja</h3>
          {data.sesiPerMeja.length === 0 ? (
            <p style={{ fontSize: 12, color: 'var(--text-hint)' }}>Belum ada data</p>
          ) : data.sesiPerMeja.map(m => (
            <div key={m.mejaId} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, fontSize: 12 }}>
              <span style={{ width: 52, color: 'var(--text-muted)', flexShrink: 0 }}>Meja {m.mejaId}</span>
              <div style={{ flex: 1, height: 8, background: '#F1EFE8', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.round(m._count.id / maxSesi * 100)}%`, background: 'var(--blue)', borderRadius: 4 }} />
              </div>
              <span style={{ width: 50, textAlign: 'right', fontWeight: 500 }}>{m._count.id} sesi</span>
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: 16 }}>
          <h3 style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>Transaksi terakhir</h3>
          {data.transaksiTerakhir.length === 0 ? (
            <p style={{ fontSize: 12, color: 'var(--text-hint)' }}>Belum ada transaksi</p>
          ) : data.transaksiTerakhir.map(t => (
            <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, padding: '5px 0', borderBottom: '0.5px solid var(--border)' }}>
              <div>
                <span className={`badge ${t.jenis === 'SEWA' ? 'badge-blue' : 'badge-green'}`} style={{ marginRight: 6 }}>{t.jenis}</span>
                <span style={{ color: 'var(--text-muted)' }}>{t.user.nama}</span>
              </div>
              <span style={{ fontWeight: 500 }}>{fmtRp(t.total)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
