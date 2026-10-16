import { useMemo } from 'react'
import { STORAGE_URL } from '../lib/supabase'
import ProductCard from '../components/ProductCard'

const img = (p) => (p?.imagenes?.[0] ? STORAGE_URL + p.imagenes[0] : null)
const isClub = (p) => p.categorias?.includes('Club')
const isSel = (p) => p.categorias?.includes('Selección') || p.categorias?.includes('Seleccion')

const TRUST = [
  ['🚚', 'Entrega en 14–20 días', 'Pedidos importados, directo a tu puerta'],
  ['✅', 'Disponibilidad confirmada', 'Te confirmamos cada pedido antes de pagar'],
  ['🎽', 'Nombre y número', 'Personaliza tu camiseta por +$3.000'],
  ['💬', 'Atención por WhatsApp', 'Resolvemos tus dudas al tiro'],
]

function SectionHead({ title, sub, onMore, moreLabel = 'Ver todo →' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', margin: '40px 0 16px', gap: '12px' }}>
      <div>
        <h2 style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-.3px', color: 'var(--text)' }}>{title}</h2>
        {sub && <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '3px' }}>{sub}</div>}
      </div>
      {onMore && <button onClick={onMore} style={{ background: 'none', border: 'none', color: '#cc1a1a', fontSize: '13px', fontWeight: 700, whiteSpace: 'nowrap' }}>{moreLabel}</button>}
    </div>
  )
}

