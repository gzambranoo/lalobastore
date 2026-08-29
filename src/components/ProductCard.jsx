import { STORAGE_URL } from '../lib/supabase'

const CAT_ICONS = { camiseta: '👕', short: '🩳', cortavientos: '🧥', entrenamiento: '⚽', ropa: '👔' }

export default function ProductCard({ product, onClick }) {
  const imgUrl = product.imagenes?.[0] ? STORAGE_URL + product.imagenes[0] : null
  const isStock = product.stock_estado === 'stock'
  const isPlayer = product.version === 'player'

  return (
    <div onClick={onClick} style={{ background: '#141414', border: '1px solid #1e1e1e', borderRadius: '14px', overflow: 'hidden', cursor: 'pointer', transition: 'transform .15s, border-color .15s' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = '#cc1a1a' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = '#1e1e1e' }}
    >
      {/* Image */}
      <div style={{ position: 'relative', aspectRatio: '1', background: '#1a0a0a', overflow: 'hidden' }}>
        {imgUrl
          ? <img src={imgUrl} alt={product.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' }}>{CAT_ICONS[product.tipo_producto] || '👕'}</div>
        }
        {/* Badges */}
        <div style={{ position: 'absolute', top: '8px', left: '8px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          <span style={{ background: isStock ? '#14532d' : '#1c1c1c', color: isStock ? '#4ade80' : '#888', fontSize: '9px', fontWeight: 700, padding: '3px 7px', borderRadius: '6px', border: `1px solid ${isStock ? '#16a34a' : '#2a2a2a'}` }}>
            {isStock ? '● En stock' : '○ A pedido'}
          </span>
          {isPlayer && (
            <span style={{ background: '#1a0a2a', color: '#a78bfa', fontSize: '9px', fontWeight: 700, padding: '3px 7px', borderRadius: '6px', border: '1px solid #7c3aed' }}>
              PLAYER
            </span>
          )}
        </div>
        {/* Linked version badge */}
        {product.camiseta_vinculada && (
          <div style={{ position: 'absolute', top: '8px', right: '8px' }}>
            <span style={{ background: 'rgba(0,0,0,.7)', color: '#ccc', fontSize: '9px', padding: '3px 6px', borderRadius: '6px' }}>
              {isPlayer ? 'Fan ↗' : 'Player ↗'}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '12px' }}>
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '6px' }}>
          {product.retro && <span style={{ fontSize: '9px', background: '#2a1500', color: '#f59e0b', borderRadius: '5px', padding: '2px 6px' }}>Retro</span>}
          {product.categorias?.slice(0, 3).map(c => (
            <span key={c} style={{ fontSize: '9px', background: '#1e1e1e', color: '#666', borderRadius: '5px', padding: '2px 6px' }}>{c}</span>
          ))}
        </div>
        <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginBottom: '2px', lineHeight: 1.3 }}>{product.nombre}</div>
        <div style={{ fontSize: '11px', color: '#555', marginBottom: '8px' }}>{product.color}</div>
        <div style={{ fontSize: '18px', fontWeight: 800, color: '#cc1a1a' }}>${product.precio?.toLocaleString('es-CL')}</div>
      </div>
    </div>
  )
}
