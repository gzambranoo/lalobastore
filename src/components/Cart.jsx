import { useState, useRef } from 'react'
import { supabase, STORAGE_URL } from '../lib/supabase'

export default function Cart({ cart, removeFromCart, onClose, config, clearCart }) {
  const [step, setStep] = useState('cart')
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [correo, setCorreo] = useState('')
  const [notas, setNotas] = useState('')
  const [saving, setSaving] = useState(false)
  const [orderId, setOrderId] = useState(null)
  const [generatingImg, setGeneratingImg] = useState(false)
  const canvasRef = useRef(null)

  const total = cart.reduce((a, b) => a + b.total, 0)

  async function submitOrder() {
    if (!nombre.trim()) return alert('Ingresa tu nombre')
    if (!telefono.trim() && !correo.trim()) return alert('Ingresa al menos teléfono o correo')
    setSaving(true)
    const items = cart.map(item => ({
      productId: item.productId, productName: item.productName, image: item.image,
      size: item.size, version: item.version, estampado: item.estampado,
      estName: item.estName, estNum: item.estNum, stockType: item.stockType, total: item.total,
    }))
    const { data, error } = await supabase.from('pedidos').insert({
      cliente_nombre: nombre.trim(), cliente_telefono: telefono.trim(),
      cliente_correo: correo.trim(), items, notas: notas.trim(), estado: 'pendiente'
    }).select('id').single()
    setSaving(false)
    if (error) { alert('Error al enviar pedido: ' + error.message); return }
    setOrderId(data.id.slice(0, 8).toUpperCase())
    setStep('confirm')
    clearCart()
  }

  const inp = { width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '8px', padding: '10px 12px', color: '#fff', fontSize: '14px', outline: 'none', marginBottom: '10px' }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.85)', zIndex: 50, display: 'flex', justifyContent: 'flex-end' }} onClick={step !== 'confirm' ? onClose : undefined}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#0f0f0f', width: '100%', maxWidth: '430px', height: '100%', overflowY: 'auto', borderLeft: '1px solid #1e1e1e', display: 'flex', flexDirection: 'column' }}>

        <div style={{ padding: '16px', borderBottom: '1px solid #1e1e1e', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ fontSize: '17px', fontWeight: 700 }}>
            {step === 'cart' && <>🛒 Carrito <span style={{ fontSize: '13px', color: '#666', fontWeight: 400 }}>({cart.length} items)</span></>}
            {step === 'form' && '📋 Datos del pedido'}
            {step === 'confirm' && '✅ Pedido enviado'}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#666', fontSize: '22px', cursor: 'pointer' }}>×</button>
        </div>

        {step === 'cart' && (
          <>
            {cart.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#444', gap: '12px' }}>
                <span style={{ fontSize: '48px' }}>🛒</span><span>El carrito está vacío</span>
              </div>
            ) : (
              <>
                <div style={{ flex: 1 }}>
                  {cart.map(item => (
                    <div key={item.cartId} style={{ padding: '12px 16px', borderBottom: '1px solid #181818', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <div style={{ width: '52px', height: '52px', borderRadius: '8px', overflow: 'hidden', background: '#1a0a0a', flexShrink: 0 }}>
                        {item.image ? <img src={STORAGE_URL + item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>👕</div>}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '2px' }}>{item.productName}</div>
                        <div style={{ fontSize: '11px', color: '#888' }}>Talla: {item.size} · {item.version === 'player' ? 'Player' : 'Fan'}</div>
                        {item.estampado && <div style={{ fontSize: '11px', color: '#f59e0b' }}>✍️ {item.estName} #{item.estNum}</div>}
                        <div style={{ fontSize: '15px', fontWeight: 700, color: '#cc1a1a', marginTop: '3px' }}>${item.total.toLocaleString('es-CL')}</div>
                      </div>
                      <button onClick={() => removeFromCart(item.cartId)} style={{ background: 'none', border: '1px solid #2a2a2a', color: '#666', borderRadius: '6px', padding: '4px 8px', fontSize: '11px', cursor: 'pointer' }}>✕</button>
                    </div>
                  ))}
                </div>
                <div style={{ padding: '16px', borderTop: '1px solid #1e1e1e', flexShrink: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 700, marginBottom: '14px' }}>
                    <span>Total</span><span style={{ color: '#cc1a1a' }}>${total.toLocaleString('es-CL')}</span>
                  </div>
                  <button onClick={() => setStep('form')} style={{ width: '100%', padding: '15px', borderRadius: '12px', background: '#cc1a1a', border: 'none', color: '#fff', fontSize: '16px', fontWeight: 700, cursor: 'pointer' }}>
                    Continuar con el pedido →
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {step === 'form' && (
          <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
            <button onClick={() => setStep('cart')} style={{ background: 'none', border: 'none', color: '#cc1a1a', fontSize: '14px', cursor: 'pointer', marginBottom: '16px' }}>← Volver al carrito</button>
            <div style={{ background: '#141414', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '14px', marginBottom: '20px' }}>
              <div style={{ fontSize: '13px', color: '#888', marginBottom: '8px' }}>{cart.length} producto{cart.length!==1?'s':''} · Total: <span style={{ color: '#cc1a1a', fontWeight: 700 }}>${total.toLocaleString('es-CL')}</span></div>
              {cart.map((item, i) => <div key={i} style={{ fontSize: '12px', color: '#ccc', padding: '3px 0', borderBottom: i < cart.length-1 ? '1px solid #1e1e1e' : 'none' }}>{item.productName} — {item.size} · {item.version}</div>)}
            </div>
            <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px' }}>Tus datos de contacto</div>
            <label style={{ fontSize: '12px', color: '#888', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Nombre *</label>
            <input style={inp} value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Tu nombre completo" />
            <label style={{ fontSize: '12px', color: '#888', fontWeight: 600, display: 'block', marginBottom: '4px' }}>WhatsApp / Teléfono</label>
            <input style={inp} value={telefono} onChange={e => setTelefono(e.target.value)} placeholder="+56 9 XXXX XXXX" type="tel" />
            <label style={{ fontSize: '12px', color: '#888', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Correo electrónico</label>
            <input style={inp} value={correo} onChange={e => setCorreo(e.target.value)} placeholder="tu@correo.com" type="email" />
            <label style={{ fontSize: '12px', color: '#888', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Notas (opcional)</label>
            <textarea style={{ ...inp, resize: 'vertical', minHeight: '70px', fontFamily: 'inherit' }} value={notas} onChange={e => setNotas(e.target.value)} placeholder="Alguna indicación adicional..." />
            <div style={{ background: '#1a1400', border: '1px solid #854d0e', borderRadius: '8px', padding: '10px 12px', marginBottom: '16px', fontSize: '12px', color: '#fbbf24' }}>
              💬 Nos contactaremos contigo por WhatsApp o correo para coordinar el pago y la entrega.
            </div>
            <button onClick={submitOrder} disabled={saving} style={{ width: '100%', padding: '15px', borderRadius: '12px', background: '#cc1a1a', border: 'none', color: '#fff', fontSize: '16px', fontWeight: 700, cursor: 'pointer' }}>
              {saving ? 'Enviando...' : '✅ Confirmar pedido'}
            </button>
          </div>
        )}

        {step === 'confirm' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '30px', textAlign: 'center' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>✅</div>
            <div style={{ fontSize: '22px', fontWeight: 800, marginBottom: '8px' }}>¡Pedido recibido!</div>
            <div style={{ fontSize: '13px', color: '#888', marginBottom: '16px', lineHeight: 1.6 }}>
              Tu pedido fue enviado correctamente.<br/>Nos contactaremos contigo pronto.
            </div>
            {orderId && <div style={{ background: '#1a0000', border: '1px solid #cc1a1a', borderRadius: '10px', padding: '10px 20px', marginBottom: '20px', fontFamily: 'monospace', fontSize: '16px', color: '#cc1a1a', fontWeight: 700 }}>#{orderId}</div>}
            <button onClick={onClose} style={{ padding: '13px 28px', borderRadius: '10px', background: '#cc1a1a', border: 'none', color: '#fff', fontSize: '15px', fontWeight: 700, cursor: 'pointer' }}>
              Volver a la tienda
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
