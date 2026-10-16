// Función serverless de Vercel: recibe una imagen ya comprimida y la guarda en Cloudflare R2.
// Las claves de R2 viven SOLO aquí (variables de entorno del servidor), nunca en el navegador.
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')

const MAX_BYTES = 4 * 1024 * 1024 // Vercel permite ~4.5 MB por petición
const ALLOWED = { 'image/webp': 'webp', 'image/jpeg': 'jpg', 'image/png': 'png', 'image/gif': 'gif' }

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let size = 0
    req.on('data', c => {
      size += c.length
      if (size > MAX_BYTES) { reject(new Error('too_big')); req.destroy(); return }
      chunks.push(c)
    })
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' })

  const adminPass = process.env.ADMIN_PASSWORD || process.env.VITE_ADMIN_PASSWORD
  if (!adminPass || req.headers['x-admin-password'] !== adminPass) {
    return res.status(401).json({ error: 'No autorizado' })
  }

  const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET } = process.env
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET) {
    return res.status(500).json({ error: 'Faltan variables R2_* en Vercel' })
  }

  const contentType = (req.headers['content-type'] || '').split(';')[0].trim()
  const ext = ALLOWED[contentType]
  if (!ext) return res.status(400).json({ error: 'Tipo de archivo no permitido' })

  let body
  try { body = await readBody(req) }
  catch (e) { return res.status(413).json({ error: 'Imagen demasiado grande' }) }
  if (!body.length) return res.status(400).json({ error: 'Archivo vacío' })

  const prefix = String(req.headers['x-prefix'] || 'img').replace(/[^a-z0-9]/gi, '').slice(0, 20) || 'img'
  const filename = `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`

  try {
    const s3 = new S3Client({
      region: 'auto',
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
    })
    await s3.send(new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: filename,
      Body: body,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000, immutable',
    }))
    return res.status(200).json({ filename })
  } catch (e) {
    return res.status(500).json({ error: 'Error al guardar en R2: ' + e.message })
  }
}

module.exports.config = { api: { bodyParser: false } }
