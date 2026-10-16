import ProductCard from '../components/ProductCard'

export default function FavoritesPage({ products, onSelectProduct, favorites, onToggleFav }) {
  return (
    <div style={{ paddingTop: '24px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '6px', color: 'var(--text)' }}>❤️ Mis favoritas</h1>
      <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '22px' }}>Las camisetas que te gustaron, guardadas en este dispositivo</p>
      {products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--faint)' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🤍</div>
          <div>Aún no tienes favoritas. Toca el corazón en cualquier camiseta para guardarla.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '14px' }}>
          {products.map(p => <ProductCard key={p.id} product={p} onClick={() => onSelectProduct(p)} isFav={favorites.includes(p.id)} onToggleFav={onToggleFav} />)}
        </div>
      )}
    </div>
  )
}
