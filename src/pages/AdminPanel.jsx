import { useState } from 'react'
import { supabase, STORAGE_URL } from '../lib/supabase'

const TIPOS = ['camiseta', 'short', 'cortavientos', 'entrenamiento', 'ropa']
const VERSIONS = ['fan', 'player']
const STOCK_ESTADOS = ['pedido', 'stock']

function defaultForm() {
  return { nombre: '', color: '', precio: '', tipo_producto: 'camiseta', version: 'fan', categorias: '', region: 'europa', retro: false, destacada: false, stock_estado: 'pedido', camiseta_vinculada: '' }
}

export default function AdminPanel({ products, config, setConfig, reloadProducts }) {
  const [view, setView] = useState('list') // list | add | edit | config
  const [form, setForm] = useState(defaultForm())
  const [editId, setEditId] = useState(null)
  const [images, setImages] = useState([])
  const [uploadStatus, setUploadStatus] = useState('')
  const [saving, setSaving] = useState(false)

  const inp = (extra = {}) => ({ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '8px', padding: '10px 12px', color: '#fff', fontSize: '14px', outline: 'none', width: '100%', marginBottom: '10px', ...extra })
  const lbl = { fontSize: '12px', color: '#888', marginBottom: '4px', display: 'block', fontWeight: 600 }
  const navBtn = (v) => ({ padding: '8px 14px', borderRadius: '8px', border: `1px solid ${view === v ? '#cc1a1a' : '#2a2a2a'}`, background: view === v ? '#cc1a1a' : '#1a1a1a', color: view === v ? '#fff' : '#888', fontSize: '12px', fontWeight: 600, cursor: 'pointer' })

  async function uploadImages(files) {
    const uploaded = []
    for (const file of files) {
      const ext = file.name.split('.').pop().toLowerCase()
      const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
      setUploadStatus(`Subiendo ${file.name}...`)
      const { error } = await supabase.storage.from('Camisetas').upload(filename, file, { contentType: file.type })
      if (error) { setUploadStatus('Error: ' + error.message); continue }
      uploaded.push(filename)
    }
    setImages(prev => [...prev, ...uploaded])
    setUploadStatus(uploaded.length > 0 ? `✓ ${uploaded.length} foto(s) subida(s)` : '')
    setTimeout(() => setUploadStatus(''), 3000)
  }

  async function saveProduct() {
    if (!form.nombre || !form.precio) return
    setSaving(true)
    const payload = {
      nombre: form.nombre, color: form.color,
      precio: parseInt(form.precio),
      precio_base: parseInt(form.precio),
      tipo_producto: form.tipo_producto,
      version: form.version,
      categorias: form.categorias.split(',').map(c => c.trim()).filter(Boolean),
      region: form.region,
      retro: form.retro,
      destacada: form.destacada,
      stock_estado: form.stock_estado,
      imagenes: images,
      camiseta_vinculada: form.camiseta_vinculada || null,
    }
    if (editId) {
      await supabase.from('camisetas').update(payload).eq('id', editId)
    } else {
      await supabase.from('camisetas').insert(payload)
    }
    setSaving(false)
    setForm(defaultForm()); setImages([]); setEditId(null); setView('list')
    reloadProducts()
  }

  async function deleteProduct(id) {
    if (!confirm('¿Eliminar este producto?')) return
    await supabase.from('camisetas').delete().eq('id', id)
    reloadProducts()
  }

  function startEdit(p) {
    setForm({
      nombre: p.nombre, color: p.color || '', precio: p.precio?.toString() || '',
      tipo_producto: p.tipo_producto || 'camiseta', version: p.version || 'fan',
      categorias: (p.categorias || []).join(', '), region: p.region || 'europa',
      retro: p.retro || false, destacada: p.destacada || false,
      stock_estado: p.stock_estado || 'pedido', camiseta_vinculada: p.camiseta_vinculada || '',
    })
    setImages(p.imagenes || [])
    setEditId(p.id)
    setView('add')
  }

  async function saveConfig() {
    await supabase.from('configuracion').update({ recargo_xl: config.recargo_xl, recargo_estampado: config.recargo_estampado, recargo_player: config.recargo_player }).eq('id', 1)
    alert('✓ Configuración guardada')
  }

  return (
    <div style={{ paddingTop: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button style={navBtn('list')} onClick={() => { setView('list'); setForm(defaultForm()); setImages([]); setEditId(null) }}>📋 Productos ({products.length})</button>
        <button style={navBtn('add')} onClick={() => { setView('add'); setForm(defaultForm()); setImages([]); setEditId(null) }}>➕ Agregar</button>
        <button style={navBtn('config')} onClick={() => setView('config')}>⚙️ Configuración</button>
      </div>

      {/* PRODUCT LIST */}
      {view === 'list' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {products.map(p => (
            <div key={p.id} style={{ background: '#141414', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '12px 14px', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '8px', overflow: 'hidden', background: '#1a1a1a', flexShrink: 0 }}>
                {p.imagenes?.[0] ? <img src={STORAGE_URL + p.imagenes[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>👕</div>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '3px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: p.version === 'player' ? '#a78bfa' : '#888', background: p.version === 'player' ? '#1a0a2a' : '#1e1e1e', padding: '2px 6px', borderRadius: '5px' }}>{p.version?.toUpperCase()}</span>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: p.stock_estado === 'stock' ? '#4ade80' : '#f59e0b', background: p.stock_estado === 'stock' ? '#0a1a0a' : '#1a1400', padding: '2px 6px', borderRadius: '5px' }}>{p.stock_estado === 'stock' ? 'EN STOCK' : 'A PEDIDO'}</span>
                  {p.retro && <span style={{ fontSize: '10px', fontWeight: 700, color: '#f59e0b', background: '#2a1500', padding: '2px 6px', borderRadius: '5px' }}>RETRO</span>}
                </div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>{p.nombre}</div>
                <div style={{ fontSize: '12px', color: '#555' }}>{p.tipo_producto} · {p.color}</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#cc1a1a' }}>${p.precio?.toLocaleString('es-CL')}</div>
              </div>
              <div style={{ display: 'flex', gap: '5px' }}>
                <button onClick={() => startEdit(p)} style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#ccc', borderRadius: '7px', padding: '6px 10px', fontSize: '13px' }}>✏️</button>
                <button onClick={() => deleteProduct(p.id)} style={{ background: '#1a0000', border: '1px solid #2a0a0a', color: '#cc1a1a', borderRadius: '7px', padding: '6px 10px', fontSize: '13px' }}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD / EDIT */}
      {view === 'add' && (
        <div style={{ maxWidth: '600px' }}>
          <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>{editId ? '✏️ Editar producto' : '➕ Nuevo producto'}</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={lbl}>Nombre *</label>
              <input style={inp()} value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} placeholder="Ej: Brasil Away 2025" />
            </div>
            <div>
              <label style={lbl}>Precio (CLP) *</label>
              <input style={inp()} type="number" value={form.precio} onChange={e => setForm(f => ({ ...f, precio: e.target.value }))} placeholder="28000" />
            </div>
            <div>
              <label style={lbl}>Color</label>
              <input style={inp()} value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} placeholder="Blanco/Verde" />
            </div>
            <div>
              <label style={lbl}>Tipo de producto</label>
              <select style={inp()} value={form.tipo_producto} onChange={e => setForm(f => ({ ...f, tipo_producto: e.target.value }))}>
                {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Versión</label>
              <select style={inp()} value={form.version} onChange={e => setForm(f => ({ ...f, version: e.target.value }))}>
                {VERSIONS.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Disponibilidad</label>
              <select style={inp()} value={form.stock_estado} onChange={e => setForm(f => ({ ...f, stock_estado: e.target.value }))}>
                {STOCK_ESTADOS.map(s => <option key={s} value={s}>{s === 'stock' ? 'En stock' : 'A pedido'}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Región</label>
              <select style={inp()} value={form.region} onChange={e => setForm(f => ({ ...f, region: e.target.value }))}>
                <option value="europa">Europa</option>
                <option value="sudamerica">Sudamérica</option>
                <option value="mundo">Resto del mundo</option>
              </select>
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={lbl}>Categorías / etiquetas (separadas por coma)</label>
              <input style={inp()} value={form.categorias} onChange={e => setForm(f => ({ ...f, categorias: e.target.value }))} placeholder="Selección, Brasil, Copa América, Nike" />
              <div style={{ fontSize: '11px', color: '#555', marginTop: '-8px', marginBottom: '10px' }}>Usa "Club" o "Selección" para las categorías principales. Agrega país, liga, marca, etc.</div>
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={lbl}>Vincular con versión contraria (ID del otro producto)</label>
              <select style={inp()} value={form.camiseta_vinculada} onChange={e => setForm(f => ({ ...f, camiseta_vinculada: e.target.value }))}>
                <option value="">Sin vincular</option>
                {products.filter(p => p.id !== editId).map(p => (
                  <option key={p.id} value={p.id}>{p.nombre} ({p.version})</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '16px', gridColumn: '1/-1', marginBottom: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#ccc' }}>
                <input type="checkbox" checked={form.retro} onChange={e => setForm(f => ({ ...f, retro: e.target.checked }))} style={{ accentColor: '#cc1a1a' }} />
                Retro 🕰️
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#ccc' }}>
                <input type="checkbox" checked={form.destacada} onChange={e => setForm(f => ({ ...f, destacada: e.target.checked }))} style={{ accentColor: '#cc1a1a' }} />
                Destacada en inicio ⭐
              </label>
            </div>
          </div>

          {/* Image upload */}
          <label style={lbl}>Fotos ({images.length} subidas)</label>
          <label style={{ display: 'block', border: '2px dashed #2a2a2a', borderRadius: '10px', padding: '20px', textAlign: 'center', cursor: 'pointer', marginBottom: '8px', color: '#666', fontSize: '14px' }}>
            <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => uploadImages([...e.target.files])} />
            📸 Agregar fotos (puedes subir varias a la vez)
          </label>
          {uploadStatus && <div style={{ fontSize: '12px', color: uploadStatus.startsWith('Error') ? '#cc1a1a' : '#4ade80', marginBottom: '8px', padding: '6px 10px', background: '#1a1a1a', borderRadius: '6px' }}>{uploadStatus}</div>}
          {images.length > 0 && (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
              {images.map((img, i) => (
                <div key={i} style={{ position: 'relative' }}>
                  <img src={STORAGE_URL + img} alt="" style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '8px', border: i === 0 ? '2px solid #cc1a1a' : '2px solid transparent' }} />
                  {i === 0 && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(204,26,26,.8)', fontSize: '8px', color: '#fff', textAlign: 'center', padding: '2px', borderRadius: '0 0 6px 6px' }}>Portada</div>}
                  <button onClick={() => setImages(prev => prev.filter((_, j) => j !== i))} style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#cc1a1a', border: 'none', borderRadius: '50%', width: '18px', height: '18px', color: '#fff', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={saveProduct} disabled={saving || !form.nombre || !form.precio} style={{ flex: 1, padding: '14px', borderRadius: '10px', background: '#cc1a1a', border: 'none', color: '#fff', fontSize: '15px', fontWeight: 700 }}>
              {saving ? 'Guardando...' : editId ? 'Guardar cambios' : 'Agregar producto'}
            </button>
            <button onClick={() => { setView('list'); setForm(defaultForm()); setImages([]); setEditId(null) }} style={{ padding: '14px 20px', borderRadius: '10px', background: 'none', border: '1px solid #2a2a2a', color: '#666', fontSize: '14px' }}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* CONFIG */}
      {view === 'config' && (
        <div style={{ maxWidth: '400px' }}>
          <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>⚙️ Recargos globales</div>
          {[
            ['Recargo talla XL/XXL/XXXL', 'recargo_xl'],
            ['Recargo estampado (nombre + número)', 'recargo_estampado'],
            ['Recargo versión Player', 'recargo_player'],
          ].map(([label, key]) => (
            <div key={key}>
              <label style={lbl}>{label}</label>
              <input style={inp()} type="number" value={config[key] || ''} onChange={e => setConfig(c => ({ ...c, [key]: parseInt(e.target.value) }))} />
            </div>
          ))}
          <div style={{ background: '#1a1a1a', borderRadius: '10px', padding: '12px', marginBottom: '16px', fontSize: '12px', color: '#666' }}>
            Estos valores se actualizan en tiempo real en la página de Info y en el precio de cada producto.
          </div>
          <button onClick={saveConfig} style={{ width: '100%', padding: '14px', borderRadius: '10px', background: '#cc1a1a', border: 'none', color: '#fff', fontSize: '15px', fontWeight: 700 }}>
            Guardar configuración
          </button>
        </div>
      )}
    </div>
  )
}
