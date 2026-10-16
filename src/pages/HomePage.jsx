import { useMemo, useState, useEffect, useRef } from 'react'
import { supabase, STORAGE_URL } from '../lib/supabase'
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


function GalleryCarousel({ fotos, onOpen }) {
  const ref = useRef(null)
  const paused = useRef(false)
  const scrollBy = (dir) => {
    const el = ref.current; if (!el) return
    const step = 240
    if (dir > 0 && el.scrollLeft + el.clientWidth >= el.scrollWidth - 8) el.scrollTo({ left: 0, behavior: 'smooth' })
    else el.scrollBy({ left: dir * step, behavior: 'smooth' })
  }
  useEffect(() => {
    const t = setInterval(() => { if (!paused.current) scrollBy(1) }, 3500)
    return () => clearInterval(t)
  }, [])
  const arrow = (side, dir, label) => (
    <button onClick={() => scrollBy(dir)} aria-label={label} style={{ position: 'absolute', top: '50%', [side]: '8px', transform: 'translateY(-50%)', zIndex: 2, width: '38px', height: '38px', borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,.6)', color: '#fff', fontSize: '18px' }}>{dir < 0 ? '‹' : '›'}</button>
  )
  return (
    <div style={{ position: 'relative' }} onMouseEnter={() => { paused.current = true }} onMouseLeave={() => { paused.current = false }} onTouchStart={() => { paused.current = true }}>
      <div ref={ref} className="lb-row" style={{ scrollSnapType: 'x mandatory' }}>
        {fotos.map(f => (
          <button key={f.id} className="lb-tile" onClick={onOpen} style={{ flex: '0 0 auto', width: '220px', aspectRatio: '4/5', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border)', padding: 0, background: 'var(--card2)', scrollSnapAlign: 'start', position: 'relative' }}>
            <img src={STORAGE_URL + f.imagen} alt={f.descripcion || 'Pedido entregado'} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            {f.descripcion && <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '22px 12px 10px', background: 'linear-gradient(transparent, rgba(0,0,0,.75))', color: '#fff', fontSize: '12px', textAlign: 'left' }}>{f.descripcion}</div>}
          </button>
        ))}
      </div>
      {fotos.length > 2 && <>{arrow('left', -1, 'Anterior')}{arrow('right', 1, 'Siguiente')}</>}
    </div>
  )
}

const shuffle = (arr) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] } return a }

