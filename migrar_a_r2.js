// Script de migración Supabase Storage → Cloudflare R2
// Ejecutar con: node migrar_a_r2.js

const https = require('https')
const http = require('http')

const SUPABASE_URL = 'https://bvgctphzqrnymwcvxvrf.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2Z2N0cGh6cXJueW13Y3Z4dnJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3MDI5ODEsImV4cCI6MjA5NDI3ODk4MX0.bkL5BxFt2uHfwi81FGe1LPbdFVI4u786vjy0NvCYoSM'

const CF_ACCOUNT_ID = '0e312fb52e193dc59cdce134f8f2c373'
const CF_ACCESS_KEY = '079661cd13c64f2f10b2ddd9dc46959c'
const CF_SECRET_KEY = 'fae8ed040312400a2d10ca492645fe60ce84855e8acdd8bf753988616dcd3b8c'
const CF_BUCKET = 'laloba-store'
const CF_ENDPOINT = `https://${CF_ACCOUNT_ID}.r2.cloudflarestorage.com`

// Use AWS SDK v3 for S3-compatible upload
async function main() {
  console.log('🚀 Iniciando migración Supabase → Cloudflare R2...\n')

  // Check if @aws-sdk/client-s3 is available
  let S3Client, PutObjectCommand
  try {
    const s3Module = require('@aws-sdk/client-s3')
    S3Client = s3Module.S3Client
    PutObjectCommand = s3Module.PutObjectCommand
  } catch(e) {
    console.log('Instalando dependencias...')
    const { execSync } = require('child_process')
    execSync('npm install @aws-sdk/client-s3 node-fetch@2', { stdio: 'inherit' })
    const s3Module = require('@aws-sdk/client-s3')
    S3Client = s3Module.S3Client
    PutObjectCommand = s3Module.PutObjectCommand
  }

  const fetch = require('node-fetch')

  const s3 = new S3Client({
    region: 'auto',
    endpoint: CF_ENDPOINT,
    credentials: {
      accessKeyId: CF_ACCESS_KEY,
      secretAccessKey: CF_SECRET_KEY,
    },
  })

  // 1. Get all files from Supabase storage
  console.log('📋 Obteniendo lista de archivos de Supabase...')
  const listRes = await fetch(`${SUPABASE_URL}/storage/v1/object/list/Camisetas`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ limit: 1000, offset: 0 })
  })
  const files = await listRes.json()
  
  if (!Array.isArray(files)) {
    console.error('Error obteniendo archivos:', files)
    return
  }

  console.log(`✅ ${files.length} archivos encontrados\n`)

  let migrated = 0, failed = 0

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const filename = file.name
    
    process.stdout.write(`[${i+1}/${files.length}] ${filename}... `)

    try {
      // Download from Supabase
      const dlRes = await fetch(
        `${SUPABASE_URL}/storage/v1/object/public/Camisetas/${filename}`,
        { headers: { 'Authorization': `Bearer ${SUPABASE_KEY}` } }
      )
      
      if (!dlRes.ok) {
        console.log('❌ Error descargando')
        failed++
        continue
      }

      const buffer = await dlRes.buffer()
      const contentType = dlRes.headers.get('content-type') || 'image/jpeg'

      // Upload to R2
      await s3.send(new PutObjectCommand({
        Bucket: CF_BUCKET,
        Key: filename,
        Body: buffer,
        ContentType: contentType,
      }))

      console.log('✅')
      migrated++

    } catch(e) {
      console.log('❌ ' + e.message)
      failed++
    }

    // Small delay to avoid rate limiting
    if (i % 10 === 0 && i > 0) {
      await new Promise(r => setTimeout(r, 500))
    }
  }

  console.log(`\n✅ Migración completada: ${migrated} exitosos, ${failed} fallidos`)
  console.log(`\n🌐 URL base de imágenes: https://pub-88e3eaefac864b04ad310f41c9744813.r2.dev/`)
}

main().catch(console.error)
