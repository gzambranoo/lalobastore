import { useState } from 'react'

export default function AdminLogin({ onLogin, onClose }) {
  const [pwd, setPwd] = useState('')
  const [error, setError] = useState(false)

  function submit(e) {
    e.preventDefault()
    if (!onLogin(pwd)) { setError(true); setPwd('') }
  }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '16px' }}>
      <form onClick={e => e.stopPropagation()} onSubmit={submit} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '340px' }}>
        <div style={{ fontSize: '18px', fontWeight: 800, marginBottom: '4px', color: 'var(--text)' }}>🔐 Acceso admin</div>
        <div style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '18px' }}>Ingresa la contraseña</div>
        <input autoFocus type="password" value={pwd} onChange={e => { setPwd(e.target.value); setError(false) }} placeholder="Contraseña"
          style={{ width: '100%', background: 'var(--card2)', border: `1px solid ${error ? '#cc1a1a' : 'var(--border2)'}`, borderRadius: '10px', padding: '12px 14px', color: 'var(--text)', fontSize: '15px', outline: 'none', marginBottom: '8px' }} />
        {error && <div style={{ color: '#cc1a1a', fontSize: '12px', marginBottom: '8px' }}>Contraseña incorrecta</div>}
        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
          <button type="submit" style={{ flex: 1, padding: '12px', borderRadius: '10px', background: '#cc1a1a', border: 'none', color: '#fff', fontSize: '14px', fontWeight: 700 }}>Entrar</button>
          <button type="button" onClick={onClose} style={{ padding: '12px 16px', borderRadius: '10px', background: 'none', border: '1px solid var(--border2)', color: 'var(--muted)', fontSize: '14px' }}>Cancelar</button>
        </div>
      </form>
    </div>
  )
}
