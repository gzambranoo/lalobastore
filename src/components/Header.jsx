const TABS = [
  ['home', 'Inicio'],
  ['catalog', 'Camisetas'],
  ['clubs', 'Clubes'],
  ['selecciones', 'Selecciones'],
  ['retro', 'Retro'],
  ['galeria', 'Galería'],
  ['info', 'Info'],
]

const iconBtn = { position: 'relative', background: 'none', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '10px', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', cursor: 'pointer' }
const badge = { position: 'absolute', top: '-5px', right: '-5px', background: '#cc1a1a', color: '#fff', borderRadius: '10px', minWidth: '17px', height: '17px', padding: '0 4px', fontSize: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }

export default function Header({ page, setPage, cartCount, onCartClick, isAdmin, onBack, showBack, favCount, theme, onToggleTheme }) {
  return (
    <header style={{ background: 'var(--header)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 30 }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        {showBack && (
          <button onClick={onBack} aria-label="Volver" style={{ ...iconBtn, color: '#cc1a1a', fontSize: '20px' }}>←</button>
        )}
        <button onClick={() => setPage('home')} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'none', border: 'none', cursor: 'pointer' }}>
          <img src="/images/logo.png" alt="La Loba" style={{ width: '34px', height: '34px', objectFit: 'contain' }} />
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '17px', fontWeight: 900, color: 'var(--text)', lineHeight: 1, letterSpacing: '-.3px' }}>La <span style={{ color: '#cc1a1a' }}>Loba</span></div>
            <div style={{ fontSize: '9px', color: 'var(--faint)', letterSpacing: '3px', fontWeight: 700, marginTop: '2px' }}>STORE</div>
          </div>
        </button>

        <nav className="lb-tabs lb-hide-sm" style={{ marginLeft: '18px', flex: 1 }}>
          {TABS.map(([id, label]) => (
            <button key={id} className={'lb-tab' + (page === id ? ' active' : '')} onClick={() => setPage(id)}>{label}</button>
          ))}
        </nav>

        <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto', alignItems: 'center' }}>
          {isAdmin && <button onClick={() => setPage('admin')} title="Admin" style={{ ...iconBtn, width: 'auto', padding: '0 12px', fontSize: '13px', fontWeight: 600, color: '#cc1a1a', borderColor: page === 'admin' ? '#cc1a1a' : 'var(--border)' }}>⚙️ Admin</button>}
          <button onClick={onToggleTheme} aria-label="Cambiar tema" title={theme === 'dark' ? 'Tema claro' : 'Tema oscuro'} style={iconBtn}>{theme === 'dark' ? '☀️' : '🌙'}</button>
          <button onClick={() => setPage('favorites')} aria-label="Favoritas" title="Favoritas" style={{ ...iconBtn, borderColor: page === 'favorites' ? '#cc1a1a' : 'var(--border)' }}>
            ❤️{favCount > 0 && <span style={badge}>{favCount}</span>}
          </button>
          <button onClick={onCartClick} aria-label="Carrito" title="Carrito" style={{ ...iconBtn, background: '#cc1a1a', borderColor: '#cc1a1a', color: '#fff' }}>
            🛒{cartCount > 0 && <span style={{ ...badge, background: 'var(--text)', color: 'var(--bg)' }}>{cartCount}</span>}
          </button>
        </div>
      </div>

      {/* Pestañas en móvil */}
      <nav className="lb-tabs" style={{ padding: '0 8px', borderTop: '1px solid var(--border)', display: 'none' }} id="lb-mobile-tabs">
        {TABS.map(([id, label]) => (
          <button key={id} className={'lb-tab' + (page === id ? ' active' : '')} onClick={() => setPage(id)}>{label}</button>
        ))}
      </nav>
      <style>{`@media (max-width:640px){ #lb-mobile-tabs{display:flex !important} }`}</style>
    </header>
  )
}
