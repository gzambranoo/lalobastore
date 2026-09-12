import { useState, useEffect, useMemo } from 'react'
import { supabase, STORAGE_URL } from '../lib/supabase'

const TIPOS = ['camiseta', 'short', 'cortavientos', 'entrenamiento', 'ropa']
const VERSIONS = ['fan', 'player']
const TALLAS = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL']
const ESTADOS_PEDIDO = ['pendiente', 'en proceso', 'listo', 'entregado', 'cancelado']
const ESTADO_COLORS = { pendiente: '#f59e0b', 'en proceso': '#3b82f6', listo: '#22c55e', entregado: '#888', cancelado: '#ef4444' }

const AUTO_PRICES = {
  camiseta: { fan: { corta: 19990, larga: 24990 }, player: { corta: 27990, larga: 34990 } },
  short: { fan: { corta: 13990, larga: 13990 }, player: { corta: 17990, larga: 17990 } },
  cortavientos: { fan: { corta: 44990, larga: 44990 }, player: { corta: 44990, larga: 44990 } },
}

function getAutoPrice(tipo, version, manga) {
  return AUTO_PRICES[tipo]?.[version]?.[manga || 'corta'] || ''
}

function defaultForm() {
  return { nombre: '', color: '', precio: '19990', tipo_producto: 'camiseta', version: 'fan', manga: 'corta', categorias: '', region: 'europa', retro: false, destacada: false, camiseta_vinculada: '', tallas_stock: [] }
}

function StockEditor({ product, onSave, onCancel }) {
  const [tallas, setTallas] = useState(product.tallas_stock || [])
  const toggle = (t) => setTallas(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])
  return (
    <div style={{ background: '#0a1a0a', border: '2px solid #22c55e', borderRadius: '12px', padding: '16px', marginBottom: '12px' }}>
      <div style={{ fontSize: '14px', fontWeight: 700, color: '#4ade80', marginBottom: '4px' }}>Stock - {product.nombre}</div>
      <div style={{ fontSize: '11px', color: '#666', marginBottom: '10px' }}>Las tallas sin marcar igual se pueden pedir a pedido.</div>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
        {TALLAS.map(t => {
          const sel = tallas.includes(t)
          return <button key={t} type="button" onClick={() => toggle(t)} style={{ padding: '8px 14px', borderRadius: '8px', border: `2px solid ${sel ? '#22c55e' : '#2a2a2a'}`, background: sel ? '#14532d' : '#1a1a1a', color: sel ? '#4ade80' : '#888', fontSize: '14px', fontWeight: sel ? 700 : 400, cursor: 'pointer' }}>{t}</button>
        })}
      </div>
      <div style={{ fontSize: '11px', marginBottom: '10px', color: tallas.length > 0 ? '#4ade80' : '#666' }}>{tallas.length > 0 ? `Stock: ${tallas.join(' - ')}` : 'Sin stock - todo a pedido'}</div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={() => onSave(product.id, tallas)} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: '#166534', border: 'none', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>Guardar stock</button>
        <button onClick={onCancel} style={{ padding: '10px 16px', borderRadius: '8px', background: 'none', border: '1px solid #2a2a2a', color: '#666', fontSize: '13px', cursor: 'pointer' }}>Cancelar</button>
      </div>
    </div>
  )
}