export default function HomePage({ products, loading, go, onSelectProduct, favorites, onToggleFav }) {
  const destacadas = useMemo(() => products.filter(p => p.destacada).sort((a, b) => a.nombre?.localeCompare(b.nombre, 'es')).slice(0, 8), [products])
  const recientes = useMemo(() => [...products].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 8), [products])
  const heroImgs = useMemo(() => {
    const pool = (destacadas.length ? destacadas : recientes).filter(p => img(p))
    return pool.slice(0, 3)
  }, [destacadas, recientes])

  const cats = useMemo(() => {
    const defs = [
      { key: 'clubs', label: 'Clubes', emoji: '⚽', filter: isClub, action: () => go('clubs') },
      { key: 'sel', label: 'Selecciones', emoji: '🌍', filter: isSel, action: () => go('selecciones') },
      { key: 'retro', label: 'Retro', emoji: '🕰️', filter: p => p.retro, action: () => go('retro') },
      { key: 'player', label: 'Player Version', emoji: '⚡', filter: p => p.version === 'player', action: () => go('catalog', { version: 'player' }) },
      { key: 'short', label: 'Shorts', emoji: '🩳', filter: p => p.tipo_producto === 'short', action: () => go('catalog', { tipoCat: 'short' }) },
      { key: 'wind', label: 'Cortavientos', emoji: '🧥', filter: p => p.tipo_producto === 'cortavientos', action: () => go('catalog', { tipoCat: 'cortavientos' }) },
    ]
    return defs.map(d => {
      const list = products.filter(d.filter)
      return { ...d, count: list.length, cover: img(list.find(p => img(p))) }
    })
  }, [products, go])

  return (
    <div style={{ paddingTop: '20px' }}>
      {/* HERO */}
      <section style={{ position: 'relative', overflow: 'hidden', borderRadius: '22px', border: '1px solid var(--border)', background: `radial-gradient(900px 340px at 85% 0%, var(--hero-glow), transparent 70%), var(--card)` }}>
        <div className="lb-hero-grid" style={{ display: 'grid', gridTemplateColumns: '1.15fr .85fr', gap: '20px', alignItems: 'center', padding: 'clamp(24px,5vw,56px)' }}>
          <div>
            <div style={{ display: 'inline-block', fontSize: '11px', fontWeight: 800, letterSpacing: '2px', color: '#cc1a1a', background: 'var(--accent-soft)', border: '1px solid #cc1a1a55', borderRadius: '20px', padding: '5px 12px', marginBottom: '16px' }}>TEMPORADA 26/27</div>
            <h1 style={{ fontSize: 'clamp(30px,5.2vw,52px)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-1.5px', color: 'var(--text)' }}>
              La camiseta de tu equipo,<br /><span style={{ color: '#cc1a1a' }}>sin vueltas.</span>
            </h1>
            <p style={{ fontSize: '15.5px', color: 'var(--muted)', lineHeight: 1.6, margin: '16px 0 26px', maxWidth: '460px' }}>
              Clubes, selecciones y retro. Versión fan y player, con nombre y número si quieres. Llega en 14 a 20 días.
            </p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button className="lb-btn" onClick={() => go('catalog')} style={{ background: '#cc1a1a', color: '#fff', border: 'none', borderRadius: '12px', padding: '14px 26px', fontSize: '15px', fontWeight: 700, boxShadow: '0 6px 20px rgba(204,26,26,.35)' }}>Ver camisetas</button>
              <button className="lb-btn" onClick={() => go('retro')} style={{ background: 'none', color: 'var(--text)', border: '1px solid var(--border2)', borderRadius: '12px', padding: '14px 26px', fontSize: '15px', fontWeight: 700 }}>🕰️ Retro</button>
            </div>
          </div>
          <div className="lb-hero-art" style={{ position: 'relative', height: '300px' }}>
            {heroImgs.length > 0 ? heroImgs.map((p, i) => (
              <div key={p.id} onClick={() => onSelectProduct(p)} className="lb-tile" style={{ position: 'absolute', width: '52%', aspectRatio: '3/4', left: ['2%', '26%', '48%'][i], top: ['26px', '0px', '34px'][i], transform: `rotate(${[-7, 2, 8][i]}deg)`, borderRadius: '16px', overflow: 'hidden', border: '3px solid var(--card)', boxShadow: 'var(--shadow)', cursor: 'pointer', zIndex: i === 1 ? 2 : 1 }}>
                <img src={img(p)} alt={p.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )) : (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '110px', opacity: .9 }}>🐺</div>
            )}
          </div>
        </div>
      </section>

      {/* CATEGORÍAS */}
      <SectionHead title="Compra por categoría" sub="Encuentra rápido lo que buscas" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '14px' }}>
        {cats.map(c => (
          <button key={c.key} className="lb-tile" onClick={c.action} style={{ position: 'relative', overflow: 'hidden', textAlign: 'left', aspectRatio: '4/3', borderRadius: '16px', border: '1px solid var(--border)', background: 'var(--card2)', padding: 0 }}>
            {c.cover && <img src={c.cover} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
            <div style={{ position: 'absolute', inset: 0, background: c.cover ? 'linear-gradient(180deg, rgba(0,0,0,.05) 25%, rgba(0,0,0,.78))' : 'transparent' }} />
            {!c.cover && <div style={{ position: 'absolute', top: '14px', right: '16px', fontSize: '38px' }}>{c.emoji}</div>}
            <div style={{ position: 'absolute', left: '14px', bottom: '12px', right: '14px' }}>
              <div style={{ fontSize: '16px', fontWeight: 800, color: c.cover ? '#fff' : 'var(--text)' }}>{c.label}</div>
              <div style={{ fontSize: '12px', color: c.cover ? 'rgba(255,255,255,.75)' : 'var(--muted)' }}>{c.count} {c.count === 1 ? 'producto' : 'productos'}</div>
            </div>
          </button>
        ))}
      </div>

      {/* DESTACADAS */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px', color: 'var(--faint)' }}>Cargando…</div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--faint)', marginTop: '30px', border: '1px dashed var(--border2)', borderRadius: '16px' }}>
          <div style={{ fontSize: '40px', marginBottom: '10px' }}>🐺</div>
          Pronto subiremos las nuevas camisetas.
        </div>
      ) : (
        <>
          {destacadas.length > 0 && (
            <>
              <SectionHead title="Destacadas" sub="Las favoritas de la manada" onMore={() => go('catalog')} />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '14px' }}>
                {destacadas.map(p => <ProductCard key={p.id} product={p} onClick={() => onSelectProduct(p)} isFav={favorites.includes(p.id)} onToggleFav={onToggleFav} />)}
              </div>
            </>
          )}
          <SectionHead title="Recién llegadas" sub="Lo último que agregamos" onMore={() => go('catalog', { sortBy: 'recent' })} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '14px' }}>
            {recientes.map(p => <ProductCard key={p.id} product={p} onClick={() => onSelectProduct(p)} isFav={favorites.includes(p.id)} onToggleFav={onToggleFav} />)}
          </div>
        </>
      )}

      {/* LOOKBOOK: se agrega en el paso 2b */}

      {/* FRANJAS DE CONFIANZA */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginTop: '48px' }}>
        {TRUST.map(([icon, title, sub]) => (
          <div key={title} style={{ display: 'flex', gap: '12px', alignItems: 'center', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '16px' }}>
            <div style={{ fontSize: '26px' }}>{icon}</div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>{title}</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px', lineHeight: 1.4 }}>{sub}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ textAlign: 'center', marginTop: '26px' }}>
        <button onClick={() => go('info')} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: '13px', textDecoration: 'underline' }}>Ver precios y cómo comprar</button>
      </div>
    </div>
  )
}
