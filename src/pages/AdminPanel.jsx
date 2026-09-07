import React, { useState, useEffect } from 'react'
import { supabase, STORAGE_URL } from '../lib/supabase'

const TIPOS = ['camiseta', 'short', 'cortavientos', 'entrenamiento', 'ropa']
const VERSIONS = ['fan', 'player']
const STOCK_ESTADOS = ['pedido', 'stock']
const TALLAS = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL']
const ESTADOS_PEDIDO = ['pendiente', 'en proceso', 'listo', 'entregado', 'cancelado']
const ESTADO_COLORS = { pendiente: '#f59e0b', 'en proceso': '#3b82f6', listo: '#22c55e', entregado: '#888', cancelado: '#ef4444' }

function defaultForm() {
  return { nombre: '', color: '', precio: '', tipo_producto: 'camiseta', version: 'fan', categorias: '', region: 'europa', retro: false, destacada: false, camiseta_vinculada: '', tallas_stock: [] }
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
  // Admin product list filters
  const [adminSearch, setAdminSearch] = useState('')
  const [adminStock, setAdminStock] = useState('all')
  const [adminCat, setAdminCat] = useState('')
  // Stock editor
  const [editingStock, setEditingStock] = useState(null) // product id being stock-edited

  const inp = (extra={}) => ({ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '8px', padding: '10px 12px', color: '#fff', fontSize: '14px', outline: 'none', marginBottom: '10px', ...extra })
  const lbl = { fontSize: '12px', color: '#888', marginBottom: '4px', display: 'block', fontWeight: 600 }
  const navBtn = (v, label) => ({ padding: '8px 14px', borderRadius: '8px', border: `1px solid ${view===v?'#cc1a1a':'#2a2a2a'}`, background: view===v?'#cc1a1a':'#1a1a1a', color: view===v?'#fff':'#888', fontSize: '12px', fontWeight: 600, cursor: 'pointer' })

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
      const lines = [`Talla:\t${item.size}`, `Versión: ${item.version}`]
      if (item.estName) lines.push(`Nombre:\t${item.estName}`)
      if (item.estNum) lines.push(`Número:\t${item.estNum}`)
      return lines.join('\n')
    }).join('\n\n')
  }

  async function generateOrderImage(order) {
    const wrap = document.getElementById('order-img-wrap')
    wrap.innerHTML = '<div style="color:#888;font-size:12px;padding:8px">Generando imagen...</div>'

    const canvas = document.getElementById('order-canvas')
    const item = order.items[0]
    const IMG_SIZE = 600
    const TEXT_H = 200
    canvas.width = IMG_SIZE
    canvas.height = IMG_SIZE + TEXT_H
    canvas.style.display = 'none'
    const ctx = canvas.getContext('2d')

    // Dark background
    ctx.fillStyle = '#0f0f0f'
    ctx.fillRect(0, 0, IMG_SIZE, IMG_SIZE + TEXT_H)

    // Load product image
    if (item.image) {
      try {
        await new Promise((resolve) => {
          const img = new Image()
          img.crossOrigin = 'anonymous'
          img.onload = () => { ctx.drawImage(img, 0, 0, IMG_SIZE, IMG_SIZE); resolve() }
          img.onerror = resolve
          img.src = STORAGE_URL + item.image
        })
      } catch(e) {}
    }

    // Gradient overlay at bottom of photo
    const grad = ctx.createLinearGradient(0, IMG_SIZE - 80, 0, IMG_SIZE)
    grad.addColorStop(0, 'rgba(15,15,15,0)')
    grad.addColorStop(1, 'rgba(15,15,15,1)')
    ctx.fillStyle = grad
    ctx.fillRect(0, IMG_SIZE - 80, IMG_SIZE, 80)

    // Red accent bar
    ctx.fillStyle = '#cc1a1a'
    ctx.fillRect(0, IMG_SIZE, IMG_SIZE, 4)

    // Text section
    const startY = IMG_SIZE + 16
    ctx.textBaseline = 'top'

    // Product name
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 18px system-ui, sans-serif'
    const name = item.productName || ''
    const maxW = IMG_SIZE - 32
    // Wrap long names
    const words = name.split(' ')
    let line = '', lines = []
    for (const w of words) {
      const test = line + (line ? ' ' : '') + w
      if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w }
      else line = test
    }
    if (line) lines.push(line)
    lines.slice(0, 2).forEach((l, i) => ctx.fillText(l, 16, startY + i * 22))

    const detailY = startY + (lines.length > 1 ? 48 : 26)

    // Details row
    ctx.font = '15px system-ui, sans-serif'
    ctx.fillStyle = '#aaaaaa'
    const details = `Talla: ${item.size}  ·  ${item.version === 'player' ? '⚡ Player' : 'Fan'}${item.estampado ? `  ·  ${item.estName} #${item.estNum}` : ''}`
    ctx.fillText(details, 16, detailY)

    // More items
    if (order.items.length > 1) {
      ctx.fillStyle = '#666666'
      ctx.font = '13px system-ui, sans-serif'
      ctx.fillText(`+ ${order.items.length - 1} producto(s) más`, 16, detailY + 22)
    }

    // Logo watermark
    ctx.fillStyle = '#cc1a1a'
    ctx.font = 'bold 13px system-ui, sans-serif'
    ctx.fillText('La Loba Store', 16, IMG_SIZE + TEXT_H - 24)

    // Convert to image and show download
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92)
    wrap.innerHTML = ''
    const img = document.createElement('img')
    img.src = dataUrl
    img.style.cssText = 'width:100%;border-radius:8px;margin-bottom:8px'
    wrap.appendChild(img)
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `pedido_${order.id.slice(0,8)}.jpg`
    a.style.cssText = 'display:block;width:100%;padding:10px;border-radius:8px;background:#14532d;border:none;color:#fff;font-size:13px;font-weight:700;cursor:pointer;text-align:center;text-decoration:none'
    a.textContent = '⬇️ Descargar imagen para WhatsApp'
    wrap.appendChild(a)
  }

  async function uploadImages(files) {
    const uploaded = []
    for (const file of files) {
      const ext = (file.name || 'image.jpg').split('.').pop().toLowerCase().replace(/[^a-z]/g, '') || 'jpg'
      const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
      setUploadStatus(`Subiendo imagen...`)
      const { error } = await supabase.storage.from('Camisetas').upload(filename, file, { contentType: file.type || 'image/jpeg' })
      if (error) { setUploadStatus('Error: ' + error.message); continue }
      uploaded.push(filename)
    }
    setImages(prev => [...prev, ...uploaded])
    setUploadStatus(uploaded.length > 0 ? `✓ ${uploaded.length} foto(s) subida(s)` : '')
    setTimeout(() => setUploadStatus(''), 3000)
  }

  async function uploadBlob(blob) {
    const filename = `paste_${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`
    setUploadStatus('Subiendo imagen pegada...')
    const { error } = await supabase.storage.from('Camisetas').upload(filename, blob, { contentType: 'image/jpeg' })
    if (error) { setUploadStatus('Error: ' + error.message); return }
    setImages(prev => [...prev, filename])
    setUploadStatus('✓ Imagen subida')
    setTimeout(() => setUploadStatus(''), 2000)
  }

  function handlePaste(e) {
    const items = e.clipboardData?.items
    if (!items) return
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault()
        const blob = item.getAsFile()
        if (blob) uploadBlob(blob)
        break
      }
    }
  }

  async function saveProduct() {
    if (!form.nombre || !form.precio) return
    setSaving(true)
    const payload = {
      nombre: form.nombre, color: form.color, precio: parseInt(form.precio), precio_base: parseInt(form.precio),
      tipo_producto: form.tipo_producto, version: form.version,
      categorias: form.categorias.split(',').map(c => c.trim()).filter(Boolean),
      region: form.region, retro: form.retro, destacada: form.destacada,
      stock_estado: form.tallas_stock.length > 0 ? 'stock' : 'pedido',
      imagenes: images,
      camiseta_vinculada: form.camiseta_vinculada || null,
      tallas_stock: form.tallas_stock,
    }
    if (editId) await supabase.from('camisetas').update(payload).eq('id', editId)
    else await supabase.from('camisetas').insert(payload)
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
    setForm({ nombre: p.nombre, color: p.color||'', precio: p.precio?.toString()||'', tipo_producto: p.tipo_producto||'camiseta', version: p.version||'fan', categorias: (p.categorias||[]).join(', '), region: p.region||'europa', retro: p.retro||false, destacada: p.destacada||false, camiseta_vinculada: p.camiseta_vinculada||'', tallas_stock: p.tallas_stock||[] })
    setImages(p.imagenes||[])
    setEditId(p.id)
    setView('add')
  }

  async function saveConfig() {
    await supabase.from('configuracion').update({ recargo_xl: config.recargo_xl, recargo_estampado: config.recargo_estampado, recargo_player: config.recargo_player }).eq('id', 1)
    alert('✓ Configuración guardada')
  }

  const pendingOrders = orders.filter(o => o.estado === 'pendiente').length

  // Filtered products for admin list
  const adminFiltered = useMemo ? products : products // fallback
  const getAdminFiltered = () => {
    let r = products
    if (adminSearch.trim()) {
      const q = adminSearch.toLowerCase()
      r = r.filter(p => p.nombre?.toLowerCase().includes(q) || p.categorias?.some(c => c.toLowerCase().includes(q)))
    }
    if (adminStock === 'stock') r = r.filter(p => p.tallas_stock?.length > 0)
    if (adminStock === 'pedido') r = r.filter(p => !p.tallas_stock?.length)
    if (adminCat) r = r.filter(p => p.categorias?.includes(adminCat))
    return r
  }

  async function saveStockOnly(productId, tallasStock) {
    await supabase.from('camisetas').update({
      tallas_stock: tallasStock,
      stock_estado: tallasStock.length > 0 ? 'stock' : 'pedido'
    }).eq('id', productId)
    setEditingStock(null)
    reloadProducts()
  }

  return (
    <div style={{ paddingTop: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button style={navBtn('orders')} onClick={() => setView('orders')}>
          📦 Pedidos {pendingOrders > 0 && <span style={{ background: '#cc1a1a', color: '#fff', borderRadius: '10px', padding: '1px 6px', fontSize: '10px', marginLeft: '4px' }}>{pendingOrders}</span>}
        </button>
        <button style={navBtn('list')} onClick={() => { setView('list'); setForm(defaultForm()); setImages([]); setEditId(null) }}>📋 Productos ({products.length})</button>
        <button style={navBtn('add')} onClick={() => { setView('add'); setForm(defaultForm()); setImages([]); setEditId(null) }}>➕ Agregar</button>
        <button style={navBtn('config')} onClick={() => setView('config')}>⚙️ Config</button>
      </div>

      {/* ORDERS */}
      {view === 'orders' && !selectedOrder && (
        <div>
          <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px' }}>Pedidos recibidos</div>
          {loadingOrders ? <div style={{ color: '#555', padding: '20px' }}>Cargando...</div> : orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#444' }}>
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>📭</div>
              <div>No hay pedidos aún</div>
            </div>
          ) : orders.map(order => (
            <div key={order.id} onClick={() => setSelectedOrder(order)} style={{ background: '#141414', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '14px', marginBottom: '10px', cursor: 'pointer', display: 'flex', gap: '12px', alignItems: 'center' }}
              onMouseEnter={e => e.currentTarget.style.borderColor='#cc1a1a'}
              onMouseLeave={e => e.currentTarget.style.borderColor='#1e1e1e'}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 700 }}>{order.cliente_nombre}</div>
                  <span style={{ background: ESTADO_COLORS[order.estado]+'22', color: ESTADO_COLORS[order.estado], fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', border: `1px solid ${ESTADO_COLORS[order.estado]}44` }}>{order.estado}</span>
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>{order.items?.length} producto{order.items?.length!==1?'s':''} · {new Date(order.created_at).toLocaleDateString('es-CL', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}</div>
                <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>{order.cliente_telefono || order.cliente_correo}</div>
              </div>
              <span style={{ color: '#cc1a1a', fontSize: '18px' }}>›</span>
            </div>
          ))}
        </div>
      )}

      {/* ORDER DETAIL */}
      {view === 'orders' && selectedOrder && (
        <div>
          <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', color: '#cc1a1a', fontSize: '14px', cursor: 'pointer', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '4px' }}>← Volver a pedidos</button>

          <div style={{ background: '#141414', border: '1px solid #1e1e1e', borderRadius: '14px', padding: '18px', marginBottom: '14px' }}>
            <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              👤 {selectedOrder.cliente_nombre}
              <span style={{ background: ESTADO_COLORS[selectedOrder.estado]+'22', color: ESTADO_COLORS[selectedOrder.estado], fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '8px', border: `1px solid ${ESTADO_COLORS[selectedOrder.estado]}44` }}>{selectedOrder.estado}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px', marginBottom: '12px' }}>
              {selectedOrder.cliente_telefono && <div><span style={{ color: '#666' }}>📱 </span>{selectedOrder.cliente_telefono}</div>}
              {selectedOrder.cliente_correo && <div><span style={{ color: '#666' }}>✉️ </span>{selectedOrder.cliente_correo}</div>}
              <div><span style={{ color: '#666' }}>📅 </span>{new Date(selectedOrder.created_at).toLocaleDateString('es-CL', { day:'2-digit', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' })}</div>
            </div>
            {selectedOrder.notas && <div style={{ background: '#1e1e1e', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', color: '#ccc' }}>📝 {selectedOrder.notas}</div>}
          </div>

          {/* Products */}
          <div style={{ background: '#141414', border: '1px solid #1e1e1e', borderRadius: '14px', padding: '18px', marginBottom: '14px' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>Productos del pedido</div>
            {selectedOrder.items?.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px', padding: '10px 0', borderBottom: i < selectedOrder.items.length-1 ? '1px solid #1e1e1e' : 'none', alignItems: 'center' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '8px', overflow: 'hidden', background: '#1a1a1a', flexShrink: 0 }}>
                  {item.image ? <img src={STORAGE_URL + item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>👕</div>}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>{item.productName}</div>
                  <div style={{ fontSize: '12px', color: '#888' }}>Talla: {item.size} · {item.version === 'player' ? '⚡ Player' : 'Fan'}</div>
                  {item.estampado && <div style={{ fontSize: '12px', color: '#f59e0b' }}>✍️ {item.estName} #{item.estNum}</div>}
                  <div style={{ fontSize: '12px', color: item.stockType === 'stock' ? '#4ade80' : '#f59e0b', fontWeight: 600 }}>{item.stockType === 'stock' ? '● En stock' : '○ A pedido'}</div>
                </div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#cc1a1a' }}>${item.total?.toLocaleString('es-CL')}</div>
              </div>
            ))}
            <div style={{ borderTop: '1px solid #2a2a2a', marginTop: '10px', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 700 }}>
              <span>Total</span>
              <span style={{ color: '#cc1a1a' }}>${selectedOrder.items?.reduce((a,b) => a + (b.total||0), 0).toLocaleString('es-CL')}</span>
            </div>
          </div>

          {/* Provider section */}
          <div style={{ background: '#0a1400', border: '1px solid #166534', borderRadius: '14px', padding: '18px', marginBottom: '14px' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '10px', color: '#4ade80' }}>📋 Formato para proveedor</div>
            <pre style={{ fontSize: '13px', color: '#e0e0e0', whiteSpace: 'pre-wrap', fontFamily: 'inherit', lineHeight: 1.8, background: '#1a1a1a', borderRadius: '8px', padding: '12px', marginBottom: '10px' }}>
              {generateProviderText(selectedOrder)}
            </pre>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => { navigator.clipboard.writeText(generateProviderText(selectedOrder)); alert('¡Copiado!') }} style={{ flex: 1, padding: '11px', borderRadius: '8px', background: '#166534', border: 'none', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                📋 Copiar texto
              </button>
              <button onClick={() => generateOrderImage(selectedOrder)} style={{ flex: 1, padding: '11px', borderRadius: '8px', background: '#1a3a2a', border: '1px solid #166534', color: '#4ade80', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                🖼️ Generar imagen
              </button>
            </div>
            <canvas id="order-canvas" style={{ display: 'none' }} />
            <div id="order-img-wrap" style={{ marginTop: '10px' }} />
          </div>

          {/* Change status */}
          <div style={{ background: '#141414', border: '1px solid #1e1e1e', borderRadius: '14px', padding: '18px' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '10px' }}>Estado del pedido</div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {ESTADOS_PEDIDO.map(estado => (
                <button key={estado} onClick={() => updateOrderStatus(selectedOrder.id, estado)} style={{ padding: '7px 14px', borderRadius: '8px', border: `1px solid ${selectedOrder.estado === estado ? ESTADO_COLORS[estado] : '#2a2a2a'}`, background: selectedOrder.estado === estado ? ESTADO_COLORS[estado]+'33' : '#1a1a1a', color: selectedOrder.estado === estado ? ESTADO_COLORS[estado] : '#888', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                  {estado}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PRODUCT LIST */}
      {view === 'list' && (
        <div>
          {products.map(p => (
            <div key={p.id} style={{ background: '#141414', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '12px 14px', marginBottom: '8px', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '8px', overflow: 'hidden', background: '#1a1a1a', flexShrink: 0 }}>
                {p.imagenes?.[0] ? <img src={STORAGE_URL + p.imagenes[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>👕</div>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '3px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: p.version==='player'?'#a78bfa':'#888', background: p.version==='player'?'#1a0a2a':'#1e1e1e', padding: '2px 6px', borderRadius: '5px' }}>{p.version?.toUpperCase()}</span>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: p.stock_estado==='stock'?'#4ade80':'#f59e0b', background: p.stock_estado==='stock'?'#0a1a0a':'#1a1400', padding: '2px 6px', borderRadius: '5px' }}>{p.stock_estado==='stock'?'EN STOCK':'A PEDIDO'}</span>
                </div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>{p.nombre}</div>
                <div style={{ fontSize: '12px', color: '#555' }}>{p.tipo_producto} · {p.color}</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#cc1a1a' }}>${p.precio?.toLocaleString('es-CL')}</div>
              </div>
              <div style={{ display: 'flex', gap: '5px' }}>
                <button onClick={() => startEdit(p)} style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#ccc', borderRadius: '7px', padding: '6px 10px', fontSize: '13px', cursor: 'pointer' }}>✏️</button>
                <button onClick={() => deleteProduct(p.id)} style={{ background: '#1a0000', border: '1px solid #2a0a0a', color: '#cc1a1a', borderRadius: '7px', padding: '6px 10px', fontSize: '13px', cursor: 'pointer' }}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD/EDIT */}
      {view === 'add' && (
        <div style={{ maxWidth: '600px' }}>
          <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>{editId ? '✏️ Editar producto' : '➕ Nuevo producto'}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={lbl}>Nombre *</label>
              <input style={inp()} value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} placeholder="Ej: Brasil Away 2025" />
            </div>
            <div><label style={lbl}>Precio (CLP) *</label><input style={inp()} type="number" value={form.precio} onChange={e => setForm(f => ({ ...f, precio: e.target.value }))} /></div>
            <div><label style={lbl}>Color</label><input style={inp()} value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} /></div>
            <div><label style={lbl}>Tipo</label><select style={inp()} value={form.tipo_producto} onChange={e => setForm(f => ({ ...f, tipo_producto: e.target.value }))}>{TIPOS.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
            <div><label style={lbl}>Versión</label><select style={inp()} value={form.version} onChange={e => setForm(f => ({ ...f, version: e.target.value }))}>{VERSIONS.map(v => <option key={v} value={v}>{v}</option>)}</select></div>
            <div><label style={lbl}>Disponibilidad</label><select style={inp()} value={form.stock_estado} onChange={e => setForm(f => ({ ...f, stock_estado: e.target.value }))}>{STOCK_ESTADOS.map(s => <option key={s} value={s}>{s==='stock'?'En stock':'A pedido'}</option>)}</select></div>
            <div><label style={lbl}>Región</label><select style={inp()} value={form.region} onChange={e => setForm(f => ({ ...f, region: e.target.value }))}><option value="europa">Europa</option><option value="sudamerica">Sudamérica</option><option value="mundo">Resto del mundo</option></select></div>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={lbl}>Categorías (separadas por coma)</label>
              <input style={inp()} value={form.categorias} onChange={e => setForm(f => ({ ...f, categorias: e.target.value }))} placeholder="Club, Premier League, Liverpool" />
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={lbl}>Vincular con versión contraria</label>
              <select style={inp()} value={form.camiseta_vinculada} onChange={e => setForm(f => ({ ...f, camiseta_vinculada: e.target.value }))}>
                <option value="">Sin vincular</option>
                {products.filter(p => p.id !== editId).map(p => <option key={p.id} value={p.id}>{p.nombre} ({p.version})</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '16px', gridColumn: '1/-1', marginBottom: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#ccc' }}><input type="checkbox" checked={form.retro} onChange={e => setForm(f => ({ ...f, retro: e.target.checked }))} style={{ accentColor: '#cc1a1a' }} />Retro 🕰️</label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#ccc' }}><input type="checkbox" checked={form.destacada} onChange={e => setForm(f => ({ ...f, destacada: e.target.checked }))} style={{ accentColor: '#cc1a1a' }} />Destacada ⭐</label>
            </div>
          </div>
          <label style={lbl}>Fotos ({images.length} subidas)</label>
          <div
            onPaste={handlePaste}
            tabIndex={0}
            style={{ border: '2px dashed #cc1a1a', borderRadius: '10px', padding: '14px', textAlign: 'center', marginBottom: '8px', color: '#aaa', fontSize: '13px', outline: 'none', background: '#1a0000', cursor: 'default' }}
          >
            <div style={{ fontSize: '20px', marginBottom: '4px' }}>📋</div>
            <div style={{ fontWeight: 700, color: '#cc1a1a', marginBottom: '2px' }}>Pega aquí con Ctrl+V</div>
            <div style={{ fontSize: '11px', color: '#555' }}>Copia la imagen en Yupoo (clic derecho → Copiar imagen) y pega aquí</div>
          </div>
          <label style={{ display: 'block', border: '2px dashed #2a2a2a', borderRadius: '10px', padding: '12px', textAlign: 'center', cursor: 'pointer', marginBottom: '8px', color: '#555', fontSize: '13px' }}>
            <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => uploadImages([...e.target.files])} />
            📁 O selecciona archivos desde tu computador
          </label>
          {uploadStatus && <div style={{ fontSize: '12px', color: uploadStatus.startsWith('Error')?'#cc1a1a':'#4ade80', marginBottom: '8px', padding: '6px 10px', background: '#1a1a1a', borderRadius: '6px' }}>{uploadStatus}</div>}
          {images.length > 0 && (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
              {images.map((img, i) => (
                <div key={i} style={{ position: 'relative' }}>
                  <img src={STORAGE_URL + img} alt="" style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '8px', border: i===0?'2px solid #cc1a1a':'2px solid transparent' }} />
                  {i===0 && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(204,26,26,.8)', fontSize: '8px', color: '#fff', textAlign: 'center', padding: '2px', borderRadius: '0 0 6px 6px' }}>Portada</div>}
                  <button onClick={() => setImages(prev => prev.filter((_,j) => j!==i))} style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#cc1a1a', border: 'none', borderRadius: '50%', width: '18px', height: '18px', color: '#fff', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>×</button>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={saveProduct} disabled={saving||!form.nombre||!form.precio} style={{ flex: 1, padding: '14px', borderRadius: '10px', background: '#cc1a1a', border: 'none', color: '#fff', fontSize: '15px', fontWeight: 700, cursor: 'pointer' }}>
              {saving ? 'Guardando...' : editId ? 'Guardar cambios' : 'Agregar producto'}
            </button>
            <button onClick={() => { setView('list'); setForm(defaultForm()); setImages([]); setEditId(null) }} style={{ padding: '14px 20px', borderRadius: '10px', background: 'none', border: '1px solid #2a2a2a', color: '#666', fontSize: '14px', cursor: 'pointer' }}>Cancelar</button>
          </div>
        </div>
      )}

      {/* CONFIG */}
      {view === 'config' && (
        <div style={{ maxWidth: '400px' }}>
          <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>⚙️ Recargos globales</div>
          {[['Recargo talla XL/XXL/XXXL','recargo_xl'],['Recargo estampado','recargo_estampado'],['Recargo versión Player','recargo_player']].map(([label,key]) => (
            <div key={key}>
              <label style={lbl}>{label}</label>
              <input style={inp()} type="number" value={config[key]||''} onChange={e => setConfig(c => ({ ...c, [key]: parseInt(e.target.value) }))} />
            </div>
          ))}
          <button onClick={saveConfig} style={{ width: '100%', padding: '14px', borderRadius: '10px', background: '#cc1a1a', border: 'none', color: '#fff', fontSize: '15px', fontWeight: 700, cursor: 'pointer' }}>Guardar configuración</button>
        </div>
      )}
    </div>
  )
}
