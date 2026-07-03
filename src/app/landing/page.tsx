import Link from 'next/link'

const features = [
  { icon: '⏱️', name: 'Timer Real-Time', desc: 'Hitung waktu sewa tiap meja otomatis — mulai, jeda, checkout satu klik.' },
  { icon: '🎯', name: 'Multi-Meja', desc: 'Pantau semua meja dari satu dashboard — status kosong, main, atau reserve.' },
  { icon: '💰', name: 'Kasir Otomatis', desc: 'Tarif per jam terhitung sendiri saat checkout, langsung cetak ringkasan.' },
  { icon: '🍔', name: 'Warung', desc: 'Jual makanan & minuman bareng sewa meja, satu keranjang, satu nota.' },
  { icon: '🏆', name: 'Member & Poin', desc: 'Daftar member, poin otomatis tiap transaksi, riwayat main lengkap.' },
  { icon: '📊', name: 'Laporan Lengkap', desc: 'Omzet harian/mingguan/bulanan, meja paling laris, jam paling ramai.' },
  { icon: '🔄', name: 'Shift Operator', desc: 'Ganti operator antar shift, riwayat pendapatan per shift tercatat rapi.' },
  { icon: '☁️', name: 'Cloud Based', desc: 'Akses dari mana saja, data tersimpan aman, tidak perlu server sendiri.' },
]

const plans = [
  {
    name: 'Bulanan', price: 'Rp 100.000', period: '/bulan',
    catatan: 'Ditagih tiap bulan, berhenti kapan saja',
    highlight: false,
  },
  {
    name: 'Tahunan', price: 'Rp 1.000.000', period: '/tahun',
    catatan: 'Setara Rp 83.333/bulan — hemat 2 bulan',
    highlight: true,
  },
]

