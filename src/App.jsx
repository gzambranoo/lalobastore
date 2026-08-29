import { useState, useEffect } from 'react'
import { supabase, ADMIN_PASSWORD } from './lib/supabase'
import Header from './components/Header'
import Catalog from './pages/Catalog'
import ProductPage from './pages/ProductPage'
import Cart from './components/Cart'
import InfoPage from './pages/InfoPage'
import AdminPanel from './pages/AdminPanel'
import AdminLogin from './components/AdminLogin'
import FavoritesPage from './pages/FavoritesPage'

export default function App() {
  const [products, setProducts] = useState([])
  const [config, setConfig] = useState({ recargo_xl: 2000, recargo_estampado: 3000, recargo_player: 10000 })
  const [cart, setCart] = useState([])
  const [page, setPage] = useState('catalog')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [productHistory, setProductHistory] = useState([])
  const [showCart, setShowCart] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem('laloba_favs') || '[]') } catch { return [] }
  })

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('admin') === 'true') setShowAdminLogin(true)
  }, [])

  useEffect(() => { loadProducts(); loadConfig() }, [])

  useEffect(() => {
    localStorage.setItem('laloba_favs', JSON.stringify(favorites))
  }, [favorites])

  async function loadProducts() {
    setLoading(true)
    const { data } = await supabase.from('camisetas').select('*').order('created_at', { ascending: false })
    if (data) setProducts(data)
    setLoading(false)
  }

  async function loadConfig() {
    const { data } = await supabase.from('configuracion').select('*').eq('id', 1).single()
    if (data) setConfig(data)
  }

  function toggleFav(productId) {
    setFavorites(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    )
  }

  function openProduct(product, fromProduct = false) {
    if (fromProduct && selectedProduct) {
      setProductHistory(h => [...h, selectedProduct])
    } else {
      setProductHistory([])
    }
    setSelectedProduct(product)
    setPage('product')
    window.scrollTo(0, 0)
  }

  function goBack() {
    if (productHistory.length > 0) {
      const prev = productHistory[productHistory.length - 1]
      setProductHistory(h => h.slice(0, -1))
      setSelectedProduct(prev)
      window.scrollTo(0, 0)
    } else {
      setPage('catalog')
      setSelectedProduct(null)
    }
  }

  function addToCart(item) {
    setCart(prev => [...prev, { ...item, cartId: Date.now() }])
  }

  function removeFromCart(cartId) {
    setCart(prev => prev.filter(i => i.cartId !== cartId))
  }

  function clearCart() { setCart([]) }

  function handleAdminLogin(pwd) {
    if (pwd === ADMIN_PASSWORD) {
      setIsAdmin(true)
      setShowAdminLogin(false)
      setPage('admin')
      return true
    }
    return false
  }

  const cartCount = cart.length
  const favProducts = products.filter(p => favorites.includes(p.id))

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a' }}>
      <Header
        page={page} setPage={p => { setPage(p); setSelectedProduct(null); setProductHistory([]) }}
        cartCount={cartCount} onCartClick={() => setShowCart(true)}
        isAdmin={isAdmin} onBack={goBack}
        showBack={page === 'product'}
        favCount={favorites.length}
      />

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px 100px' }}>
        {page === 'catalog' && <Catalog products={products} loading={loading} onSelectProduct={p => openProduct(p)} favorites={favorites} onToggleFav={toggleFav} config={config} />}
        {page === 'product' && selectedProduct && <ProductPage product={selectedProduct} products={products} config={config} onAddToCart={addToCart} onSelectProduct={p => openProduct(p, true)} onBack={goBack} favorites={favorites} onToggleFav={toggleFav} />}
        {page === 'info' && <InfoPage config={config} />}
        {page === 'favorites' && <FavoritesPage products={favProducts} onSelectProduct={p => openProduct(p)} favorites={favorites} onToggleFav={toggleFav} />}
        {page === 'admin' && isAdmin && <AdminPanel products={products} config={config} setConfig={setConfig} reloadProducts={loadProducts} />}
      </main>

      {showCart && <Cart cart={cart} removeFromCart={removeFromCart} onClose={() => setShowCart(false)} config={config} clearCart={clearCart} />}

      {showAdminLogin && !isAdmin && <AdminLogin onLogin={handleAdminLogin} onClose={() => { setShowAdminLogin(false); window.history.replaceState({}, '', window.location.pathname) }} />}

      {cartCount > 0 && !showCart && (
        <button onClick={() => setShowCart(true)} style={{ position: 'fixed', bottom: '24px', right: '20px', background: '#cc1a1a', border: 'none', borderRadius: '50px', padding: '12px 20px', color: '#fff', fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 20px rgba(204,26,26,.5)', zIndex: 40 }}>
          🛒 <span style={{ background: 'rgba(255,255,255,.25)', borderRadius: '20px', padding: '2px 8px', fontSize: '13px' }}>{cartCount}</span>
        </button>
      )}
    </div>
  )
}
