import { useState, useEffect } from 'react'
import { supabase, ADMIN_PASSWORD } from './lib/supabase'
import Header from './components/Header'
import Catalog from './pages/Catalog'
import ProductPage from './pages/ProductPage'
import Cart from './components/Cart'
import InfoPage from './pages/InfoPage'
import AdminPanel from './pages/AdminPanel'
import AdminLogin from './components/AdminLogin'

export default function App() {
  const [products, setProducts] = useState([])
  const [config, setConfig] = useState({ recargo_xl: 2000, recargo_estampado: 3000, recargo_player: 10000 })
  const [cart, setCart] = useState([])
  const [page, setPage] = useState('catalog') // catalog | product | info | admin
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showCart, setShowCart] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [loading, setLoading] = useState(true)

  // Check if admin URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('admin') === 'true') setShowAdminLogin(true)
  }, [])

  useEffect(() => { loadProducts(); loadConfig() }, [])

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

  function openProduct(product) {
    setSelectedProduct(product)
    setPage('product')
    window.scrollTo(0, 0)
  }

  function addToCart(item) {
    setCart(prev => [...prev, { ...item, cartId: Date.now() }])
  }

  function removeFromCart(cartId) {
    setCart(prev => prev.filter(i => i.cartId !== cartId))
  }

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

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a' }}>
      <Header
        page={page}
        setPage={setPage}
        cartCount={cartCount}
        onCartClick={() => setShowCart(true)}
        isAdmin={isAdmin}
        onBack={() => setPage('catalog')}
      />

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px 100px' }}>
        {page === 'catalog' && (
          <Catalog
            products={products}
            loading={loading}
            onSelectProduct={openProduct}
            config={config}
          />
        )}
        {page === 'product' && selectedProduct && (
          <ProductPage
            product={selectedProduct}
            products={products}
            config={config}
            onAddToCart={addToCart}
            onSelectProduct={openProduct}
            onBack={() => setPage('catalog')}
          />
        )}
        {page === 'info' && <InfoPage config={config} isAdmin={isAdmin} />}
        {page === 'admin' && isAdmin && (
          <AdminPanel
            products={products}
            config={config}
            setConfig={setConfig}
            reloadProducts={loadProducts}
          />
        )}
      </main>

      {showCart && (
        <Cart
          cart={cart}
          removeFromCart={removeFromCart}
          onClose={() => setShowCart(false)}
          config={config}
          products={products}
        />
      )}

      {showAdminLogin && !isAdmin && (
        <AdminLogin
          onLogin={handleAdminLogin}
          onClose={() => {
            setShowAdminLogin(false)
            window.history.replaceState({}, '', window.location.pathname)
          }}
        />
      )}

      {/* Floating cart button */}
      {cartCount > 0 && !showCart && (
        <button
          onClick={() => setShowCart(true)}
          style={{
            position: 'fixed', bottom: '24px', right: '20px',
            background: '#cc1a1a', border: 'none', borderRadius: '50px',
            padding: '12px 20px', color: '#fff', fontSize: '14px', fontWeight: 700,
            display: 'flex', alignItems: 'center', gap: '8px',
            boxShadow: '0 4px 20px rgba(204,26,26,.5)', zIndex: 40
          }}
        >
          🛒 <span style={{ background: 'rgba(255,255,255,.25)', borderRadius: '20px', padding: '2px 8px', fontSize: '13px' }}>{cartCount}</span>
        </button>
      )}
    </div>
  )
}
