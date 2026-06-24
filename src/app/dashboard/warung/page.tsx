'use client'
import { useEffect, useState } from 'react'
import { fmtRp } from '@/lib/utils'

type MenuItem = { id: string; nama: string; harga: number; kategori: string }
type CartItem = MenuItem & { qty: number }

export default function WarungPage() {
  const [menu, setMenu] = useState<MenuItem[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [toast, setToast] = useState('')

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
    await fetch('/api/warung/transaksi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cart, total })
    })
    setCart([])
    setToast(`Pembayaran ${fmtRp(total)} berhasil`)
    setTimeout(() => setToast(''), 2500)
  }

  const kategori = [...new Set(menu.map(m => m.kategori))]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>
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

      <div className="card" style={{ padding: 16, position: 'sticky', top: 20 }}>
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

      {toast && (
        <div style={{ position: 'fixed', bottom: 20, right: 20, background: 'var(--blue)', color: 'white', padding: '8px 16px', borderRadius: 8, fontSize: 13, zIndex: 200 }}>
          {toast}
        </div>
      )}
    </div>
  )
}