const fiturSemuaPaket = ['Semua Meja & Timer Unlimited', 'Kasir & Warung', 'Member & Poin', 'Laporan Lengkap', 'Multi Shift Operator']

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0B1120', color: '#E2E8F0', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Navbar */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 20 }}>🎱</span>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#10B981' }}>ZBILLIAR</span>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link href="/login" style={{ color: '#94A3B8', fontSize: 13, textDecoration: 'none' }}>Masuk</Link>
          <Link href="/login" style={{ background: '#10B981', color: '#0F1623', padding: '8px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
            Mulai Sekarang
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '80px 24px 60px', maxWidth: 800, margin: '0 auto' }}>
        <div style={{ display: 'inline-block', padding: '6px 14px', borderRadius: 20, background: 'rgba(16,185,129,0.12)', color: '#10B981', fontSize: 12, fontWeight: 500, marginBottom: 20 }}>
          🎱 Sistem Manajemen Rental Biliar
        </div>
        <h1 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 800, lineHeight: 1.2, margin: '0 0 16px' }}>
          Kelola Rental Biliar <span style={{ color: '#10B981' }}>Tanpa Ribet</span>
        </h1>
        <p style={{ fontSize: 16, color: '#94A3B8', lineHeight: 1.6, maxWidth: 600, margin: '0 auto 32px' }}>
          Timer per meja, kasir otomatis, warung, member, dan laporan — semua dalam satu aplikasi.
          Tidak perlu catat manual atau hitung tarif sendiri lagi.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/login" style={{ background: '#10B981', color: '#0F1623', padding: '12px 28px', borderRadius: 10, fontSize: 15, fontWeight: 700, textDecoration: 'none' }}>
            Mulai Sekarang →
          </Link>
          <a href="#fitur" style={{ border: '1px solid rgba(255,255,255,0.15)', padding: '12px 28px', borderRadius: 10, fontSize: 15, fontWeight: 500, color: '#94A3B8', textDecoration: 'none' }}>
            Lihat Fitur
          </a>
        </div>
      </section>

      {/* Features */}
      <section id="fitur" style={{ padding: '60px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, textAlign: 'center', marginBottom: 40 }}>Fitur Lengkap</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
          {features.map(f => (
            <div key={f.name} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 24 }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{f.name}</div>
              <div style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.5 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="harga" style={{ padding: '60px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, textAlign: 'center', marginBottom: 8 }}>Harga Sederhana</h2>
        <p style={{ textAlign: 'center', color: '#94A3B8', fontSize: 14, marginBottom: 40 }}>Satu paket, semua fitur — pilih bulanan atau tahunan</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, alignItems: 'start', maxWidth: 600, margin: '0 auto' }}>
          {plans.map(p => (
            <div key={p.name} style={{
              background: p.highlight ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.03)',
              border: p.highlight ? '2px solid #10B981' : '1px solid rgba(255,255,255,0.08)',
              borderRadius: 14, padding: 28, position: 'relative',
            }}>
              {p.highlight && <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#10B981', color: '#0F1623', padding: '4px 12px', borderRadius: 10, fontSize: 10, fontWeight: 700 }}>PALING HEMAT</div>}
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{p.name}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                <span style={{ fontSize: 24, fontWeight: 800, color: '#10B981' }}>{p.price}</span>
                <span style={{ fontSize: 12, color: '#64748B' }}>{p.period}</span>
              </div>
              <div style={{ fontSize: 11, color: '#64748B', marginBottom: 16 }}>{p.catatan}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                {fiturSemuaPaket.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#CBD5E1' }}>
                    <span style={{ color: '#34D399' }}>✓</span>{f}
                  </div>
                ))}
              </div>
              <Link href="/login" style={{
                display: 'block', textAlign: 'center', padding: '10px',
                background: p.highlight ? '#10B981' : 'transparent',
                border: p.highlight ? 'none' : '1px solid rgba(255,255,255,0.15)',
                borderRadius: 8, fontSize: 13, fontWeight: 600,
                color: p.highlight ? '#0F1623' : '#94A3B8',
                textDecoration: 'none',
              }}>
                Pilih {p.name}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: '40px 24px 60px', maxWidth: 700, margin: '0 auto' }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, textAlign: 'center', marginBottom: 24 }}>FAQ</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { q: 'Berapa biayanya?', a: 'Rp 100.000/bulan atau Rp 1.000.000/tahun (hemat 2 bulan) — satu paket, semua fitur, tanpa batasan jumlah meja.' },
            { q: 'Bisa dipakai di HP?', a: 'Bisa. Aplikasi berjalan di browser, responsive di HP, tablet, maupun komputer kasir.' },
            { q: 'Data aman?', a: 'Aman — data tersimpan di database terenkripsi, hosting di Railway, akses pakai login dengan token aman.' },
            { q: 'Ada biaya tersembunyi?', a: 'Tidak ada. Harga yang tertera sudah termasuk semua fitur, tanpa biaya tambahan.' },
          ].map((faq) => (
            <details key={faq.q} style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '2px 0' }}>
              <summary style={{ cursor: 'pointer', padding: '12px 16px', fontSize: 13, fontWeight: 500 }}>{faq.q}</summary>
              <div style={{ padding: '0 16px 14px', fontSize: 12, color: '#94A3B8', lineHeight: 1.6 }}>{faq.a}</div>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ textAlign: 'center', padding: '60px 24px 80px' }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>Siap Kelola Rental Biliar?</h2>
        <p style={{ color: '#94A3B8', fontSize: 14, marginBottom: 28 }}>Rp 100.000/bulan atau Rp 1.000.000/tahun. Batal kapan saja.</p>
        <Link href="/login" style={{ background: '#10B981', color: '#0F1623', padding: '14px 32px', borderRadius: 10, fontSize: 16, fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}>
          Mulai Sekarang →
        </Link>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '20px 24px', textAlign: 'center', fontSize: 12, color: '#475569' }}>
        © 2026 ZBilliar — Sistem Manajemen Rental Biliar
      </footer>
    </div>
  )
}
