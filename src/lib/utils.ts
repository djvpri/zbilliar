export function fmtRp(n: number) {
  return 'Rp ' + Math.round(n).toLocaleString('id-ID')
}

export function fmtDurasi(menit: number) {
  const h = Math.floor(menit / 60)
  const m = menit % 60
  if (h === 0) return `${m} mnt`
  return `${h} jam ${m > 0 ? m + ' mnt' : ''}`
}

export function hitungBiaya(tarifPerJam: number, mulai: Date, selesai: Date) {
  const menit = Math.ceil((selesai.getTime() - mulai.getTime()) / 60000)
  const biaya = Math.ceil((menit / 60) * tarifPerJam)
  return { menit, biaya }
}
