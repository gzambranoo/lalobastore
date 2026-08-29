import ProductCard from '../components/ProductCard'

export default function FavoritesPage({ products, onSelectProduct, favorites, onToggleFav }) {
  return (
    <div style={{ paddingTop: '24px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 800 }}>❤️ Mis favoritas</h1>
        <p style={{ color: '#555', fontSize: '13px', marginTop: '4px' }}>{products.length} camiseta{products.length !== 1 ? 's' : ''} guardada{products.length !== 1 ? 's' : ''}</p>
      </div>
      {products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#444' }}>
          <div style={{ fontSize: '56px', marginBottom: '14px' }}>🤍</div>
          <div style={{ fontSize: '16px', marginBottom: '8px' }}>No tienes favoritas aún</div>
          <div style={{ fontSize: '13px', color: '#333' }}>Toca el corazón en cualquier camiseta para guardarla aquí</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '14px' }}>
          {products.map(p => (
            <ProductCard key={p.id} product={p} onClick={() => onSelectProduct(p)} isFav={favorites.includes(p.id)} onToggleFav={onToggleFav} />
          ))}
        </div>
      )}
    </div>
  )
}
