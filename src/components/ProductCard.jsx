import { STORAGE_URL } from '../lib/supabase'

const CAT_ICONS = { camiseta: '👕', short: '🩳', cortavientos: '🧥', entrenamiento: '⚽', ropa: '👔' }

export default function ProductCard({ product, onClick, isFav, onToggleFav }) {
  const imgUrl = product.imagenes?.[0] ? STORAGE_URL + product.imagenes[0] : null
  const isStock = product.stock_estado === 'stock'
  const isPlayer = product.version === 'player'

  return (
    <div onClick={onClick} style={{ background: '#141414', border: '1px solid #1e1e1e', borderRadius: '14px', overflow: 'hidden', cursor: 'pointer', transition: 'transform .15s, border-color .15s', position: 'relative' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = '#cc1a1a' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = '#1e1e1e' }}
    >
      <div style={{ position: 'relative', aspectRatio: '1', background: '#1a0a0a', overflow: 'hidden' }}>
        {imgUrl
          ? <img src={imgUrl} alt={product.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' }}>{CAT_ICONS[product.tipo_producto] || '👕'}</div>
        }
        {/* Fav button */}
        <button onClick={e => { e.stopPropagation(); onToggleFav(product.id) }} style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,.65)', border: 'none', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', cursor: 'pointer', backdropFilter: 'blur(4px)' }}>
          {isFav ? '❤️' : '🤍'}
        </button>
        {/* Badges */}
        <div style={{ position: 'absolute', top: '8px', left: '8px', display: 'flex', gap: '4px', flexDirection: 'column' }}>
          <span style={{ background: isStock ? '#14532d' : '#1c1c1c', color: isStock ? '#4ade80' : '#888', fontSize: '9px', fontWeight: 700, padding: '3px 7px', borderRadius: '6px', border: `1px solid ${isStock ? '#16a34a' : '#2a2a2a'}` }}>
            {isStock ? '● Stock' : '○ Pedido'}
          </span>
          {isPlayer && <span style={{ background: '#1a0a2a', color: '#a78bfa', fontSize: '9px', fontWeight: 700, padding: '3px 7px', borderRadius: '6px', border: '1px solid #7c3aed' }}>PLAYER</span>}
        </div>
      </div>
      <div style={{ padding: '10px 12px' }}>
        <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap', marginBottom: '4px' }}>
          {product.retro && <span style={{ fontSize: '8px', background: '#2a1500', color: '#f59e0b', borderRadius: '5px', padding: '1px 5px' }}>Retro</span>}
          {product.categorias?.slice(0, 2).map(c => <span key={c} style={{ fontSize: '8px', background: '#1e1e1e', color: '#555', borderRadius: '5px', padding: '1px 5px' }}>{c}</span>)}
        </div>
        <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff', lineHeight: 1.3, marginBottom: '2px' }}>{product.nombre}</div>
        <div style={{ fontSize: '11px', color: '#555', marginBottom: '6px' }}>{product.color}</div>
        <div style={{ fontSize: '17px', fontWeight: 800, color: '#cc1a1a' }}>${product.precio?.toLocaleString('es-CL')}</div>

      </div>
    </div>
  )
}
