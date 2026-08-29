import { useState } from 'react'
export default function AdminLogin({ onLogin, onClose }) {
  const [pwd, setPwd] = useState('')
  const [error, setError] = useState('')
  function handleSubmit() {
    const ok = onLogin(pwd)
    if (!ok) setError('Contraseña incorrecta')
  }
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.92)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: '#161616', borderRadius: '16px', padding: '28px 24px', width: '100%', maxWidth: '340px', border: '1px solid #2a0a0a' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔐</div>
          <div style={{ fontSize: '18px', fontWeight: 700 }}>Panel Admin</div>
          <div style={{ fontSize: '13px', color: '#555', marginTop: '4px' }}>La Loba Store</div>
        </div>
        <input type="password" placeholder="Contraseña" value={pwd} onChange={e => { setPwd(e.target.value); setError('') }} onKeyDown={e => e.key === 'Enter' && handleSubmit()} autoFocus
          style={{ width: '100%', background: '#1e1e1e', border: `1px solid ${error ? '#cc1a1a' : '#2a2a2a'}`, borderRadius: '10px', padding: '12px', color: '#fff', fontSize: '15px', outline: 'none', marginBottom: '8px' }} />
        {error && <div style={{ color: '#cc1a1a', fontSize: '12px', marginBottom: '8px' }}>{error}</div>}
        <button onClick={handleSubmit} style={{ width: '100%', padding: '13px', borderRadius: '10px', background: '#cc1a1a', border: 'none', color: '#fff', fontSize: '15px', fontWeight: 700, marginBottom: '10px' }}>Entrar</button>
        <button onClick={onClose} style={{ width: '100%', padding: '10px', borderRadius: '10px', background: 'none', border: '1px solid #2a2a2a', color: '#666', fontSize: '14px' }}>Cancelar</button>
      </div>
    </div>
  )
}
