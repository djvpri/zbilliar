import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Seed users
  const adminPass = await bcrypt.hash('admin123', 10)
  const kasirPass = await bcrypt.hash('kasir123', 10)

  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: { nama: 'Administrator', username: 'admin', password: adminPass, role: 'ADMIN' }
  })
  await prisma.user.upsert({
    where: { username: 'kasir1' },
    update: {},
    create: { nama: 'Budi Santoso', username: 'kasir1', password: kasirPass, role: 'KASIR' }
  })

  // Seed 10 meja
  for (let i = 1; i <= 10; i++) {
    await prisma.meja.upsert({
      where: { nomor: i },
      update: {},
      create: { nomor: i, nama: `Meja ${i}` }
    })
  }

  // Seed menu warung
  const menu = [
    { nama: 'Air mineral', harga: 3000, kategori: 'minuman' },
    { nama: 'Teh manis', harga: 5000, kategori: 'minuman' },
    { nama: 'Kopi hitam', harga: 6000, kategori: 'minuman' },
    { nama: 'Es teh', harga: 7000, kategori: 'minuman' },
    { nama: 'Kopi susu', harga: 8000, kategori: 'minuman' },
    { nama: 'Indomie rebus', harga: 12000, kategori: 'makanan' },
    { nama: 'Gorengan (3 pcs)', harga: 5000, kategori: 'makanan' },
    { nama: 'Energen', harga: 8000, kategori: 'minuman' },
    { nama: 'Rokok Surya', harga: 25000, kategori: 'rokok' },
    { nama: 'Rokok Sampoerna', harga: 28000, kategori: 'rokok' },
  ]
  for (const item of menu) {
    await prisma.menuItem.create({ data: item }).catch(() => {})
  }

  console.log('Seed selesai!')
}

main().catch(console.error).finally(() => prisma.$disconnect())
