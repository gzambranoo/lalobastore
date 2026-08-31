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

export default function Catalog({ products, loading, onSelectProduct, favorites, onToggleFav, savedState }) {
  const [search, setSearch] = useState(savedState?.search || '')
  const [tipoCat, setTipoCat] = useState(savedState?.tipoCat || 'all')
  const [versionFilter, setVersionFilter] = useState(savedState?.versionFilter || 'all')
  const [stockFilter, setStockFilter] = useState(savedState?.stockFilter || 'all')
  const [activeTag, setActiveTag] = useState(savedState?.activeTag || '')
  const [sortBy, setSortBy] = useState(savedState?.sortBy || 'name_asc')
  const [showFilters, setShowFilters] = useState(false)
  const restored = useRef(false)

  // Restore scroll once products load
  useEffect(() => {
    if (!loading && savedState?.scrollY && !restored.current) {
      restored.current = true
      setTimeout(() => window.scrollTo(0, savedState.scrollY), 80)
    }
  }, [loading, savedState])

  const allTags = useMemo(() => {
    const tags = new Set()
    products.forEach(p => p.categorias?.forEach(c => tags.add(c)))
    return [...tags].sort()
  }, [products])

  const filtered = useMemo(() => {
    let result = products
    if (tipoCat !== 'all') result = result.filter(p => p.tipo_producto === tipoCat)
    if (versionFilter !== 'all') result = result.filter(p => p.version === versionFilter)
    if (stockFilter === 'stock') result = result.filter(p => p.tallas_stock?.length > 0)
    if (stockFilter === 'pedido') result = result.filter(p => !p.tallas_stock?.length)
    if (activeTag) result = result.filter(p => p.categorias?.includes(activeTag))
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(p =>
        p.nombre?.toLowerCase().includes(q) ||
        p.color?.toLowerCase().includes(q) ||
        p.categorias?.some(c => c.toLowerCase().includes(q))
      )
    }
    if (sortBy === 'price_asc') result = [...result].sort((a, b) => a.precio - b.precio)
    if (sortBy === 'price_desc') result = [...result].sort((a, b) => b.precio - a.precio)
    if (sortBy === 'name_asc') result = [...result].sort((a, b) => a.nombre?.localeCompare(b.nombre))
    if (sortBy === 'recent') result = [...result].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    return result
  }, [products, tipoCat, versionFilter, stockFilter, activeTag, search, sortBy])

  // Save current filter state to parent before navigating
  function handleSelect(p) {
    onSelectProduct(p, { search, tipoCat, versionFilter, stockFilter, activeTag, sortBy, scrollY: window.scrollY })
  }

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
        <button onClick={() => setShowFilters(!showFilters)} style={{ background: showFilters ? '#cc1a1a' : '#141414', border: `1px solid ${showFilters ? '#cc1a1a' : '#1e1e1e'}`, color: showFilters ? '#fff' : '#888', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
          ⚙ Filtros
        </button>
      </div>

      {/* Category tabs */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '12px' }}>
        {TIPO_CATS.map(cat => (
          <button key={cat.key} onClick={() => setTipoCat(cat.key)} style={{ flexShrink: 0, padding: '7px 14px', borderRadius: '20px', border: `1px solid ${tipoCat === cat.key ? '#cc1a1a' : '#2a2a2a'}`, background: tipoCat === cat.key ? '#cc1a1a' : '#141414', color: tipoCat === cat.key ? '#fff' : '#888', fontSize: '13px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Expanded filters */}
      {showFilters && (
        <div style={{ background: '#141414', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '16px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '14px' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#666', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase' }}>Versión</div>
              <div style={{ display: 'flex', gap: '5px' }}>
                {[['all','Todas'],['fan','Fan'],['player','Player']].map(([v,l]) => (
                  <button key={v} onClick={() => setVersionFilter(v)} style={{ padding: '5px 12px', borderRadius: '8px', border: `1px solid ${versionFilter===v?'#cc1a1a':'#2a2a2a'}`, background: versionFilter===v?'#cc1a1a':'#1e1e1e', color: versionFilter===v?'#fff':'#888', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>{l}</button>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#666', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase' }}>Disponibilidad</div>
              <div style={{ display: 'flex', gap: '5px' }}>
                {[['all','Todo'],['stock','En stock'],['pedido','A pedido']].map(([v,l]) => (
                  <button key={v} onClick={() => setStockFilter(v)} style={{ padding: '5px 12px', borderRadius: '8px', border: `1px solid ${stockFilter===v?'#cc1a1a':'#2a2a2a'}`, background: stockFilter===v?'#cc1a1a':'#1e1e1e', color: stockFilter===v?'#fff':'#888', fontSize: '12px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>{l}</button>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#666', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase' }}>Ordenar</div>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ background: '#1e1e1e', border: '1px solid #2a2a2a', borderRadius: '8px', padding: '6px 10px', color: '#ccc', fontSize: '12px', outline: 'none', cursor: 'pointer' }}>
                <option value="name_asc">Nombre A→Z</option>
                <option value="recent">Más recientes</option>
                <option value="price_asc">Precio ↑</option>
                <option value="price_desc">Precio ↓</option>
              </select>
            </div>
          </div>
          {allTags.length > 0 && (
            <div>
              <div style={{ fontSize: '11px', color: '#666', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase' }}>Etiquetas</div>
              <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                <button onClick={() => setActiveTag('')} style={{ padding: '4px 10px', borderRadius: '8px', border: `1px solid ${!activeTag?'#cc1a1a':'#2a2a2a'}`, background: !activeTag?'#cc1a1a':'#1e1e1e', color: !activeTag?'#fff':'#888', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>Todas</button>
                {allTags.map(tag => (
                  <button key={tag} onClick={() => setActiveTag(tag===activeTag?'':tag)} style={{ padding: '4px 10px', borderRadius: '8px', border: `1px solid ${activeTag===tag?'#cc1a1a':'#2a2a2a'}`, background: activeTag===tag?'#cc1a1a':'#1e1e1e', color: activeTag===tag?'#fff':'#888', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>{tag}</button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{ fontSize: '12px', color: '#555', marginBottom: '14px' }}>{filtered.length} producto{filtered.length!==1?'s':''}</div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#444' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🐺</div>
          <div>Cargando catálogo...</div>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#444' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</div>
          <div>Sin resultados</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '14px' }}>
          {filtered.map(p => <ProductCard key={p.id} product={p} onClick={() => handleSelect(p)} isFav={favorites.includes(p.id)} onToggleFav={onToggleFav} />)}
        </div>
      )}
    </div>
  )
}
