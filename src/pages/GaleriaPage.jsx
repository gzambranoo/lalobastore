import { useState, useEffect } from 'react'
import { supabase, STORAGE_URL } from '../lib/supabase'

export default function GaleriaPage({ isAdmin }) {
  const [fotos, setFotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [desc, setDesc] = useState('')
  const [uploadStatus, setUploadStatus] = useState('')

  useEffect(() => { loadFotos() }, [])

  async function loadFotos() {
    setLoading(true)
    const { data } = await supabase.from('galeria').select('*').order('created_at', { ascending: false })
    if (data) setFotos(data)
    setLoading(false)
  }

  async function uploadFile(file) {
    setUploading(true)
    setUploadStatus('Subiendo...')
    const ext = file.name.split('.').pop().replace(/[^a-z]/g, '') || 'jpg'
    const filename = `galeria_${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('Camisetas').upload(filename, file, { contentType: file.type })
    if (error) { setUploadStatus('Error: ' + error.message); setUploading(false); return }
    await supabase.from('galeria').insert({ imagen: filename, descripcion: desc.trim() || null })
    setDesc('')
    setUploadStatus('✓ Foto subida')
    setTimeout(() => setUploadStatus(''), 2000)
    setUploading(false)
    loadFotos()
  }

  async function handlePaste(e) {
    const items = e.clipboardData?.items
    if (!items) return
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault()
        const blob = item.getAsFile()
        if (!blob) return
        setUploading(true)
        setUploadStatus('Subiendo imagen pegada...')
        const filename = `galeria_${Date.now()}.jpg`
        const { error } = await supabase.storage.from('Camisetas').upload(filename, blob, { contentType: 'image/jpeg' })
        if (!error) {
          await supabase.from('galeria').insert({ imagen: filename, descripcion: desc.trim() || null })
          setDesc('')
          setUploadStatus('✓ Foto subida')
          setTimeout(() => setUploadStatus(''), 2000)
          loadFotos()
        } else {
          setUploadStatus('Error: ' + error.message)
        }
        setUploading(false)
        break
      }
    }
  }

  async function deleteFoto(id) {
    if (!confirm('¿Eliminar esta foto?')) return
    await supabase.from('galeria').delete().eq('id', id)
    loadFotos()
  }

  return (
    <div style={{ paddingTop: '24px', maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '6px' }}>📸 Galería</h1>
      <p style={{ color: '#666', fontSize: '14px', marginBottom: '24px' }}>Fotos reales de camisetas entregadas a nuestros clientes</p>

      {/* Panel subida — solo admin */}
      {isAdmin && (
        <div style={{ background: '#141414', border: '2px solid #cc1a1a', borderRadius: '14px', padding: '18px', marginBottom: '24px' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#cc1a1a', marginBottom: '12px' }}>⚙️ Agregar foto (solo visible para ti)</div>

          <input value={desc} onChange={e => setDesc(e.target.value)}
            placeholder="Descripción opcional (ej: Liverpool Local 26/27)"
            style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '8px', padding: '9px 12px', color: '#fff', fontSize: '13px', outline: 'none', marginBottom: '10px' }} />

          {/* Paste zone */}
          <div onPaste={handlePaste} tabIndex={0}
            style={{ border: '2px dashed #cc1a1a', borderRadius: '10px', padding: '16px', textAlign: 'center', marginBottom: '8px', outline: 'none', background: '#1a0000', cursor: 'default' }}>
            <div style={{ fontSize: '20px', marginBottom: '4px' }}>📋</div>
            <div style={{ fontWeight: 700, color: '#cc1a1a', fontSize: '14px', marginBottom: '2px' }}>Pega aquí con Ctrl+V</div>
            <div style={{ fontSize: '11px', color: '#555' }}>Copia la imagen y pégala directamente</div>
          </div>

          {/* File picker */}
          <label style={{ display: 'block', border: '2px dashed #2a2a2a', borderRadius: '10px', padding: '12px', textAlign: 'center', cursor: 'pointer', color: '#666', fontSize: '13px', marginBottom: '8px' }}>
            <input type="file" accept="image/*" multiple style={{ display: 'none' }}
              onChange={e => { if (e.target.files[0]) uploadFile(e.target.files[0]) }} />
            📁 O selecciona un archivo desde tu computador
          </label>

          {uploadStatus && (
            <div style={{ fontSize: '12px', color: uploadStatus.startsWith('Error') ? '#cc1a1a' : '#4ade80', padding: '6px 10px', background: '#1a1a1a', borderRadius: '6px' }}>
              {uploading ? '⏳ ' : ''}{uploadStatus}
            </div>
          )}
        </div>
      )}

      {/* Gallery grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#444' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🐺</div>
          <div>Cargando galería...</div>
        </div>
      ) : fotos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#444' }}>
          <div style={{ fontSize: '48px', marginBottom: '14px' }}>📷</div>
          <div style={{ fontSize: '16px', marginBottom: '8px' }}>Aún no hay fotos en la galería</div>
          {isAdmin && <div style={{ fontSize: '13px', color: '#333' }}>Usa el panel de arriba para subir la primera foto</div>}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
          {fotos.map(foto => (
            <div key={foto.id} style={{ background: '#141414', borderRadius: '12px', overflow: 'hidden', border: '1px solid #1e1e1e', position: 'relative' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#cc1a1a'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#1e1e1e'}>
              <div onClick={() => setSelected(foto)} style={{ aspectRatio: '1', overflow: 'hidden', cursor: 'pointer' }}>
                <img src={STORAGE_URL + foto.imagen} alt={foto.descripcion || ''} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .2s' }}
                  onMouseEnter={e => e.target.style.transform = 'scale(1.04)'}
                  onMouseLeave={e => e.target.style.transform = 'scale(1)'} />
              </div>
              {foto.descripcion && (
                <div style={{ padding: '8px 10px', fontSize: '12px', color: '#aaa' }}>{foto.descripcion}</div>
              )}
              {isAdmin && (
                <button onClick={() => deleteFoto(foto.id)}
                  style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(204,26,26,.85)', border: 'none', borderRadius: '50%', width: '26px', height: '26px', color: '#fff', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {selected && (
        <div onClick={() => setSelected(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.95)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div onClick={e => e.stopPropagation()} style={{ maxWidth: '800px', width: '100%', position: 'relative' }}>
            <img src={STORAGE_URL + selected.imagen} alt="" style={{ width: '100%', borderRadius: '12px', maxHeight: '80vh', objectFit: 'contain' }} />
            {selected.descripcion && <div style={{ textAlign: 'center', color: '#ccc', marginTop: '12px', fontSize: '14px' }}>{selected.descripcion}</div>}
            <button onClick={() => setSelected(null)}
              style={{ position: 'absolute', top: '-12px', right: '-12px', background: '#cc1a1a', border: 'none', borderRadius: '50%', width: '32px', height: '32px', color: '#fff', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
