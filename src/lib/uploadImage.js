import { ADMIN_PASSWORD } from './supabase'

// Reduce el peso de la foto sin que se note: máx. 1600 px por lado, WebP calidad 0.82.
export async function compressImage(file, { maxSize = 1600, quality = 0.82 } = {}) {
  if (file.type === 'image/gif') return file
  let bitmap
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  } catch {
    return file // si el navegador no puede leerla, se sube tal cual
  }
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height))
  const w = Math.round(bitmap.width * scale)
  const h = Math.round(bitmap.height * scale)
  const canvas = document.createElement('canvas')
  canvas.width = w; canvas.height = h
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, w, h)
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(bitmap, 0, 0, w, h)
  bitmap.close?.()

  const toBlob = (type) => new Promise(r => canvas.toBlob(r, type, quality))
  let out = await toBlob('image/webp')
  if (!out || out.type !== 'image/webp') out = await toBlob('image/jpeg')
  // Si por algún motivo quedó más pesada que la original, se conserva la original
  return out && out.size < file.size ? out : file
}

// Comprime y sube a R2 vía /api/upload. Devuelve { filename, before, after }.
export async function uploadImage(file, prefix = 'img') {
  const blob = await compressImage(file)
  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: {
      'Content-Type': blob.type || 'image/jpeg',
      'x-admin-password': ADMIN_PASSWORD || '',
      'x-prefix': prefix,
    },
    body: blob,
  })
  let data = {}
  try { data = await res.json() } catch {}
  if (!res.ok) throw new Error(data.error || `Error ${res.status}`)
  return { filename: data.filename, before: file.size, after: blob.size }
}

export const fmtKB = (n) => n >= 1048576 ? (n / 1048576).toFixed(1) + ' MB' : Math.round(n / 1024) + ' KB'
