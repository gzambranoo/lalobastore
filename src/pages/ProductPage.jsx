import { useState, useRef } from 'react'
import { STORAGE_URL } from '../lib/supabase'

const SIZES = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL']
const XL_SIZES = ['XL', 'XXL', 'XXXL']

export default function ProductPage({ product, products, config, onAddToCart, onSelectProduct, onBack }) {
  const [imgIndex, setImgIndex] = useState(0)
  const [size, setSize] = useState('')
  const [wantsEstampado, setWantsEstampado] = useState(null)
  const [estName, setEstName] = useState('')
  const [estNum, setEstNum] = useState('')
  const [added, setAdded] = useState(false)
  const touchStart = useRef(null)

  const images = product.imagenes || []
  const xlExtra = XL_SIZES.includes(size) ? config.recargo_xl : 0
  const estExtra = wantsEstampado ? config.recargo_estampado : 0
  const total = (product.precio || 0) + xlExtra + estExtra

  // Find linked version
  const linkedProduct = product.camiseta_vinculada
    ? products.find(p => p.id === product.camiseta_vinculada)
    : null

  function handleAdd() {
    if (!size || wantsEstampado === null) return
    onAddToCart({
      productName: product.nombre,
      productId: product.id,
      image: images[0] || null,
      size,
      version: product.version || 'fan',
      estampado: wantsEstampado,
      estName: wantsEstampado ? estName : '',
      estNum: wantsEstampado ? estNum : '',
      stockType: product.stock_estado,
      total,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  function prevImg() { setImgIndex(i => (i - 1 + images.length) % images.length) }
  function nextImg() { setImgIndex(i => (i + 1) % images.length) }
  function onTouchStart(e) { touchStart.current = e.touches[0].clientX }
  function onTouchEnd(e) {
    if (!touchStart.current) return
    const diff = touchStart.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 40) diff > 0 ? nextImg() : prevImg()
    touchStart.current = null
  }

  const isStock = product.stock_estado === 'stock'
  const isPlayer = product.version === 'player'

  return (
    <div style={{ paddingTop: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: '32px' }} className="product-grid">
        {/* Left: images */}
        <div>
          {/* Main image */}
          <div
            onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}
            style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', background: '#141414', aspectRatio: '1', marginBottom: '10px', userSelect: 'none' }}
          >
            {images.length > 0
              ? <img src={STORAGE_URL + images[imgIndex]} alt={product.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '80px' }}>👕</div>
            }
            {images.length > 1 && (
              <>
                <button onClick={prevImg} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,.6)', border: 'none', color: '#fff', borderRadius: '50%', width: '36px', height: '36px', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>‹</button>
                <button onClick={nextImg} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,.6)', border: 'none', color: '#fff', borderRadius: '50%', width: '36px', height: '36px', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>›</button>
                <div style={{ position: 'absolute', bottom: '10px', left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: '5px' }}>
                  {images.map((_, i) => <div key={i} onClick={() => setImgIndex(i)} style={{ width: i === imgIndex ? '18px' : '6px', height: '6px', borderRadius: '3px', background: i === imgIndex ? '#cc1a1a' : 'rgba(255,255,255,.4)', cursor: 'pointer', transition: 'all .2s' }} />)}
                </div>
                <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(0,0,0,.6)', color: '#fff', fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '10px', backdropFilter: 'blur(4px)' }}>
                  {imgIndex + 1}/{images.length}
                </div>
              </>
            )}
          </div>
          {/* Thumbnails */}
          {images.length > 1 && (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {images.map((img, i) => (
                <div key={i} onClick={() => setImgIndex(i)} style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer', border: `2px solid ${i === imgIndex ? '#cc1a1a' : 'transparent'}` }}>
                  <img src={STORAGE_URL + img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: info + actions */}
        <div>
          {/* Badges */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
            <span style={{ background: isStock ? '#14532d' : '#1c1c1c', color: isStock ? '#4ade80' : '#f59e0b', fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '8px', border: `1px solid ${isStock ? '#16a34a' : '#3a2800'}` }}>
              {isStock ? '● En stock' : '○ A pedido'}
            </span>
            {isPlayer && <span style={{ background: '#1a0a2a', color: '#a78bfa', fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '8px', border: '1px solid #7c3aed' }}>PLAYER VERSION</span>}
            {product.retro && <span style={{ background: '#2a1500', color: '#f59e0b', fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '8px' }}>Retro</span>}
          </div>

          <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '6px', lineHeight: 1.2 }}>{product.nombre}</h1>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>{product.color}</div>

          {/* Tags */}
          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '16px' }}>
            {product.categorias?.map(c => <span key={c} style={{ fontSize: '11px', background: '#1e1e1e', color: '#888', borderRadius: '6px', padding: '3px 8px', border: '1px solid #2a2a2a' }}>{c}</span>)}
          </div>

          {/* Price */}
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#cc1a1a', marginBottom: '20px' }}>
            ${total.toLocaleString('es-CL')}
            {xlExtra > 0 && <span style={{ fontSize: '12px', color: '#f59e0b', marginLeft: '8px', fontWeight: 600 }}>+${xlExtra.toLocaleString('es-CL')} talla {size}</span>}
            {estExtra > 0 && <span style={{ fontSize: '12px', color: '#f59e0b', marginLeft: '8px', fontWeight: 600 }}>+${estExtra.toLocaleString('es-CL')} estampado</span>}
          </div>

          {/* Linked version */}
          {linkedProduct && (
            <div style={{ background: '#141414', border: '1px solid #2a2a2a', borderRadius: '10px', padding: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => onSelectProduct(linkedProduct)}>
              <div style={{ width: '44px', height: '44px', borderRadius: '6px', overflow: 'hidden', flexShrink: 0, background: '#1a1a1a' }}>
                {linkedProduct.imagenes?.[0] && <img src={STORAGE_URL + linkedProduct.imagenes[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '11px', color: '#888', marginBottom: '2px' }}>Ver versión {isPlayer ? 'Fan' : 'Player'}</div>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>{linkedProduct.nombre}</div>
                <div style={{ fontSize: '13px', color: '#cc1a1a', fontWeight: 700 }}>${linkedProduct.precio?.toLocaleString('es-CL')}</div>
              </div>
              <span style={{ color: '#cc1a1a', fontSize: '18px' }}>→</span>
            </div>
          )}

          {/* Size */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '13px', color: '#888', marginBottom: '8px', fontWeight: 600 }}>Talla</div>
            <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap' }}>
              {SIZES.map(s => (
                <button key={s} onClick={() => setSize(s)} style={{ padding: '9px 16px', borderRadius: '9px', border: `1px solid ${size === s ? '#cc1a1a' : '#2a2a2a'}`, background: size === s ? '#cc1a1a' : '#141414', color: size === s ? '#fff' : '#aaa', fontSize: '14px', fontWeight: size === s ? 700 : 400, minWidth: '50px' }}>
                  {s}
                </button>
              ))}
            </div>
            {XL_SIZES.includes(size) && <div style={{ fontSize: '11px', color: '#f59e0b', marginTop: '6px' }}>+${config.recargo_xl?.toLocaleString('es-CL')} por talla {size}</div>}
          </div>

          {/* Estampado */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '13px', color: '#888', marginBottom: '8px', fontWeight: 600 }}>¿Agregar nombre y número?</div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
              <button onClick={() => setWantsEstampado(true)} style={{ flex: 1, padding: '10px', borderRadius: '9px', border: `1px solid ${wantsEstampado === true ? '#cc1a1a' : '#2a2a2a'}`, background: wantsEstampado === true ? '#cc1a1a' : '#141414', color: wantsEstampado === true ? '#fff' : '#aaa', fontSize: '13px', fontWeight: 600 }}>
                ✅ Sí (+${config.recargo_estampado?.toLocaleString('es-CL')})
              </button>
              <button onClick={() => { setWantsEstampado(false); setEstName(''); setEstNum('') }} style={{ flex: 1, padding: '10px', borderRadius: '9px', border: `1px solid ${wantsEstampado === false ? '#cc1a1a' : '#2a2a2a'}`, background: wantsEstampado === false ? '#1a0000' : '#141414', color: wantsEstampado === false ? '#ff6666' : '#aaa', fontSize: '13px', fontWeight: 600 }}>
                ❌ No
              </button>
            </div>
            {wantsEstampado === true && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <input value={estName} onChange={e => setEstName(e.target.value)} placeholder="Nombre" style={{ flex: 2, background: '#1a1a1a', border: '1px solid #cc1a1a', borderRadius: '8px', padding: '10px 12px', color: '#fff', fontSize: '14px', outline: 'none' }} />
                <input value={estNum} onChange={e => setEstNum(e.target.value)} placeholder="Número" type="number" style={{ flex: 1, background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '8px', padding: '10px 12px', color: '#fff', fontSize: '14px', outline: 'none' }} />
              </div>
            )}
          </div>

          {/* Add to cart */}
          <button onClick={handleAdd} disabled={!size || wantsEstampado === null} style={{ width: '100%', padding: '16px', borderRadius: '12px', background: added ? '#14532d' : (size && wantsEstampado !== null) ? '#cc1a1a' : '#2a2a2a', border: 'none', color: (size && wantsEstampado !== null) ? '#fff' : '#555', fontSize: '16px', fontWeight: 700, transition: 'background .3s' }}>
            {added ? '✓ Agregado al carrito' : `🛒 Agregar — $${total.toLocaleString('es-CL')}`}
          </button>

          {(!size || wantsEstampado === null) && (
            <div style={{ fontSize: '12px', color: '#555', textAlign: 'center', marginTop: '8px' }}>
              {!size && wantsEstampado === null ? 'Selecciona talla y si quieres estampado' : !size ? 'Selecciona una talla' : 'Indica si quieres estampado'}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .product-grid { grid-template-columns: 1fr !important; gap: 20px !important; }
        }
      `}</style>
    </div>
  )
}
