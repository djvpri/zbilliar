'use client'
import { useEffect, useState } from 'react'
import { fmtRp } from '@/lib/utils'

type MenuItem = { id: string; nama: string; harga: number; kategori: string }
type CartItem = MenuItem & { qty: number }

export default function WarungPage() {
  const [menu, setMenu] = useState<MenuItem[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [toast, setToast] = useState('')
  const [receipt, setReceipt] = useState<{ items: CartItem[]; total: number; waktu: string } | null>(null)

  useEffect(() => {
    fetch('/api/warung/menu').then(r => r.json()).then(setMenu)
  }, [])

  function addCart(item: MenuItem) {
    setCart(prev => {
      const ex = prev.find(x => x.id === item.id)
      if (ex) return prev.map(x => x.id === item.id ? { ...x, qty: x.qty + 1 } : x)
      return [...prev, { ...item, qty: 1 }]
    })
  }

  function removeCart(id: string) {
    setCart(prev => {
      const ex = prev.find(x => x.id === id)
      if (!ex) return prev
      if (ex.qty > 1) return prev.map(x => x.id === id ? { ...x, qty: x.qty - 1 } : x)
      return prev.filter(x => x.id !== id)
    })
  }

  const total = cart.reduce((s, x) => s + x.harga * x.qty, 0)

  async function checkout() {
    if (!cart.length) return
    const snapshot = [...cart]
    const totalSnapshot = total
    await fetch('/api/warung/transaksi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cart, total })
    })
    setCart([])
    setToast(`Pembayaran ${fmtRp(totalSnapshot)} berhasil`)
    setTimeout(() => setToast(''), 2500)
    setReceipt({ items: snapshot, total: totalSnapshot, waktu: new Date().toISOString() })
  }

  const kategori = [...new Set(menu.map(m => m.kategori))]

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #nota-warung, #nota-warung * { visibility: visible !important; }
          #nota-warung {
            position: fixed !important; top: 0 !important; left: 0 !important;
            width: 100% !important; padding: 24px !important; background: white !important;
          }
        }
      `}</style>

      <div className="warung-layout">
        <div>
          {kategori.map(kat => (
            <div key={kat} style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'capitalize', marginBottom: 10 }}>{kat}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 8 }}>
                {menu.filter(m => m.kategori === kat).map(item => (
                  <div key={item.id} className="card" style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{item.nama}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{fmtRp(item.harga)}</div>
                    </div>
                    <button className="btn btn-primary" style={{ padding: '4px 10px', fontSize: 16 }} onClick={() => addCart(item)}>+</button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="card warung-cart" style={{ padding: 16, position: 'sticky', top: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 500, marginBottom: 12 }}>
            <i className="ti ti-shopping-cart" style={{ fontSize: 14, verticalAlign: '-2px', marginRight: 6 }} />
            Keranjang
          </h3>
          {cart.length === 0 ? (
            <p style={{ fontSize: 12, color: 'var(--text-hint)', textAlign: 'center', padding: '20px 0' }}>Belum ada item</p>
          ) : (
            <>
              {cart.map(item => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, padding: '5px 0', borderBottom: '0.5px solid var(--border)' }}>
                  <span>{item.nama} x{item.qty}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 500 }}>{fmtRp(item.harga * item.qty)}</span>
                    <button className="btn" style={{ fontSize: 11, padding: '1px 6px', color: 'var(--red)', borderColor: 'var(--red)' }} onClick={() => removeCart(item.id)}>-</button>
                  </div>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 500, fontSize: 14, margin: '10px 0' }}>
                <span>Total</span><span>{fmtRp(total)}</span>
              </div>
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={checkout}>Bayar</button>
            </>
          )}
        </div>
      </div>

      {toast && (
        <div style={{ position: 'fixed', bottom: 20, right: 20, background: 'var(--blue)', color: 'white', padding: '8px 16px', borderRadius: 8, fontSize: 13, zIndex: 200 }}>
          {toast}
        </div>
      )}

      {/* Modal Nota Warung */}
      {receipt && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300 }}>
          <div className="card" style={{ width: 'min(320px, calc(100vw - 32px))', overflow: 'hidden' }}>
            <div id="nota-warung" style={{ padding: 24, fontFamily: 'monospace', fontSize: 13 }}>
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <div style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <i className="ti ti-shopping-bag" /> ZBilliar — Warung
                </div>
                <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>Kantin & Minuman</div>
                <div style={{ borderTop: '1px dashed #ccc', margin: '12px 0' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: 12, marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#888' }}>Tanggal</span>
                  <span>{new Date(receipt.waktu).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#888' }}>Jam</span>
                  <span>{new Date(receipt.waktu).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>

              <div style={{ borderTop: '1px dashed #ccc', margin: '12px 0' }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, marginBottom: 12 }}>
                {receipt.items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{item.nama} ×{item.qty}</span>
                    <span>{fmtRp(item.harga * item.qty)}</span>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '1px dashed #ccc', margin: '12px 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 14, marginBottom: 12 }}>
                <span>TOTAL</span>
                <span>{fmtRp(receipt.total)}</span>
              </div>

              <div style={{ borderTop: '1px dashed #ccc', margin: '12px 0' }} />

              <div style={{ textAlign: 'center', fontSize: 11, color: '#888' }}>
                <p>Terima kasih!</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, padding: '0 20px 20px' }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => window.print()}>
                <i className="ti ti-printer" style={{ marginRight: 6, verticalAlign: '-2px' }} />
                Cetak
              </button>
              <button className="btn" style={{ flex: 1 }} onClick={() => setReceipt(null)}>Tutup</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
