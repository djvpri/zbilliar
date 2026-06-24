import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

function randomDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

async function main() {
  console.log('🌱 Seeding database...')

  // ========== USERS ==========
  const adminPass = await bcrypt.hash('admin123', 10)
  const kasirPass = await bcrypt.hash('kasir123', 10)

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: { nama: 'Administrator', username: 'admin', password: adminPass, role: 'ADMIN' },
  })

  const kasir1 = await prisma.user.upsert({
    where: { username: 'kasir1' },
    update: {},
    create: { nama: 'Budi Santoso', username: 'kasir1', password: kasirPass, role: 'KASIR' },
  })

  const kasir2 = await prisma.user.upsert({
    where: { username: 'kasir2' },
    update: {},
    create: { nama: 'Sari Wulandari', username: 'kasir2', password: kasirPass, role: 'KASIR' },
  })

  console.log('✅ Users: admin, kasir1, kasir2')

  // ========== MEJA ==========
  const mejaNames = [
    'VIP 1', 'VIP 2', 'Reguler 1', 'Reguler 2', 'Reguler 3',
    'Reguler 4', 'Reguler 5', 'Reguler 6', 'Reguler 7', 'Reguler 8',
    'Family 1', 'Family 2',
  ]

  for (let i = 0; i < mejaNames.length; i++) {
    await prisma.meja.upsert({
      where: { nomor: i + 1 },
      update: {},
      create: { nomor: i + 1, nama: mejaNames[i] },
    })
  }
  console.log('✅ 12 meja created')

  // ========== MENU WARUNG ==========
  const menuItems = [
    // Minuman
    { nama: 'Air mineral', harga: 3000, kategori: 'minuman' },
    { nama: 'Teh manis', harga: 5000, kategori: 'minuman' },
    { nama: 'Kopi hitam', harga: 6000, kategori: 'minuman' },
    { nama: 'Es teh', harga: 7000, kategori: 'minuman' },
    { nama: 'Kopi susu', harga: 8000, kategori: 'minuman' },
    { nama: 'Es jeruk', harga: 7000, kategori: 'minuman' },
    { nama: 'Jus alpukat', harga: 10000, kategori: 'minuman' },
    { nama: 'Jus mangga', harga: 10000, kategori: 'minuman' },
    // Makanan
    { nama: 'Indomie rebus', harga: 12000, kategori: 'makanan' },
    { nama: 'Indomie goreng', harga: 12000, kategori: 'makanan' },
    { nama: 'Gorengan (3 pcs)', harga: 5000, kategori: 'makanan' },
    { nama: 'Nasi goreng', harga: 15000, kategori: 'makanan' },
    { nama: 'Mie goreng spesial', harga: 18000, kategori: 'makanan' },
    { nama: 'Kentang goreng', harga: 12000, kategori: 'makanan' },
    // Snack
    { nama: 'Chitato', harga: 8000, kategori: 'snack' },
    { nama: 'Taro', harga: 5000, kategori: 'snack' },
    { nama: 'Oreo', harga: 6000, kategori: 'snack' },
    // Rokok
    { nama: 'Rokok Surya 12', harga: 18000, kategori: 'rokok' },
    { nama: 'Rokok Sampoerna A', harga: 20000, kategori: 'rokok' },
    { nama: 'Rokok Djarum Super', harga: 22000, kategori: 'rokok' },
  ]

  for (const item of menuItems) {
    await prisma.menuItem.create({ data: item }).catch(() => {})
  }
  console.log('✅ 20 menu warung items')

  // ========== MEMBERS ==========
  const memberData = [
    { nama: 'Andi Prasetyo', telp: '081234567890' },
    { nama: 'Dewi Lestari', telp: '085678901234' },
    { nama: 'Rudi Hartono', telp: '087890123456' },
    { nama: 'Siti Rahayu', telp: '081122334455' },
    { nama: 'Bambang Setiawan', telp: '085566778899' },
    { nama: 'Eka Putri', telp: '081987654321' },
    { nama: 'Hendra Wijaya', telp: '085321678901' },
    { nama: 'Lina Marlina', telp: '087654321098' },
  ]

  const members = []
  for (const m of memberData) {
    const member = await prisma.member.create({ data: m }).catch(() => null)
    if (member) members.push(member)
  }
  console.log(`✅ ${members.length} members created`)

  // ========== SAMPLE SESSIONS & TRANSACTIONS (30 hari terakhir) ==========
  console.log('📊 Creating sample sessions & transactions...')

  const tarifOptions = [15000, 20000, 10000]
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  let totalSesi = 0
  let totalTransaksi = 0

  // Create 5-10 sessions per day for 30 days
  for (let day = 0; day < 30; day++) {
    const date = new Date(thirtyDaysAgo)
    date.setDate(date.getDate() + day)
    
    const jumlahSesiPerHari = randomInt(5, 10)
    
    for (let s = 0; s < jumlahSesiPerHari; s++) {
      const mejaNomor = randomInt(1, 12)
      const meja = await prisma.meja.findUnique({ where: { nomor: mejaNomor } })
      if (!meja) continue

      const tarif = tarifOptions[randomInt(0, 2)]
      const durasi = randomInt(30, 180) // 30-180 minutes
      const mulai = randomDate(date, new Date(date.getTime() + 12 * 60 * 60 * 1000))
      const selesai = new Date(mulai.getTime() + durasi * 60 * 1000)
      const biaya = Math.ceil((durasi / 60) * tarif)
      
      const pelangganNames = [
        'Tamu Walk-in', 'Rina', 'Dodi', 'Tono', 'Wati', 'Joko', 'Ani',
        'Hadi', 'Mega', 'Dedi', 'Ratna', 'Ari', 'Dina', 'Fandi', 'Yuni',
      ]
      const pelanggan = pelangganNames[randomInt(0, pelangganNames.length - 1)]
      
      const member = members.length > 0 && Math.random() > 0.6 
        ? members[randomInt(0, members.length - 1)] 
        : null

      // Create session
      const sesi = await prisma.sesi.create({
        data: {
          mejaId: meja.id,
          pelanggan,
          memberId: member?.id || null,
          tarif,
          mulai,
          selesai,
          durasi,
          biaya,
          status: 'SELESAI',
        },
      })

      // Create transaction
      const user = [admin, kasir1, kasir2][randomInt(0, 2)]
      await prisma.transaksi.create({
        data: {
          sesiId: sesi.id,
          userId: user.id,
          jenis: 'SEWA',
          total: biaya,
          createdAt: mulai,
        },
      })

      // Update member poin
      if (member) {
        const poinBaru = Math.floor(biaya / 1000)
        await prisma.member.update({
          where: { id: member.id },
          data: { poin: { increment: poinBaru } },
        })
      }

      totalSesi++
      totalTransaksi++

      // Sometimes add warung transaction
      if (Math.random() > 0.6) {
        const warungItems = await prisma.menuItem.findMany({ where: { aktif: true } })
        const numItems = randomInt(1, 3)
        const selectedItems = []
        let warungTotal = 0

        for (let i = 0; i < numItems; i++) {
          const item = warungItems[randomInt(0, warungItems.length - 1)]
          const qty = randomInt(1, 2)
          selectedItems.push({ ...item, qty })
          warungTotal += item.harga * qty
        }

        await prisma.transaksi.create({
          data: {
            userId: user.id,
            jenis: 'WARUNG',
            total: warungTotal,
            items: selectedItems,
            createdAt: randomDate(mulai, selesai),
          },
        })
        totalTransaksi++
      }
    }
  }

  console.log(`✅ ${totalSesi} sessions created`)
  console.log(`✅ ${totalTransaksi} transactions created`)

  // ========== SHIFTS ==========
  for (let day = 0; day < 7; day++) {
    const date = new Date(now.getTime() - day * 24 * 60 * 60 * 1000)
    const shiftMulai = new Date(date)
    shiftMulai.setHours(7, 0, 0, 0)
    const shiftSelesai = new Date(date)
    shiftSelesai.setHours(15, 0, 0, 0)

    const user = [admin, kasir1, kasir2][randomInt(0, 2)]
    
    // Count sessions during this shift
    const sesiCount = await prisma.sesi.count({
      where: {
        mulai: { gte: shiftMulai, lte: shiftSelesai },
        status: 'SELESAI',
      },
    })

    const pendapatan = await prisma.transaksi.aggregate({
      where: {
        createdAt: { gte: shiftMulai, lte: shiftSelesai },
        jenis: 'SEWA',
      },
      _sum: { total: true },
    })

    await prisma.shift.create({
      data: {
        userId: user.id,
        mulai: shiftMulai,
        selesai: shiftSelesai,
        totalSesi: sesiCount,
        totalPendapatan: pendapatan._sum.total || 0,
      },
    })
  }
  console.log('✅ 7 shifts created')

  console.log('\n🎉 Seed completed!')
  console.log('Login: admin / admin123')
  console.log('Kasir: kasir1 / kasir123, kasir2 / kasir123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