export default function AdminPanel({ products, config, setConfig, reloadProducts }) {
  const [view, setView] = useState('orders')
  const [form, setForm] = useState(defaultForm())
  const [editId, setEditId] = useState(null)
  const [images, setImages] = useState([])
  const [uploadStatus, setUploadStatus] = useState('')
  const [saving, setSaving] = useState(false)
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [editingStockProduct, setEditingStockProduct] = useState(null)
  const [adminSearch, setAdminSearch] = useState('')
  const [adminStock, setAdminStock] = useState('all')

  const inp = (extra = {}) => ({ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '8px', padding: '10px 12px', color: '#fff', fontSize: '14px', outline: 'none', marginBottom: '10px', ...extra })
  const lbl = { fontSize: '12px', color: '#888', marginBottom: '4px', display: 'block', fontWeight: 600 }

  function navBtn(v, label) {
    return <button onClick={() => { setView(v); if (v !== 'add') { setForm(defaultForm()); setImages([]); setEditId(null) } }} style={{ padding: '8px 14px', borderRadius: '8px', border: `1px solid ${view === v ? '#cc1a1a' : '#2a2a2a'}`, background: view === v ? '#cc1a1a' : '#1a1a1a', color: view === v ? '#fff' : '#888', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>{label}</button>
  }

  useEffect(() => { if (view === 'orders') loadOrders() }, [view])

  async function loadOrders() {
    setLoadingOrders(true)
    const { data } = await supabase.from('pedidos').select('*').order('created_at', { ascending: false })
    if (data) setOrders(data)
    setLoadingOrders(false)
  }

  async function updateOrderStatus(id, estado) {
    await supabase.from('pedidos').update({ estado }).eq('id', id)
    setOrders(prev => prev.map(o => o.id === id ? { ...o, estado } : o))
    if (selectedOrder?.id === id) setSelectedOrder(prev => ({ ...prev, estado }))
  }

  function generateProviderText(order) {
    return order.items.map(item => {
      const lines = [`Talla:\t${item.size}`, `Version: ${item.version}`]
      if (item.estName) lines.push(`Nombre:\t${item.estName}`)
      if (item.estNum) lines.push(`Numero:\t${item.estNum}`)
      return lines.join('\n')
    }).join('\n\n')
  }

  async function uploadImages(files) {
    const uploaded = []
    for (const file of files) {
      const ext = (file.name || 'img.jpg').split('.').pop().replace(/[^a-z]/g, '') || 'jpg'
      const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
      setUploadStatus('Subiendo imagen...')
      const { error } = await supabase.storage.from('Camisetas').upload(filename, file, { contentType: file.type || 'image/jpeg' })
      if (error) { setUploadStatus('Error: ' + error.message); continue }
      uploaded.push(filename)
    }
    setImages(prev => [...prev, ...uploaded])
    setUploadStatus(uploaded.length > 0 ? `${uploaded.length} foto(s) subida(s)` : '')
    setTimeout(() => setUploadStatus(''), 3000)
  }

  async function uploadBlob(blob) {
    const filename = `paste_${Date.now()}.jpg`
    setUploadStatus('Subiendo imagen pegada...')
    const { error } = await supabase.storage.from('Camisetas').upload(filename, blob, { contentType: 'image/jpeg' })
    if (error) { setUploadStatus('Error: ' + error.message); return }
    setImages(prev => [...prev, filename])
    setUploadStatus('Imagen subida')
    setTimeout(() => setUploadStatus(''), 2000)
  }

  function handlePaste(e) {
    const items = e.clipboardData?.items
    if (!items) return
    for (const item of items) {
      if (item.type.startsWith('image/')) { e.preventDefault(); const blob = item.getAsFile(); if (blob) uploadBlob(blob); break }
    }
  }

  async function saveProduct() {
    if (!form.nombre || !form.precio) return
    setSaving(true)
    const payload = { nombre: form.nombre, color: form.color, precio: parseInt(form.precio), precio_base: parseInt(form.precio), tipo_producto: form.tipo_producto, version: form.version, categorias: form.categorias.split(',').map(c => c.trim()).filter(Boolean), region: form.region, retro: form.retro, destacada: form.destacada, stock_estado: form.tallas_stock.length > 0 ? 'stock' : 'pedido', imagenes: images, camiseta_vinculada: form.camiseta_vinculada || null, tallas_stock: form.tallas_stock }
    if (editId) await supabase.from('camisetas').update(payload).eq('id', editId)
    else await supabase.from('camisetas').insert(payload)
    setSaving(false)
    setForm(defaultForm()); setImages([]); setEditId(null); setView('list')
    reloadProducts()
  }

  async function deleteProduct(id) {
    if (!confirm('Eliminar este producto?')) return
    await supabase.from('camisetas').delete().eq('id', id)
    reloadProducts()
  }

  async function saveStockOnly(id, tallasStock) {
    await supabase.from('camisetas').update({ tallas_stock: tallasStock, stock_estado: tallasStock.length > 0 ? 'stock' : 'pedido' }).eq('id', id)
    setEditingStockProduct(null)
    reloadProducts()
  }

  function startEdit(p) {
    const manga = p.nombre?.toLowerCase().includes(' ml') || p.nombre?.toLowerCase().includes('manga larga') ? 'larga' : 'corta'
    setForm({ nombre: p.nombre, color: p.color || '', precio: p.precio?.toString() || '', tipo_producto: p.tipo_producto || 'camiseta', version: p.version || 'fan', manga, categorias: (p.categorias || []).join(', '), region: p.region || 'europa', retro: p.retro || false, destacada: p.destacada || false, camiseta_vinculada: p.camiseta_vinculada || '', tallas_stock: p.tallas_stock || [] })
    setImages(p.imagenes || [])
    setEditId(p.id)
    setView('add')
  }

  async function saveConfig() {
    await supabase.from('configuracion').update({ recargo_estampado: config.recargo_estampado }).eq('id', 1)
    alert('Configuracion guardada')
  }

  function updateFormWithPrice(updates) {
    setForm(f => {
      const next = { ...f, ...updates }
      const auto = getAutoPrice(next.tipo_producto, next.version, next.manga)
      if (auto) next.precio = String(auto)
      return next
    })
  }

  const adminFiltered = useMemo(() => {
    let r = [...products]
    if (adminSearch.trim()) { const q = adminSearch.toLowerCase(); r = r.filter(p => p.nombre?.toLowerCase().includes(q) || p.categorias?.some(c => c.toLowerCase().includes(q))) }
    if (adminStock === 'stock') r = r.filter(p => p.tallas_stock?.length > 0)
    if (adminStock === 'pedido') r = r.filter(p => !p.tallas_stock?.length)
    return r
  }, [products, adminSearch, adminStock])

  const pendingOrders = orders.filter(o => o.estado === 'pendiente').length

  return (
    <div style={{ paddingTop: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button onClick={() => { setView('orders'); setSelectedOrder(null) }} style={{ padding: '8px 14px', borderRadius: '8px', border: `1px solid ${view === 'orders' ? '#cc1a1a' : '#2a2a2a'}`, background: view === 'orders' ? '#cc1a1a' : '#1a1a1a', color: view === 'orders' ? '#fff' : '#888', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
          Pedidos {pendingOrders > 0 && <span style={{ background: 'rgba(255,255,255,.25)', borderRadius: '10px', padding: '1px 6px', fontSize: '10px', marginLeft: '4px' }}>{pendingOrders}</span>}
        </button>
        {navBtn('list', `Productos (${products.length})`)}
        {navBtn('add', '+ Agregar')}
        {navBtn('config', 'Config')}
      </div>

      {view === 'orders' && !selectedOrder && (
        <div>
          <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px' }}>Pedidos recibidos</div>
          {loadingOrders ? <div style={{ color: '#555', padding: '20px' }}>Cargando...</div> : orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#444' }}><div style={{ fontSize: '40px', marginBottom: '10px' }}>No hay pedidos</div></div>
          ) : orders.map(order => (
            <div key={order.id} onClick={() => setSelectedOrder(order)} style={{ background: '#141414', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '14px', marginBottom: '10px', cursor: 'pointer', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 700 }}>{order.cliente_nombre}</div>
                  <span style={{ background: ESTADO_COLORS[order.estado] + '22', color: ESTADO_COLORS[order.estado], fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '6px' }}>{order.estado}</span>
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>{order.items?.length} productos - {new Date(order.created_at).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>{order.cliente_telefono || order.cliente_correo}</div>
              </div>
              <span style={{ color: '#cc1a1a', fontSize: '18px' }}>›</span>
            </div>
          ))}
        </div>
      )}

      {view === 'orders' && selectedOrder && (
        <div>
          <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', color: '#cc1a1a', fontSize: '14px', cursor: 'pointer', marginBottom: '16px' }}>← Volver</button>
          <div style={{ background: '#141414', border: '1px solid #1e1e1e', borderRadius: '14px', padding: '18px', marginBottom: '14px' }}>
            <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>👤 {selectedOrder.cliente_nombre}</div>
            <div style={{ fontSize: '13px', color: '#888', marginBottom: '8px' }}>{selectedOrder.cliente_telefono} {selectedOrder.cliente_correo}</div>
            {selectedOrder.notas && <div style={{ background: '#1e1e1e', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', color: '#ccc' }}>{selectedOrder.notas}</div>}
          </div>
          <div style={{ background: '#141414', border: '1px solid #1e1e1e', borderRadius: '14px', padding: '18px', marginBottom: '14px' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>Productos</div>
            {selectedOrder.items?.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px', padding: '10px 0', borderBottom: i < selectedOrder.items.length - 1 ? '1px solid #1e1e1e' : 'none', alignItems: 'center' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '8px', overflow: 'hidden', background: '#1a1a1a', flexShrink: 0 }}>
                  {item.image ? <img src={STORAGE_URL + item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>👕</div>}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>{item.productName}</div>
                  <div style={{ fontSize: '12px', color: '#888' }}>Talla: {item.size} - {item.version}</div>
                  {item.estampado && <div style={{ fontSize: '12px', color: '#f59e0b' }}>{item.estName} #{item.estNum}</div>}
                </div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#cc1a1a' }}>${item.total?.toLocaleString('es-CL')}</div>
              </div>
            ))}
            <div style={{ borderTop: '1px solid #2a2a2a', marginTop: '10px', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 700 }}>
              <span>Total</span><span style={{ color: '#cc1a1a' }}>${selectedOrder.items?.reduce((a, b) => a + (b.total || 0), 0).toLocaleString('es-CL')}</span>
            </div>
          </div>
          <div style={{ background: '#0a1400', border: '1px solid #166534', borderRadius: '14px', padding: '18px', marginBottom: '14px' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '10px', color: '#4ade80' }}>Formato proveedor</div>
            <pre style={{ fontSize: '13px', color: '#e0e0e0', whiteSpace: 'pre-wrap', fontFamily: 'inherit', lineHeight: 1.8, background: '#1a1a1a', borderRadius: '8px', padding: '12px', marginBottom: '10px' }}>{generateProviderText(selectedOrder)}</pre>
            <button onClick={() => { navigator.clipboard.writeText(generateProviderText(selectedOrder)); alert('Copiado!') }} style={{ width: '100%', padding: '11px', borderRadius: '8px', background: '#166534', border: 'none', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>Copiar texto</button>
          </div>
          <div style={{ background: '#141414', border: '1px solid #1e1e1e', borderRadius: '14px', padding: '18px' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '10px' }}>Estado</div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {ESTADOS_PEDIDO.map(estado => (
                <button key={estado} onClick={() => updateOrderStatus(selectedOrder.id, estado)} style={{ padding: '7px 14px', borderRadius: '8px', border: `1px solid ${selectedOrder.estado === estado ? ESTADO_COLORS[estado] : '#2a2a2a'}`, background: selectedOrder.estado === estado ? ESTADO_COLORS[estado] + '33' : '#1a1a1a', color: selectedOrder.estado === estado ? ESTADO_COLORS[estado] : '#888', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>{estado}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {view === 'list' && (
        <div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '180px', display: 'flex', alignItems: 'center', background: '#141414', border: '1px solid #1e1e1e', borderRadius: '8px', padding: '8px 12px', gap: '6px' }}>
              <span style={{ color: '#444' }}>🔍</span>
              <input value={adminSearch} onChange={e => setAdminSearch(e.target.value)} placeholder="Buscar producto..." style={{ background: 'none', border: 'none', outline: 'none', color: '#fff', fontSize: '13px', flex: 1 }} />
              {adminSearch && <button onClick={() => setAdminSearch('')} style={{ background: 'none', border: 'none', color: '#555', fontSize: '16px', cursor: 'pointer' }}>x</button>}
            </div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {[['all', 'Todo'], ['stock', 'Stock'], ['pedido', 'Pedido']].map(([v, l]) => (
                <button key={v} onClick={() => setAdminStock(v)} style={{ padding: '7px 12px', borderRadius: '8px', border: `1px solid ${adminStock === v ? '#cc1a1a' : '#2a2a2a'}`, background: adminStock === v ? '#cc1a1a' : '#141414', color: adminStock === v ? '#fff' : '#888', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>{l}</button>
              ))}
            </div>
          </div>
          <div style={{ fontSize: '11px', color: '#555', marginBottom: '10px' }}>{adminFiltered.length} de {products.length} productos</div>
          {editingStockProduct && <StockEditor product={editingStockProduct} onSave={saveStockOnly} onCancel={() => setEditingStockProduct(null)} />}
          {adminFiltered.map(p => (
            <div key={p.id} style={{ background: '#141414', border: `1px solid ${editingStockProduct?.id === p.id ? '#22c55e' : '#1e1e1e'}`, borderRadius: '12px', padding: '12px 14px', marginBottom: '8px', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '8px', overflow: 'hidden', background: '#1a1a1a', flexShrink: 0 }}>
                {p.imagenes?.[0] ? <img src={STORAGE_URL + p.imagenes[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>👕</div>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '3px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: p.version === 'player' ? '#a78bfa' : '#888', background: p.version === 'player' ? '#1a0a2a' : '#1e1e1e', padding: '2px 6px', borderRadius: '5px' }}>{p.version?.toUpperCase()}</span>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: p.tallas_stock?.length > 0 ? '#4ade80' : '#f59e0b', background: p.tallas_stock?.length > 0 ? '#0a1a0a' : '#1a1400', padding: '2px 6px', borderRadius: '5px' }}>{p.tallas_stock?.length > 0 ? p.tallas_stock.join(' ') : 'A pedido'}</span>
                  {p.retro && <span style={{ fontSize: '10px', color: '#f59e0b', background: '#2a1500', padding: '2px 6px', borderRadius: '5px' }}>Retro</span>}
                  {p.destacada && <span style={{ fontSize: '10px', color: '#fbbf24', background: '#1a1400', padding: '2px 6px', borderRadius: '5px' }}>Dest</span>}
                </div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>{p.nombre}</div>
                <div style={{ fontSize: '12px', color: '#555' }}>{p.tipo_producto} - {p.color}</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#cc1a1a' }}>${p.precio?.toLocaleString('es-CL')}</div>
              </div>
              <div style={{ display: 'flex', gap: '5px', flexShrink: 0 }}>
                <button onClick={() => setEditingStockProduct(editingStockProduct?.id === p.id ? null : p)} style={{ background: p.tallas_stock?.length > 0 ? '#0a1a0a' : '#1a1a1a', border: `1px solid ${p.tallas_stock?.length > 0 ? '#22c55e' : '#2a2a2a'}`, color: p.tallas_stock?.length > 0 ? '#4ade80' : '#888', borderRadius: '7px', padding: '6px 10px', fontSize: '13px', cursor: 'pointer' }}>Stock</button>
                <button onClick={() => startEdit(p)} style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#ccc', borderRadius: '7px', padding: '6px 10px', fontSize: '13px', cursor: 'pointer' }}>Editar</button>
                <button onClick={() => deleteProduct(p.id)} style={{ background: '#1a0000', border: '1px solid #2a0a0a', color: '#cc1a1a', borderRadius: '7px', padding: '6px 10px', fontSize: '13px', cursor: 'pointer' }}>Borrar</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {view === 'add' && (
        <div style={{ maxWidth: '600px' }}>
          <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>{editId ? 'Editar producto' : 'Nuevo producto'}</div>
          <label style={lbl}>Nombre *</label>
          <input style={inp()} value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} placeholder="Ej: Liverpool Local 26/27" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div>
              <label style={lbl}>Tipo</label>
              <select style={inp()} value={form.tipo_producto} onChange={e => updateFormWithPrice({ tipo_producto: e.target.value })}>
                {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Version</label>
              <select style={inp()} value={form.version} onChange={e => updateFormWithPrice({ version: e.target.value })}>
                {VERSIONS.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            {form.tipo_producto === 'camiseta' && (
              <div>
                <label style={lbl}>Manga</label>
                <select style={inp()} value={form.manga || 'corta'} onChange={e => updateFormWithPrice({ manga: e.target.value })}>
                  <option value="corta">Corta</option>
                  <option value="larga">Larga</option>
                </select>
              </div>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={lbl}>Precio (CLP) * {getAutoPrice(form.tipo_producto, form.version, form.manga) ? <span style={{ color: '#4ade80', fontWeight: 400 }}>auto</span> : ''}</label>
              <input style={inp()} type="number" value={form.precio} onChange={e => setForm(f => ({ ...f, precio: e.target.value }))} />
            </div>
            <div>
              <label style={lbl}>Color</label>
              <input style={inp()} value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={lbl}>Region</label>
              <select style={inp()} value={form.region} onChange={e => setForm(f => ({ ...f, region: e.target.value }))}>
                <option value="europa">Europa</option>
                <option value="sudamerica">Sudamerica</option>
                <option value="mundo">Resto del mundo</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingTop: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '7px', cursor: 'pointer', fontSize: '13px', color: '#ccc', margin: 0 }}>
                <input type="checkbox" checked={form.retro} onChange={e => setForm(f => ({ ...f, retro: e.target.checked }))} style={{ width: 'auto', margin: 0 }} /> Retro
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '7px', cursor: 'pointer', fontSize: '13px', color: '#ccc', margin: 0 }}>
                <input type="checkbox" checked={form.destacada} onChange={e => setForm(f => ({ ...f, destacada: e.target.checked }))} style={{ width: 'auto', margin: 0 }} /> Destacada
              </label>
            </div>
          </div>
          <label style={lbl}>Categorias (separadas por coma)</label>
          <input style={inp()} value={form.categorias} onChange={e => setForm(f => ({ ...f, categorias: e.target.value }))} placeholder="Club, Premier League, Liverpool" />
          <label style={lbl}>Vincular con version contraria</label>
          <select style={inp()} value={form.camiseta_vinculada} onChange={e => setForm(f => ({ ...f, camiseta_vinculada: e.target.value }))}>
            <option value="">Sin vincular</option>
            {products.filter(p => p.id !== editId).map(p => <option key={p.id} value={p.id}>{p.nombre} ({p.version})</option>)}
          </select>
          <label style={lbl}>Tallas en stock (el resto igual se puede pedir)</label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
            {TALLAS.map(t => {
              const sel = form.tallas_stock.includes(t)
              return <button key={t} type="button" onClick={() => setForm(f => ({ ...f, tallas_stock: sel ? f.tallas_stock.filter(x => x !== t) : [...f.tallas_stock, t] }))} style={{ padding: '9px 16px', borderRadius: '8px', border: `2px solid ${sel ? '#22c55e' : '#2a2a2a'}`, background: sel ? '#14532d' : '#1a1a1a', color: sel ? '#4ade80' : '#888', fontSize: '14px', fontWeight: sel ? 700 : 400, cursor: 'pointer' }}>{t}</button>
            })}
          </div>
          {form.tallas_stock.length > 0 ? <div style={{ fontSize: '11px', color: '#4ade80', marginBottom: '14px' }}>Stock: {form.tallas_stock.join(' - ')}</div> : <div style={{ fontSize: '11px', color: '#666', marginBottom: '14px' }}>Sin stock - todo a pedido</div>}
          <label style={lbl}>Fotos ({images.length} subidas)</label>
          <div onPaste={handlePaste} tabIndex={0} style={{ border: '2px dashed #cc1a1a', borderRadius: '10px', padding: '14px', textAlign: 'center', marginBottom: '8px', color: '#aaa', fontSize: '13px', outline: 'none', background: '#1a0000', cursor: 'default' }}>
            <div style={{ fontWeight: 700, color: '#cc1a1a', marginBottom: '2px' }}>Pega aqui con Ctrl+V</div>
            <div style={{ fontSize: '11px', color: '#555' }}>Copia la imagen en Yupoo y pega aqui</div>
          </div>
          <label style={{ display: 'block', border: '2px dashed #2a2a2a', borderRadius: '10px', padding: '12px', textAlign: 'center', cursor: 'pointer', marginBottom: '8px', color: '#555', fontSize: '13px' }}>
            <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => uploadImages([...e.target.files])} />
            O selecciona archivos desde tu computador
          </label>
          {uploadStatus && <div style={{ fontSize: '12px', color: '#4ade80', marginBottom: '8px', padding: '6px 10px', background: '#1a1a1a', borderRadius: '6px' }}>{uploadStatus}</div>}
          {images.length > 0 && (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
              {images.map((img, i) => (
                <div key={i} style={{ position: 'relative' }}>
                  <img src={STORAGE_URL + img} alt="" style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '8px', border: i === 0 ? '2px solid #cc1a1a' : '2px solid transparent' }} />
                  <button onClick={() => setImages(prev => prev.filter((_, j) => j !== i))} style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#cc1a1a', border: 'none', borderRadius: '50%', width: '18px', height: '18px', color: '#fff', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>x</button>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={saveProduct} disabled={saving || !form.nombre || !form.precio} style={{ flex: 1, padding: '14px', borderRadius: '10px', background: '#cc1a1a', border: 'none', color: '#fff', fontSize: '15px', fontWeight: 700, cursor: 'pointer' }}>{saving ? 'Guardando...' : editId ? 'Guardar cambios' : 'Agregar producto'}</button>
            <button onClick={() => { setView('list'); setForm(defaultForm()); setImages([]); setEditId(null) }} style={{ padding: '14px 20px', borderRadius: '10px', background: 'none', border: '1px solid #2a2a2a', color: '#666', fontSize: '14px', cursor: 'pointer' }}>Cancelar</button>
          </div>
        </div>
      )}

      {view === 'config' && (
        <div style={{ maxWidth: '400px' }}>
          <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>Configuracion</div>
          <label style={lbl}>Recargo estampado (nombre + numero)</label>
          <input style={inp()} type="number" value={config.recargo_estampado || ''} onChange={e => setConfig(c => ({ ...c, recargo_estampado: parseInt(e.target.value) }))} />
          <button onClick={saveConfig} style={{ width: '100%', padding: '14px', borderRadius: '10px', background: '#cc1a1a', border: 'none', color: '#fff', fontSize: '15px', fontWeight: 700, cursor: 'pointer' }}>Guardar</button>
        </div>
      )}
    </div>
  )
}
