import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Biliar Pro — Sistem Rental Biliar',
  description: 'Manajemen rental biliar modern',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.0.0/dist/tabler-icons.min.css" />
      </head>
      <body>{children}</body>
    </html>
  )
}
