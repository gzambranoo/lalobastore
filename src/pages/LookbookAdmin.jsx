import { useState, useEffect, useMemo } from 'react'
import { supabase, STORAGE_URL } from '../lib/supabase'
import { uploadImage, fmtKB } from '../lib/uploadImage'

export default function LookbookAdmin({ products }) {
  const [items, setItems] = useState([])
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)
  const [missing, setMissing] = useState(false)
  const [filters, setFilters] = useState({}) // búsqueda de producto por foto

  useEffect(() => { load() }, [])

  async function load() {
    const { data, error } = await supabase.from('lookbook').select('*').order('orden', { ascending: true }).order('created_at', { ascending: true })
    if (error) { setMissing(true); return }
    setMissing(false); setItems(data || [])
  }

  const sorted = useMemo(() => [...products].sort((a, b) => a.nombre?.localeCompare(b.nombre, 'es')), [products])
  const byId = useMemo(() => Object.fromEntries(products.map(p => [String(p.id), p])), [products])

  async function addFiles(files) {
    setBusy(true)
    let n = 0, before = 0, after = 0, err = ''
    for (const file of files) {
      setStatus(`Comprimiendo y subiendo ${n + 1}/${files.length}...`)
      try {
        const r = await uploadImage(file, 'look', { maxSize: 1800, quality: 0.84 })
        const { error } = await supabase.from('lookbook').insert({ imagen: r.filename, orden: items.length + n, destacada: false })
        if (error) throw new Error(error.message)
        n++; before += r.before; after += r.after
      } catch (e) { err = e.message }
    }
    setStatus(n ? `✓ ${n} foto(s) subida(s) · ${fmtKB(before)} → ${fmtKB(after)}` : (err ? 'Error: ' + err : ''))
    setBusy(false); load()
    setTimeout(() => setStatus(''), 4000)
  }

  function handlePaste(e) {
    const items = e.clipboardData?.items
    if (!items) return
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault()
        const blob = item.getAsFile()
        if (blob) addFiles([blob])
        break
      }
    }
  }

  async function patch(id, fields) {
    await supabase.from('lookbook').update(fields).eq('id', id)
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...fields } : i))
  }

  async function remove(it) {
    if (!confirm('¿Eliminar esta foto del lookbook?')) return
    await supabase.from('lookbook').delete().eq('id', it.id)
    load()
  }

  async function move(i, dir) {
    const j = i + dir
    if (j < 0 || j >= items.length) return
    const a = items[i], b = items[j]
    await supabase.from('lookbook').update({ orden: j }).eq('id', a.id)
    await supabase.from('lookbook').update({ orden: i }).eq('id', b.id)
    load()
  }

  const featuredCount = items.filter(i => i.destacada).length

  if (missing) {
    return (
      <div style={{ background: 'var(--tint-amber)', border: '1px solid var(--amber)', borderRadius: '12px', padding: '18px', color: 'var(--text)', fontSize: '14px', lineHeight: 1.6 }}>
        Falta crear la tabla <b>lookbook</b> en Supabase. Corre el SQL que te dio Claude en el SQL Editor y vuelve a abrir esta pestaña.
      </div>
    )
  }

  const inputStyle = { width: '100%', background: 'var(--card2)', border: '1px solid var(--border2)', borderRadius: '8px', padding: '8px 10px', color: 'var(--text)', fontSize: '13px', outline: 'none' }

  return (
    <div>
      <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '4px', color: 'var(--text)' }}>📸 Lookbook 26/27</h2>
      <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '16px', lineHeight: 1.5 }}>
        Sube tus fotos con modelos, elige la camiseta que lleva puesta cada una y marca cuáles salen en la portada. La primera marcada se muestra grande y las siguientes 4 más pequeñas.
      </p>

      <div onPaste={handlePaste} tabIndex={0} style={{ border: '2px dashed #cc1a1a', borderRadius: '12px', padding: '22px', textAlign: 'center', background: 'var(--accent-soft)', outline: 'none', marginBottom: '10px' }}>
        <div style={{ fontSize: '24px' }}>📋</div>
        <div style={{ color: '#cc1a1a', fontWeight: 700, fontSize: '14px' }}>Haz clic aquí y pega con Ctrl+V</div>
        <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{status || 'o usa el botón de abajo'}</div>
      </div>
      <label style={{ display: 'block', border: '1px dashed var(--border2)', borderRadius: '10px', padding: '12px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px', cursor: 'pointer', marginBottom: '16px' }}>
        📁 O selecciona una o varias fotos desde tu computador
        <input type="file" accept="image/*" multiple disabled={busy} style={{ display: 'none' }} onChange={e => { if (e.target.files.length) addFiles([...e.target.files]); e.target.value = '' }} />
      </label>

      <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '10px' }}>
        {items.length} foto{items.length !== 1 ? 's' : ''} · {featuredCount} en portada {featuredCount > 5 && <span style={{ color: 'var(--amber)' }}>(solo se muestran las primeras 5)</span>}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {items.map((it, i) => {
          const q = (filters[it.id] || '').toLowerCase()
          const options = q ? sorted.filter(p => p.nombre?.toLowerCase().includes(q) || p.color?.toLowerCase().includes(q)) : sorted
          const linked = byId[String(it.camiseta_id)]
          return (
            <div key={it.id} style={{ display: 'flex', gap: '12px', background: 'var(--card)', border: `1px solid ${it.destacada ? '#cc1a1a' : 'var(--border)'}`, borderRadius: '12px', padding: '10px' }}>
              <img src={STORAGE_URL + it.imagen} alt="" style={{ width: '96px', height: '120px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 700, marginBottom: '4px' }}>Camiseta que lleva puesta</div>
                <input placeholder="Buscar camiseta..." value={filters[it.id] || ''} onChange={e => setFilters(f => ({ ...f, [it.id]: e.target.value }))} style={{ ...inputStyle, marginBottom: '6px' }} />
                <select value={it.camiseta_id || ''} onChange={e => patch(it.id, { camiseta_id: e.target.value || null })} style={inputStyle}>
                  <option value="">— Sin enlace —</option>
                  {linked && !options.includes(linked) && <option value={linked.id}>{linked.nombre}</option>}
                  {options.map(p => <option key={p.id} value={p.id}>{p.nombre}{p.color ? ` · ${p.color}` : ''}</option>)}
                </select>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px', fontSize: '13px', color: 'var(--text)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={!!it.destacada} onChange={e => patch(it.id, { destacada: e.target.checked })} />
                  Mostrar en la portada
                </label>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <button onClick={() => move(i, -1)} disabled={i === 0} style={{ background: 'var(--card2)', border: '1px solid var(--border2)', color: 'var(--text)', borderRadius: '8px', width: '34px', height: '34px', opacity: i === 0 ? .4 : 1 }}>↑</button>
                <button onClick={() => move(i, 1)} disabled={i === items.length - 1} style={{ background: 'var(--card2)', border: '1px solid var(--border2)', color: 'var(--text)', borderRadius: '8px', width: '34px', height: '34px', opacity: i === items.length - 1 ? .4 : 1 }}>↓</button>
                <button onClick={() => remove(it)} style={{ background: 'var(--tint-red)', border: '1px solid #7f1d1d', color: '#cc1a1a', borderRadius: '8px', width: '34px', height: '34px' }}>🗑️</button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
