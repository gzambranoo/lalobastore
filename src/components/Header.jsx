export default function Header({ page, setPage, cartCount, onCartClick, isAdmin, onBack }) {
  return (
    <header style={{ background: '#0f0f0f', borderBottom: '1px solid #1e1e1e', position: 'sticky', top: 0, zIndex: 30 }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        {page !== 'catalog' && (
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#cc1a1a', fontSize: '20px', padding: '4px', display: 'flex', alignItems: 'center' }}>←</button>
        )}
        <button onClick={() => setPage('catalog')} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'none', border: 'none' }}>
          <img src="/images/logo.png" alt="La Loba" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '16px', fontWeight: 900, color: '#fff', letterSpacing: '-.3px', lineHeight: 1 }}>
              La <span style={{ color: '#cc1a1a' }}>Loba</span>
            </div>
            <div style={{ fontSize: '9px', color: '#333', letterSpacing: '2.5px', fontWeight: 700 }}>STORE</div>
          </div>
        </button>

        <nav style={{ display: 'flex', gap: '4px', marginLeft: 'auto', alignItems: 'center' }}>
          <button onClick={() => setPage('catalog')} style={{ background: page === 'catalog' ? '#1a0000' : 'none', border: `1px solid ${page === 'catalog' ? '#cc1a1a' : 'transparent'}`, color: page === 'catalog' ? '#cc1a1a' : '#888', borderRadius: '8px', padding: '7px 14px', fontSize: '13px', fontWeight: 600 }}>
            Catálogo
          </button>
          <button onClick={() => setPage('info')} style={{ background: page === 'info' ? '#1a0000' : 'none', border: `1px solid ${page === 'info' ? '#cc1a1a' : 'transparent'}`, color: page === 'info' ? '#cc1a1a' : '#888', borderRadius: '8px', padding: '7px 14px', fontSize: '13px', fontWeight: 600 }}>
            Info
          </button>
          {isAdmin && (
            <button onClick={() => setPage('admin')} style={{ background: page === 'admin' ? '#1a0000' : 'none', border: `1px solid ${page === 'admin' ? '#cc1a1a' : '#2a0a0a'}`, color: '#cc1a1a', borderRadius: '8px', padding: '7px 14px', fontSize: '13px', fontWeight: 600 }}>
              Admin
            </button>
          )}
          <button onClick={onCartClick} style={{ background: '#1a0000', border: '1px solid #cc1a1a', color: '#fff', borderRadius: '8px', padding: '7px 14px', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '4px' }}>
            🛒{cartCount > 0 && <span style={{ background: '#cc1a1a', borderRadius: '10px', padding: '1px 7px', fontSize: '11px' }}>{cartCount}</span>}
          </button>
        </nav>
      </div>
    </header>
  )
}
