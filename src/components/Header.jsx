export default function Header({ page, setPage, cartCount, onCartClick, isAdmin, onBack, showBack, favCount }) {
  const navBtn = (p, label, extra = {}) => (
    <button onClick={() => setPage(p)} style={{
      background: page === p ? '#1a0000' : 'none',
      border: `1px solid ${page === p ? '#cc1a1a' : 'transparent'}`,
      color: page === p ? '#cc1a1a' : '#888',
      borderRadius: '8px', padding: '7px 14px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', ...extra
    }}>{label}</button>
  )

  return (
    <header style={{ background: '#0f0f0f', borderBottom: '1px solid #1e1e1e', position: 'sticky', top: 0, zIndex: 30 }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        {showBack && (
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#cc1a1a', fontSize: '22px', padding: '2px 6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>←</button>
        )}
        <button onClick={() => setPage('catalog')} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'none', border: 'none', cursor: 'pointer' }}>
          <img src="/images/logo.png" alt="La Loba" style={{ width: '30px', height: '30px', objectFit: 'contain' }} />
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '15px', fontWeight: 900, color: '#fff', lineHeight: 1 }}>La <span style={{ color: '#cc1a1a' }}>Loba</span></div>
            <div style={{ fontSize: '9px', color: '#333', letterSpacing: '2px', fontWeight: 700 }}>STORE</div>
          </div>
        </button>

        <nav style={{ display: 'flex', gap: '4px', marginLeft: 'auto', alignItems: 'center', flexWrap: 'wrap' }}>
          {navBtn('catalog', 'Catálogo')}
          {navBtn('info', 'Info')}
          <button onClick={() => setPage('favorites')} style={{
            background: page === 'favorites' ? '#1a0000' : 'none',
            border: `1px solid ${page === 'favorites' ? '#cc1a1a' : 'transparent'}`,
            color: page === 'favorites' ? '#cc1a1a' : '#888',
            borderRadius: '8px', padding: '7px 14px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '5px'
          }}>
            ❤️ Favoritas {favCount > 0 && <span style={{ background: '#cc1a1a', color: '#fff', borderRadius: '10px', padding: '1px 6px', fontSize: '11px' }}>{favCount}</span>}
          </button>
          {isAdmin && navBtn('admin', '⚙️ Admin')}
          <button onClick={onCartClick} style={{
            background: '#1a0000', border: '1px solid #cc1a1a', color: '#fff',
            borderRadius: '8px', padding: '7px 14px', fontSize: '13px', fontWeight: 700,
            display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', marginLeft: '4px'
          }}>
            🛒 {cartCount > 0 && <span style={{ background: '#cc1a1a', borderRadius: '10px', padding: '1px 7px', fontSize: '11px' }}>{cartCount}</span>}
          </button>
        </nav>
      </div>
    </header>
  )
}
