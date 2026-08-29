import { useState } from 'react'
import { STORAGE_URL } from '../lib/supabase'

export default function Cart({ cart, removeFromCart, onClose, config }) {
  const [orderView, setOrderView] = useState(false)

  const total = cart.reduce((a, b) => a + b.total, 0)

  // Generate order text in the exact WhatsApp format
  function generateOrderText() {
    return cart.map(item => {
      const lines = []
      lines.push(`Talla:\t${item.size}`)
      lines.push(`Versión: ${item.version}`)
      if (item.estName) lines.push(`Nombre:\t${item.estName}`)
      if (item.estNum) lines.push(`Número:\t${item.estNum}`)
      return lines.join('\n')
    }).join('\n\n---\n\n')
  }

  // Generate summary for me (internal)
  function generateSummary() {
    return cart.map((item, i) => {
      const lines = [`*${i + 1}. ${item.productName}*`]
      lines.push(`Talla: ${item.size} | Versión: ${item.version}`)
      if (item.estName || item.estNum) lines.push(`Estampado: ${item.estName || '-'} #${item.estNum || '-'}`)
      lines.push(`Precio: $${item.total.toLocaleString('es-CL')}`)
      return lines.join('\n')
    }).join('\n\n')
  }

  function copyText(text) {
    navigator.clipboard.writeText(text).then(() => {
      alert('¡Copiado!')
    })
  }

  const firstImg = cart[0]?.image ? STORAGE_URL + cart[0].image : null

  if (orderView) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.95)', zIndex: 50, overflowY: 'auto', padding: '20px' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <button onClick={() => setOrderView(false)} style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#ccc', borderRadius: '8px', padding: '8px 14px', fontSize: '13px' }}>← Volver</button>
            <div style={{ fontWeight: 700, fontSize: '16px' }}>Resumen del pedido</div>
          </div>

          {/* First product image */}
          {firstImg && (
            <div style={{ borderRadius: '12px', overflow: 'hidden', marginBottom: '16px', aspectRatio: '1', maxHeight: '300px' }}>
              <img src={firstImg} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}

          {/* Order text — provider format */}
          <div style={{ background: '#141414', border: '1px solid #2a0a0a', borderRadius: '12px', padding: '16px', marginBottom: '12px' }}>
            <div style={{ fontSize: '11px', color: '#cc1a1a', fontWeight: 700, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Formato para proveedor</div>
            <pre style={{ fontSize: '14px', color: '#e0e0e0', whiteSpace: 'pre-wrap', fontFamily: 'inherit', lineHeight: 1.7 }}>{generateOrderText()}</pre>
            <button onClick={() => copyText(generateOrderText())} style={{ marginTop: '12px', width: '100%', padding: '10px', borderRadius: '8px', background: '#cc1a1a', border: 'none', color: '#fff', fontSize: '13px', fontWeight: 700 }}>
              📋 Copiar formato proveedor
            </button>
          </div>

          {/* Summary */}
          <div style={{ background: '#141414', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '16px', marginBottom: '12px' }}>
            <div style={{ fontSize: '11px', color: '#888', fontWeight: 700, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Resumen del pedido</div>
            <pre style={{ fontSize: '13px', color: '#ccc', whiteSpace: 'pre-wrap', fontFamily: 'inherit', lineHeight: 1.7 }}>{generateSummary()}</pre>
            <div style={{ borderTop: '1px solid #2a2a2a', marginTop: '12px', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 700 }}>
              <span>Total</span>
              <span style={{ color: '#cc1a1a' }}>${total.toLocaleString('es-CL')}</span>
            </div>
            <button onClick={() => copyText(generateSummary() + `\n\nTotal: $${total.toLocaleString('es-CL')}`)} style={{ marginTop: '12px', width: '100%', padding: '10px', borderRadius: '8px', background: '#1e1e1e', border: '1px solid #2a2a2a', color: '#ccc', fontSize: '13px', fontWeight: 600 }}>
              📋 Copiar resumen
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.85)', zIndex: 50, display: 'flex', justifyContent: 'flex-end' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#0f0f0f', width: '100%', maxWidth: '420px', height: '100%', overflowY: 'auto', borderLeft: '1px solid #1e1e1e', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ padding: '16px', borderBottom: '1px solid #1e1e1e', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '18px', fontWeight: 700 }}>🛒 Carrito <span style={{ fontSize: '13px', color: '#666', fontWeight: 400 }}>({cart.length} items)</span></div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#666', fontSize: '22px', lineHeight: 1 }}>×</button>
        </div>

        {cart.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#444', gap: '12px' }}>
            <span style={{ fontSize: '48px' }}>🛒</span>
            <span>El carrito está vacío</span>
          </div>
        ) : (
          <>
            <div style={{ flex: 1 }}>
              {cart.map(item => (
                <div key={item.cartId} style={{ padding: '14px 16px', borderBottom: '1px solid #181818', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '8px', overflow: 'hidden', background: '#1a0a0a', flexShrink: 0 }}>
                    {item.image
                      ? <img src={STORAGE_URL + item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>👕</div>
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '3px' }}>{item.productName}</div>
                    <div style={{ fontSize: '11px', color: '#888' }}>
                      Talla: {item.size} · Versión: {item.version}
                      {item.estName && ` · ${item.estName} #${item.estNum}`}
                    </div>
                    <div style={{ fontSize: '12px', color: item.stockType === 'stock' ? '#4ade80' : '#f59e0b', marginTop: '3px', fontWeight: 600 }}>
                      {item.stockType === 'stock' ? '● En stock' : '○ A pedido'}
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#cc1a1a', marginTop: '4px' }}>${item.total.toLocaleString('es-CL')}</div>
                  </div>
                  <button onClick={() => removeFromCart(item.cartId)} style={{ background: 'none', border: '1px solid #2a2a2a', color: '#666', borderRadius: '6px', padding: '4px 8px', fontSize: '11px', flexShrink: 0 }}>✕</button>
                </div>
              ))}
            </div>

            <div style={{ padding: '16px', borderTop: '1px solid #1e1e1e' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 700, marginBottom: '14px' }}>
                <span>Total</span>
                <span style={{ color: '#cc1a1a' }}>${total.toLocaleString('es-CL')}</span>
              </div>
              <button onClick={() => setOrderView(true)} style={{ width: '100%', padding: '15px', borderRadius: '12px', background: '#cc1a1a', border: 'none', color: '#fff', fontSize: '16px', fontWeight: 700 }}>
                Ver pedido completo →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