function Lookbook({ items, products, onSelectProduct }) {
  const byId = useMemo(() => Object.fromEntries(products.map(p => [String(p.id), p])), [products])
  const [big, ...small] = items
  const Cell = ({ it, large }) => {
    const p = byId[String(it.camiseta_id)]
    const clickable = !!p
    return (
      <div onClick={clickable ? () => onSelectProduct(p) : undefined} className={(clickable ? 'lb-tile' : '') + (large ? ' lb-look-big' : '')} style={{ position: 'relative', overflow: 'hidden', borderRadius: '16px', border: '1px solid var(--border)', background: 'var(--card2)', cursor: clickable ? 'pointer' : 'default', gridColumn: large ? 'span 2' : undefined, gridRow: large ? 'span 2' : undefined, aspectRatio: large ? undefined : '1/1', minHeight: 0 }}>
        <img src={STORAGE_URL + it.imagen} alt={p?.nombre || 'Lookbook'} loading="lazy" style={{ position: large ? 'absolute' : 'static', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        {p && (
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '28px 14px 12px', background: 'linear-gradient(transparent, rgba(0,0,0,.78))', color: '#fff' }}>
            <div style={{ fontSize: large ? '16px' : '13px', fontWeight: 800, lineHeight: 1.2 }}>{p.nombre}</div>
            <div style={{ fontSize: '12px', opacity: .85, marginTop: '2px' }}>${p.precio?.toLocaleString('es-CL')}{large ? ' · Ver camiseta →' : ''}</div>
          </div>
        )}
      </div>
    )
  }
  return (
    <div className="lb-look" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
      <Cell it={big} large />
      {small.map(it => <Cell key={it.id} it={it} />)}
    </div>
  )
}

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
  const [banners, setBanners] = useState([])
  const [bannerIdx, setBannerIdx] = useState(0)
  const [fotos, setFotos] = useState([])
  const [look, setLook] = useState([])

  useEffect(() => {
    supabase.from('banners').select('*').order('orden', { ascending: true }).then(({ data, error }) => { if (!error && data) setBanners(data) })
    supabase.from('lookbook').select('*').eq('destacada', true).order('orden', { ascending: true }).limit(5).then(({ data, error }) => { if (!error && data) setLook(data) })
    supabase.from('galeria').select('*').order('created_at', { ascending: false }).limit(14).then(({ data, error }) => { if (!error && data) setFotos(data) })
  }, [])

  useEffect(() => {
    if (banners.length < 2) return
    const t = setInterval(() => setBannerIdx(i => (i + 1) % banners.length), 6000)
    return () => clearInterval(t)
  }, [banners.length])
  const hasBanner = banners.length > 0

  const destacadas = useMemo(() => products.filter(p => p.destacada).sort((a, b) => a.nombre?.localeCompare(b.nombre, 'es')).slice(0, 8), [products])
  const heroImgs = useMemo(() => {
    const pool = (destacadas.length ? destacadas : products).filter(p => img(p))
    return pool.slice(0, 3)
  }, [destacadas, products])

  const cats = useMemo(() => {
    const defs = [
      { key: 'clubs', label: 'Clubes', emoji: '⚽', filter: isClub, to: ['clubs'] },
      { key: 'sel', label: 'Selecciones', emoji: '🌍', filter: isSel, to: ['selecciones'] },
      { key: 'retro', label: 'Retro', emoji: '🕰️', filter: p => p.retro, to: ['retro'] },
      { key: 'player', label: 'Player Version', emoji: '⚡', filter: p => p.version === 'player', to: ['catalog', { version: 'player' }] },
      { key: 'short', label: 'Shorts', emoji: '🩳', filter: p => p.tipo_producto === 'short', to: ['ropa', { tipoCat: 'short' }] },
      { key: 'wind', label: 'Cortavientos', emoji: '🧥', filter: p => p.tipo_producto === 'cortavientos', to: ['ropa', { tipoCat: 'cortavientos' }] },
    ]
    // Portadas al azar y sin repetir foto entre categorías (si hay suficientes productos)
    const used = new Set()
    const covers = {}
    for (const d of shuffle(defs)) {
      const withImg = shuffle(products.filter(d.filter).filter(p => img(p)))
      const pick = withImg.find(p => !used.has(p.id)) || withImg[0]
      if (pick) { used.add(pick.id); covers[d.key] = img(pick) }
    }
    return defs.map(d => ({ ...d, count: products.filter(d.filter).length, cover: covers[d.key] || null }))
  }, [products])

  return (
    <div style={{ paddingTop: '20px' }}>
      {/* HERO */}
      <section style={{ position: 'relative', overflow: 'hidden', borderRadius: '22px', border: '1px solid var(--border)', background: hasBanner ? '#111' : `radial-gradient(900px 340px at 85% 0%, var(--hero-glow), transparent 70%), var(--card)` }}>
        {hasBanner && banners.map((b, i) => (
          <img key={b.id} src={STORAGE_URL + b.imagen} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: i === bannerIdx ? 1 : 0, transition: 'opacity 1s ease' }} />
        ))}
        {hasBanner && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(0,0,0,.72) 0%, rgba(0,0,0,.45) 45%, rgba(0,0,0,.1) 100%)' }} />}
        <div className="lb-hero-grid" style={{ position: 'relative', display: 'grid', gridTemplateColumns: hasBanner ? '1fr' : '1.15fr .85fr', gap: '20px', alignItems: 'center', padding: 'clamp(24px,5vw,56px)', minHeight: hasBanner ? 'clamp(320px,38vw,420px)' : undefined }}>
          <div>
            <div style={{ display: 'inline-block', fontSize: '11px', fontWeight: 800, letterSpacing: '2px', color: '#cc1a1a', background: 'var(--accent-soft)', border: '1px solid #cc1a1a55', borderRadius: '20px', padding: '5px 12px', marginBottom: '16px' }}>TEMPORADA 26/27</div>
            <h1 style={{ fontSize: 'clamp(30px,5.2vw,52px)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-1.5px', color: hasBanner ? '#fff' : 'var(--text)' }}>
              La camiseta de tu equipo,<br /><span style={{ color: '#cc1a1a' }}>sin vueltas.</span>
            </h1>
            <p style={{ fontSize: '15.5px', color: hasBanner ? 'rgba(255,255,255,.88)' : 'var(--muted)', lineHeight: 1.6, margin: '16px 0 26px', maxWidth: '460px' }}>
              Clubes, selecciones y retro. Versión fan y player, con nombre y número si quieres. Llega en 14 a 20 días.
            </p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button className="lb-btn" onClick={() => go('catalog')} style={{ background: '#cc1a1a', color: '#fff', border: 'none', borderRadius: '12px', padding: '14px 26px', fontSize: '15px', fontWeight: 700, boxShadow: '0 6px 20px rgba(204,26,26,.35)' }}>Ver camisetas</button>
              <button className="lb-btn" onClick={() => go('retro')} style={{ background: hasBanner ? 'rgba(0,0,0,.35)' : 'none', color: hasBanner ? '#fff' : 'var(--text)', border: hasBanner ? '1px solid rgba(255,255,255,.55)' : '1px solid var(--border2)', borderRadius: '12px', padding: '14px 26px', fontSize: '15px', fontWeight: 700 }}>🕰️ Retro</button>
            </div>
          </div>
          {!hasBanner && <div className="lb-hero-art" style={{ position: 'relative', height: '300px' }}>
            {heroImgs.length > 0 ? heroImgs.map((p, i) => (
              <div key={p.id} onClick={() => onSelectProduct(p)} className="lb-tile" style={{ position: 'absolute', width: '52%', aspectRatio: '3/4', left: ['2%', '26%', '48%'][i], top: ['26px', '0px', '34px'][i], transform: `rotate(${[-7, 2, 8][i]}deg)`, borderRadius: '16px', overflow: 'hidden', border: '3px solid var(--card)', boxShadow: 'var(--shadow)', cursor: 'pointer', zIndex: i === 1 ? 2 : 1 }}>
                <img src={img(p)} alt={p.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )) : (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '110px', opacity: .9 }}>🐺</div>
            )}
          </div>}
        </div>
        {banners.length > 1 && (
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: '12px', display: 'flex', justifyContent: 'center', gap: '6px' }}>
            {banners.map((b, i) => <button key={b.id} aria-label={'Banner ' + (i + 1)} onClick={() => setBannerIdx(i)} style={{ width: i === bannerIdx ? '22px' : '8px', height: '8px', borderRadius: '8px', border: 'none', background: i === bannerIdx ? '#fff' : 'rgba(255,255,255,.5)', padding: 0, transition: 'width .2s' }} />)}
          </div>
        )}
      </section>

      {/* CATEGORÍAS */}
      <SectionHead title="Compra por categoría" sub="Encuentra rápido lo que buscas" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '14px' }}>
        {cats.map(c => (
          <button key={c.key} className="lb-tile" onClick={() => go(...c.to)} style={{ position: 'relative', overflow: 'hidden', textAlign: 'left', aspectRatio: '4/3', borderRadius: '16px', border: '1px solid var(--border)', background: 'var(--card2)', padding: 0 }}>
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
        </>
      )}

      {fotos.length > 0 && (
        <>
          <SectionHead title="Pedidos de nuestros clientes" sub="Camisetas reales, entregadas" onMore={() => go('galeria')} moreLabel="Ver galería →" />
          <GalleryCarousel fotos={fotos} onOpen={() => go('galeria')} />
        </>
      )}

      {look.length > 0 && (
        <>
          <SectionHead title="Lookbook 26/27" sub="Las camisetas de la temporada, puestas" />
          <Lookbook items={look} products={products} onSelectProduct={onSelectProduct} />
        </>
      )}

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
