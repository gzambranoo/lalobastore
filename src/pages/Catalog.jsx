import { useState, useMemo, useEffect, useRef } from 'react'
import ProductCard from '../components/ProductCard'

const TIPO_CATS = [
  { key: 'all', label: 'Todo' },
  { key: 'camiseta', label: '👕 Camisetas' },
  { key: 'short', label: '🩳 Shorts' },
  { key: 'cortavientos', label: '🧥 Cortavientos' },
  { key: 'entrenamiento', label: '⚽ Entrenamiento' },
  { key: 'ropa', label: '👔 Ropa' },
]

const LIGAS_EUROPA = ['Premier League','La Liga','LaLiga','Serie A','Bundesliga','Ligue 1','Champions']
const LIGAS_SUD = ['Liga Chilena','Liga Argentina','Brasileirao']

export default function Catalog({ products, loading, onSelectProduct, favorites, onToggleFav, savedState }) {
  const [search, setSearch] = useState(savedState?.search || '')
  const [tipoCat, setTipoCat] = useState(savedState?.tipoCat || 'all')
  const [version, setVersion] = useState(savedState?.version || 'all')
  const [stock, setStock] = useState(savedState?.stock || 'all')
  const [retro, setRetro] = useState(savedState?.retro || false)
  const [clubSel, setClubSel] = useState(savedState?.clubSel || '') // 'club' | 'seleccion' | ''
  const [liga, setLiga] = useState(savedState?.liga || '')
  const [regionSel, setRegionSel] = useState(savedState?.regionSel || '')
  const [equipo, setEquipo] = useState(savedState?.equipo || '')
  const [sortBy, setSortBy] = useState(savedState?.sortBy || 'name_asc')
  const [showFilters, setShowFilters] = useState(false)
  const restored = useRef(false)

  useEffect(() => {
    if (!loading && savedState?.scrollY && !restored.current) {
      restored.current = true
      setTimeout(() => window.scrollTo(0, savedState.scrollY), 80)
    }
  }, [loading, savedState])

  // Get available teams for selected liga
  // Normalize liga name for matching (handle LaLiga vs La Liga)
  const normalizeLiga = (l) => l.replace(/\s/g,'').toLowerCase()
  
  const META_TAGS = new Set(['Club','Selección','Seleccion','Retro','Premier League','La Liga','LaLiga','Serie A','Bundesliga','Ligue 1','Champions','Liga Chilena','Liga Argentina','Brasileirao','Europa','Sudamérica','Sudamerica','Mundo'])

  const equiposDisponibles = useMemo(() => {
    if (!liga) return []
    const teams = new Set()
    const ligaNorm = normalizeLiga(liga)
    products.forEach(p => {
      const matchesLiga = p.categorias?.some(cat => normalizeLiga(cat) === ligaNorm)
      if (matchesLiga) {
        p.categorias.forEach(cat => {
          if (!META_TAGS.has(cat)) teams.add(cat)
        })
      }
    })
    return [...teams].sort()
  }, [products, liga])

  // Reset child filters when parent changes
  function setClubSelReset(val) { setClubSel(val); setLiga(''); setRegionSel(''); setEquipo('') }
  function setLigaReset(val) { setLiga(val); setEquipo('') }

  // Countries available for selecciones (filtered by region if selected)
  const paisesDisponibles = useMemo(() => {
    const paises = new Set()
    products.forEach(p => {
      const isSel = p.categorias?.includes('Selección') || p.categorias?.includes('Seleccion')
      if (!isSel) return
      if (regionSel && p.region !== regionSel) return
      p.categorias.forEach(cat => {
        if (!META_TAGS.has(cat)) paises.add(cat)
      })
    })
    return [...paises].sort()
  }, [products, regionSel])

  const filtered = useMemo(() => {
    let result = products

    if (tipoCat !== 'all') result = result.filter(p => p.tipo_producto === tipoCat)
    if (version !== 'all') result = result.filter(p => p.version === version)
    if (stock === 'stock') result = result.filter(p => p.tallas_stock?.length > 0)
    if (stock === 'pedido') result = result.filter(p => !p.tallas_stock?.length)
    if (retro) result = result.filter(p => p.retro)

    if (clubSel === 'club') {
      result = result.filter(p => p.categorias?.includes('Club'))
      if (liga) result = result.filter(p => p.categorias?.some(cat => normalizeLiga(cat) === normalizeLiga(liga)))
      if (equipo) result = result.filter(p => p.categorias?.includes(equipo))
    }
    if (clubSel === 'seleccion') {
      result = result.filter(p => p.categorias?.includes('Selección') || p.categorias?.includes('Seleccion'))
      if (regionSel) result = result.filter(p => p.region === regionSel)
      if (equipo) result = result.filter(p => p.categorias?.includes(equipo))
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(p =>
        p.nombre?.toLowerCase().includes(q) ||
        p.color?.toLowerCase().includes(q) ||
        p.categorias?.some(c => c.toLowerCase().includes(q))
      )
    }

    if (sortBy === 'price_asc') result = [...result].sort((a, b) => a.precio - b.precio)
    else if (sortBy === 'price_desc') result = [...result].sort((a, b) => b.precio - a.precio)
    else if (sortBy === 'name_asc') result = [...result].sort((a, b) => a.nombre?.localeCompare(b.nombre))
    else if (sortBy === 'recent') result = [...result].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

    return result
  }, [products, tipoCat, version, stock, retro, clubSel, liga, equipo, regionSel, search, sortBy])

  function handleSelect(p) {
    onSelectProduct(p, { search, tipoCat, version, stock, retro, clubSel, liga, equipo, regionSel, sortBy, scrollY: window.scrollY })
  }

  const hasFilters = tipoCat !== 'all' || version !== 'all' || stock !== 'all' || retro || clubSel || liga || equipo || regionSel || search
  const pill = (label, active, onClick, extra = {}) => (
    <button onClick={onClick} style={{ flexShrink: 0, padding: '6px 14px', borderRadius: '20px', border: `1px solid ${active ? '#cc1a1a' : '#2a2a2a'}`, background: active ? '#cc1a1a' : '#141414', color: active ? '#fff' : '#888', fontSize: '12px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', ...extra }}>
      {label}
    </button>
  )
  const sectionTitle = (t) => <div style={{ fontSize: '10px', color: '#555', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', margin: '12px 0 6px' }}>{t}</div>

  return (
    <div style={{ paddingTop: '20px' }}>
      {/* Search */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: '#141414', border: '1px solid #1e1e1e', borderRadius: '10px', padding: '10px 14px', gap: '8px' }}>
          <span style={{ color: '#444', fontSize: '16px' }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre, equipo, país..."
            style={{ background: 'none', border: 'none', outline: 'none', color: '#fff', fontSize: '14px', flex: 1 }} />
          {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: '#555', fontSize: '18px', cursor: 'pointer' }}>×</button>}
        </div>
        <button onClick={() => setShowFilters(!showFilters)} style={{ background: showFilters || hasFilters ? '#cc1a1a' : '#141414', border: `1px solid ${showFilters || hasFilters ? '#cc1a1a' : '#1e1e1e'}`, color: '#fff', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', position: 'relative' }}>
          ⚙ Filtros {hasFilters && <span style={{ background: 'rgba(255,255,255,.3)', borderRadius: '10px', padding: '1px 6px', fontSize: '10px', marginLeft: '4px' }}>ON</span>}
        </button>
      </div>

      {/* Category tabs */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '12px' }}>
        {TIPO_CATS.map(cat => pill(cat.label, tipoCat === cat.key, () => setTipoCat(cat.key)))}
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div style={{ background: '#141414', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '16px', marginBottom: '14px' }}>

          {/* Row 1: Version + Stock + Retro + Sort */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div>
              {sectionTitle('Versión')}
              <div style={{ display: 'flex', gap: '5px' }}>
                {[['all','Todas'],['fan','Fan'],['player','Player']].map(([v,l]) => pill(l, version===v, () => setVersion(v)))}
              </div>
            </div>
            <div>
              {sectionTitle('Disponibilidad')}
              <div style={{ display: 'flex', gap: '5px' }}>
                {[['all','Todo'],['stock','En stock'],['pedido','A pedido']].map(([v,l]) => pill(l, stock===v, () => setStock(v)))}
              </div>
            </div>
            <div>
              {sectionTitle('Retro')}
              <button onClick={() => setRetro(!retro)} style={{ padding: '6px 14px', borderRadius: '20px', border: `1px solid ${retro ? '#f59e0b' : '#2a2a2a'}`, background: retro ? '#2a1500' : '#141414', color: retro ? '#f59e0b' : '#888', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                🕰️ {retro ? 'Solo retro' : 'Retro'}
              </button>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              {sectionTitle('Ordenar')}
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ background: '#1e1e1e', border: '1px solid #2a2a2a', borderRadius: '8px', padding: '6px 10px', color: '#ccc', fontSize: '12px', outline: 'none', cursor: 'pointer' }}>
                <option value="name_asc">Nombre A→Z</option>
                <option value="recent">Más recientes</option>
                <option value="price_asc">Precio ↑</option>
                <option value="price_desc">Precio ↓</option>
              </select>
            </div>
          </div>

          {/* Divider */}
          <div style={{ borderTop: '1px solid #1e1e1e', margin: '14px 0' }} />

          {/* Club / Selección */}
          {sectionTitle('Categoría')}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
            {pill('Todos', !clubSel, () => setClubSelReset(''))}
            {pill('⚽ Clubes', clubSel==='club', () => setClubSelReset('club'))}
            {pill('🌍 Selecciones', clubSel==='seleccion', () => setClubSelReset('seleccion'))}
          </div>

          {/* Clubes — ligas */}
          {clubSel === 'club' && (
            <>
              {sectionTitle('Liga')}
              <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '10px' }}>
                {pill('Todas', !liga, () => setLigaReset(''))}
                {sectionTitle('Europa')}
                {LIGAS_EUROPA.filter((l,i,a) => normalizeLiga(l) !== normalizeLiga(a[i-1]||'')).map(l => pill(l === 'LaLiga' ? 'La Liga' : l, normalizeLiga(liga)===normalizeLiga(l), () => setLigaReset(l)))}
                {sectionTitle('Sudamérica')}
                {LIGAS_SUD.map(l => pill(l, liga===l, () => setLigaReset(l)))}
              </div>

              {/* Equipo — solo si hay liga */}
              {liga && equiposDisponibles.length > 0 && (
                <>
                  {sectionTitle('Equipo')}
                  <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                    {pill('Todos', !equipo, () => setEquipo(''))}
                    {equiposDisponibles.map(e => pill(e, equipo===e, () => setEquipo(equipo===e?'':e)))}
                  </div>
                </>
              )}
            </>
          )}

          {/* Selecciones — región + país */}
          {clubSel === 'seleccion' && (
            <>
              {sectionTitle('Región')}
              <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '10px' }}>
                {pill('Todas', !regionSel, () => { setRegionSel(''); setEquipo('') })}
                {pill('Europa', regionSel==='europa', () => { setRegionSel(regionSel==='europa'?'':'europa'); setEquipo('') })}
                {pill('Sudamérica', regionSel==='sudamerica', () => { setRegionSel(regionSel==='sudamerica'?'':'sudamerica'); setEquipo('') })}
                {pill('Resto del mundo', regionSel==='mundo', () => { setRegionSel(regionSel==='mundo'?'':'mundo'); setEquipo('') })}
              </div>
              {paisesDisponibles.length > 0 && (
                <>
                  {sectionTitle('País')}
                  <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                    {pill('Todos', !equipo, () => setEquipo(''))}
                    {paisesDisponibles.map(p => pill(p, equipo===p, () => setEquipo(equipo===p?'':p)))}
                  </div>
                </>
              )}
            </>
          )}

          {/* Clear filters */}
          {hasFilters && (
            <div style={{ marginTop: '14px', borderTop: '1px solid #1e1e1e', paddingTop: '12px' }}>
              <button onClick={() => { setTipoCat('all'); setVersion('all'); setStock('all'); setRetro(false); setClubSelReset(''); setSearch(''); setSortBy('name_asc') }}
                style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid #2a2a2a', background: 'none', color: '#888', fontSize: '12px', cursor: 'pointer' }}>
                ✕ Limpiar filtros
              </button>
            </div>
          )}
        </div>
      )}

      <div style={{ fontSize: '12px', color: '#555', marginBottom: '14px' }}>
        {filtered.length} producto{filtered.length!==1?'s':''}
        {hasFilters && <span style={{ color: '#cc1a1a', marginLeft: '6px' }}>· filtrado</span>}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#444' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🐺</div>
          <div>Cargando catálogo...</div>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#444' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</div>
          <div>Sin resultados</div>
          {hasFilters && <button onClick={() => { setTipoCat('all'); setVersion('all'); setStock('all'); setRetro(false); setClubSelReset(''); setSearch('') }} style={{ marginTop: '12px', padding: '8px 16px', borderRadius: '8px', border: '1px solid #cc1a1a', background: 'none', color: '#cc1a1a', fontSize: '13px', cursor: 'pointer' }}>Limpiar filtros</button>}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '14px' }}>
          {filtered.map(p => <ProductCard key={p.id} product={p} onClick={() => handleSelect(p)} isFav={favorites.includes(p.id)} onToggleFav={onToggleFav} />)}
        </div>
      )}
    </div>
  )
}
