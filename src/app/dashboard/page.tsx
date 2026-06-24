'use client'
import { useEffect, useState, useCallback } from 'react'
import { fmtRp, fmtDurasi } from '@/lib/utils'

type Sesi = { id: string; pelanggan?: string; mulai: string; tarif: number; status: string; member?: { nama: string } }
type MejaData = { id: number; nomor: number; nama: string; sesi: Sesi[] }

const TARIF_OPTIONS = [
  { label: 'Rp 15.000/jam (reguler)', value: 15000 },
  { label: 'Rp 20.000/jam (weekend)', value: 20000 },
  { label: 'Rp 10.000/jam (member)', value: 10000 },
]

export default function MejaPage() {
  const [meja, setMeja] = useState<MejaData[]>([])
  const [modal, setModal] = useState<null | 'mulai' | 'checkout' | 'reserve'>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [selectedSesiId, setSelectedSesiId] = useState<string | null>(null)
  const [pelanggan, setPelanggan] = useState('')
  const [tarif, setTarif] = useState(15000)
  const [now, setNow] = useState(Date.now())
  const [stats, setStats] = useState({ aktif: 0, tersedia: 0, pendapatan: 0, sesi: 0 })
  const [checkoutInfo, setCheckoutInfo] = useState<{ menit: number; biaya: number } | null>(null)

  const load = useCallback(async () => {
    const res = await fetch('/api/meja')
    if (res.ok) setMeja(await res.json())
  }, [])

  useEffect(() => { load() }, [load])
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t) }, [])

  useEffect(() => {
    let aktif = 0, tersedia = 0
    meja.forEach(m => {
      const s = m.sesi[0]
      if (s?.status === 'AKTIF') aktif++
      else if (!s || s.status === 'SELESAI') tersedia++
    })
    setStats(prev => ({ ...prev, aktif, tersedia }))
  }, [meja])

  function getElapsed(mulai: string) {
    return now - new Date(mulai).getTime()
  }

  function fmt(ms: number) {
    const s = Math.floor(ms / 1000)
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sc = s % 60
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sc).padStart(2,'0')}`
  }

  function openMulai(id: number) {
    setSelectedId(id); setPelanggan(''); setTarif(15000); setModal('mulai')
  }

  function openCheckout(id: number, sesi: Sesi) {
    setSelectedId(id); setSelectedSesiId(sesi.id)
    const elapsed = now - new Date(sesi.mulai).getTime()
    const menit = Math.ceil(elapsed / 60000)
    const biaya = Math.ceil((menit / 60) * sesi.tarif)
    setCheckoutInfo({ menit, biaya })
    setModal('checkout')
  }

  async function doAction(action: string, extra?: object) {
    const mejaItem = meja.find(m => m.id === selectedId)
    const sesi = mejaItem?.sesi[0]
    await fetch('/api/meja/sesi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mejaId: selectedId, sesiId: selectedSesiId || sesi?.id, pelanggan, tarif, action, ...extra })
    })
    setModal(null)
    await load()
    if (action === 'checkout') {
      setStats(prev => ({ ...prev, pendapatan: prev.pendapatan + (checkoutInfo?.biaya || 0), sesi: prev.sesi + 1 }))
    }
  }

  async function batalReserve(id: number, sesiId: string) {
    setSelectedId(id); setSelectedSesiId(sesiId)
    await fetch('/api/meja/sesi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mejaId: id, sesiId, action: 'batal-reserve' })
    })
    load()
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 20 }}>
        {[
          { label: 'Meja aktif', val: stats.aktif },
          { label: 'Tersedia', val: stats.tersedia },
          { label: 'Pendapatan hari ini', val: fmtRp(stats.pendapatan) },
          { label: 'Total sesi', val: stats.sesi },
        ].map(s => (
          <div key={s.label} style={{ background: '#F1EFE8', borderRadius: 8, padding: '12px 14px' }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 500 }}>{s.val}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px,1fr))', gap: 10 }}>
        {meja.map(m => {
          const sesi = m.sesi[0]
          const isAktif = sesi?.status === 'AKTIF'
          const isReserved = sesi?.status === 'RESERVED'
          const elapsed = isAktif ? getElapsed(sesi.mulai) : 0
          const biayaLive = isAktif ? Math.ceil((elapsed / 3600000) * sesi.tarif) : 0

          return (
            <div key={m.id} className="card" style={{
              padding: 14,
              borderColor: isAktif ? 'var(--blue)' : isReserved ? 'var(--amber)' : 'var(--border)',
              background: isAktif ? 'var(--blue-light)' : isReserved ? 'var(--amber-light)' : 'var(--surface)'
            }}>
              <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 4 }}>
                <i className="ti ti-circles-relation" style={{ fontSize: 14, verticalAlign: '-2px', marginRight: 4 }} />
                {m.nama}
              </div>
              <div style={{ fontSize: 11, fontWeight: 500, marginBottom: 6, color: isAktif ? 'var(--blue)' : isReserved ? 'var(--amber)' : 'var(--text-hint)' }}>
                {isAktif ? 'Sedang dipakai' : isReserved ? 'Reserved' : 'Tersedia'}
              </div>
              {isAktif && (
                <>
                  <div style={{ fontFamily: 'monospace', fontSize: 20, fontWeight: 500, color: 'var(--blue)', marginBottom: 4 }}>{fmt(elapsed)}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>
                    {sesi.pelanggan || 'Tamu'} · {fmtRp(biayaLive)}
                  </div>
                </>
              )}
              {!isAktif && <div style={{ minHeight: 48 }} />}
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {!isAktif && !isReserved && <>
                  <button className="btn" style={{ fontSize: 11, padding: '3px 8px', color: 'var(--blue)', borderColor: 'var(--blue)', background: 'var(--blue-light)' }} onClick={() => openMulai(m.id)}>Mulai</button>
                  <button className="btn" style={{ fontSize: 11, padding: '3px 8px' }} onClick={async () => { setSelectedId(m.id); await fetch('/api/meja/sesi', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mejaId: m.id, pelanggan: '', tarif: 15000, action: 'reserve' }) }); load() }}>Reserve</button>
                </>}
                {isAktif && <button className="btn btn-danger" style={{ fontSize: 11, padding: '3px 8px' }} onClick={() => openCheckout(m.id, sesi)}>Checkout</button>}
                {isReserved && <>
                  <button className="btn" style={{ fontSize: 11, padding: '3px 8px', color: 'var(--blue)', borderColor: 'var(--blue)', background: 'var(--blue-light)' }} onClick={() => openMulai(m.id)}>Mulai</button>
                  <button className="btn btn-danger" style={{ fontSize: 11, padding: '3px 8px' }} onClick={() => batalReserve(m.id, sesi.id)}>Batal</button>
                </>}
              </div>
            </div>
          )
        })}
      </div>

      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="card" style={{ padding: 24, width: 360 }}>
            {modal === 'mulai' && <>
              <h3 style={{ fontSize: 16, fontWeight: 500, marginBottom: 16 }}>Mulai sewa — Meja {selectedId}</h3>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>Nama pelanggan</label>
                <input className="inp" value={pelanggan} onChange={e => setPelanggan(e.target.value)} placeholder="Opsional" autoFocus />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>Tarif</label>
                <select className="inp" value={tarif} onChange={e => setTarif(Number(e.target.value))}>
                  {TARIF_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn" style={{ flex: 1 }} onClick={() => setModal(null)}>Batal</button>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => doAction('mulai')}>Mulai sewa</button>
              </div>
            </>}

            {modal === 'checkout' && checkoutInfo && <>
              <h3 style={{ fontSize: 16, fontWeight: 500, marginBottom: 16 }}>Checkout — Meja {selectedId}</h3>
              {[
                { label: 'Durasi', val: fmtDurasi(checkoutInfo.menit) },
                { label: 'Tarif', val: fmtRp(meja.find(m=>m.id===selectedId)?.sesi[0]?.tarif||0) + '/jam' },
                { label: 'Total bayar', val: fmtRp(checkoutInfo.biaya) },
              ].map(r => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '0.5px solid var(--border)', fontSize: 13 }}>
                  <span style={{ color: 'var(--text-muted)' }}>{r.label}</span>
                  <span style={{ fontWeight: r.label === 'Total bayar' ? 500 : 400 }}>{r.val}</span>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <button className="btn" style={{ flex: 1 }} onClick={() => setModal(null)}>Batal</button>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => doAction('checkout')}>Konfirmasi bayar</button>
              </div>
            </>}
          </div>
        </div>
      )}
    </div>
  )
}
