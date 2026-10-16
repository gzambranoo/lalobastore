import { useState, useEffect } from 'react'
import { supabase, STORAGE_URL } from '../lib/supabase'
import { uploadImage, fmtKB } from '../lib/uploadImage'

export default function BannersAdmin() {
  const [banners, setBanners] = useState([])
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)
  const [missing, setMissing] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    const { data, error } = await supabase.from('banners').select('*').order('orden', { ascending: true }).order('created_at', { ascending: true })
    if (error) { setMissing(true); return }
    setMissing(false); setBanners(data || [])
  }

  async function addFile(file) {
    setBusy(true); setStatus('Comprimiendo y subiendo...')
    try {
      const r = await uploadImage(file, 'banner', { maxSize: 2200, quality: 0.85 })
      const { error } = await supabase.from('banners').insert({ imagen: r.filename, orden: banners.length })
      if (error) throw new Error(error.message)
      setStatus(`✓ Banner subido · ${fmtKB(r.before)} → ${fmtKB(r.after)}`)
      load()
    } catch (e) { setStatus('Error: ' + e.message) }
    setBusy(false)
    setTimeout(() => setStatus(''), 4000)
  }

  function handlePaste(e) {
    const items = e.clipboardData?.items
    if (!items) return
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault()
        const blob = item.getAsFile()
        if (blob) addFile(blob)
        break
      }
    }
  }

  async function remove(b) {
    if (!confirm('¿Quitar este banner de la portada?')) return
    await supabase.from('banners').delete().eq('id', b.id)
    load()
  }

  async function move(i, dir) {
    const j = i + dir
    if (j < 0 || j >= banners.length) return
    const a = banners[i], b = banners[j]
    await supabase.from('banners').update({ orden: j }).eq('id', a.id)
    await supabase.from('banners').update({ orden: i }).eq('id', b.id)
    load()
  }

  if (missing) {
    return (
      <div style={{ background: 'var(--tint-amber)', border: '1px solid var(--amber)', borderRadius: '12px', padding: '18px', color: 'var(--text)', fontSize: '14px', lineHeight: 1.6 }}>
        Falta crear la tabla <b>banners</b> en Supabase. Corre el SQL que te dio Claude en el SQL Editor y vuelve a abrir esta pestaña.
      </div>
    )
  }

  return (
    <div>
      <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '4px', color: 'var(--text)' }}>🖼️ Banners de la portada</h2>
      <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '16px', lineHeight: 1.5 }}>
        Fotos horizontales que rotan de fondo en la portada. Mejor si son anchas (por ejemplo 1920×800) y con la zona izquierda más despejada, porque ahí va el texto. Con 1 foto queda fija; con 2 o más rotan solas.
      </p>

      <div onPaste={handlePaste} tabIndex={0} style={{ border: '2px dashed #cc1a1a', borderRadius: '12px', padding: '22px', textAlign: 'center', background: 'var(--accent-soft)', outline: 'none', marginBottom: '10px' }}>
        <div style={{ fontSize: '24px' }}>📋</div>
        <div style={{ color: '#cc1a1a', fontWeight: 700, fontSize: '14px' }}>Haz clic aquí y pega con Ctrl+V</div>
        <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{status || 'o usa el botón de abajo'}</div>
      </div>
      <label style={{ display: 'block', border: '1px dashed var(--border2)', borderRadius: '10px', padding: '12px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px', cursor: 'pointer', marginBottom: '20px' }}>
        📁 O selecciona una foto desde tu computador
        <input type="file" accept="image/*" disabled={busy} style={{ display: 'none' }} onChange={e => { if (e.target.files[0]) addFile(e.target.files[0]); e.target.value = '' }} />
      </label>

      {banners.length === 0 ? (
        <div style={{ color: 'var(--faint)', fontSize: '13px', textAlign: 'center', padding: '20px' }}>Aún no hay banners. La portada usa el fondo por defecto.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {banners.map((b, i) => (
            <div key={b.id} style={{ display: 'flex', gap: '12px', alignItems: 'center', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '10px' }}>
              <img src={STORAGE_URL + b.imagen} alt="" style={{ width: '160px', height: '70px', objectFit: 'cover', borderRadius: '8px' }} />
              <div style={{ flex: 1, fontSize: '13px', color: 'var(--text2)' }}>Banner {i + 1}</div>
              <button onClick={() => move(i, -1)} disabled={i === 0} style={{ background: 'var(--card2)', border: '1px solid var(--border2)', color: 'var(--text)', borderRadius: '8px', width: '34px', height: '34px', opacity: i === 0 ? .4 : 1 }}>↑</button>
              <button onClick={() => move(i, 1)} disabled={i === banners.length - 1} style={{ background: 'var(--card2)', border: '1px solid var(--border2)', color: 'var(--text)', borderRadius: '8px', width: '34px', height: '34px', opacity: i === banners.length - 1 ? .4 : 1 }}>↓</button>
              <button onClick={() => remove(b)} style={{ background: 'var(--tint-red)', border: '1px solid #7f1d1d', color: '#cc1a1a', borderRadius: '8px', width: '34px', height: '34px' }}>🗑️</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
