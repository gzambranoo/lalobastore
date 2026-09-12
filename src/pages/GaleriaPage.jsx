import { useState, useEffect } from 'react'
import { supabase, STORAGE_URL } from '../lib/supabase'

export default function GaleriaPage() {
  const [fotos, setFotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  useEffect(() => { loadFotos() }, [])

  async function loadFotos() {
    setLoading(true)
    const { data } = await supabase.from('galeria').select('*').order('created_at', { ascending: false })
    if (data) setFotos(data)
    setLoading(false)
  }

  return (
    <div style={{ paddingTop: '24px', maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '6px' }}>📸 Galería</h1>
      <p style={{ color: '#666', fontSize: '14px', marginBottom: '24px' }}>Fotos reales de camisetas entregadas a nuestros clientes</p>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#444' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🐺</div>
          <div>Cargando galería...</div>
        </div>
      ) : fotos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#444' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📷</div>
          <div>Próximamente fotos de pedidos reales</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
          {fotos.map(foto => (
            <div key={foto.id} onClick={() => setSelected(foto)}
              style={{ borderRadius: '10px', overflow: 'hidden', cursor: 'pointer', aspectRatio: '1', background: '#141414', border: '1px solid #1e1e1e', position: 'relative' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#cc1a1a'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#1e1e1e'}>
              <img src={STORAGE_URL + foto.imagen} alt={foto.descripcion || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              {foto.descripcion && (
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,.8))', padding: '20px 10px 8px', fontSize: '11px', color: '#ccc' }}>
                  {foto.descripcion}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {selected && (
        <div onClick={() => setSelected(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.95)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', width: '100%' }}>
            <img src={STORAGE_URL + selected.imagen} alt="" style={{ width: '100%', borderRadius: '12px', maxHeight: '80vh', objectFit: 'contain' }} />
            {selected.descripcion && <div style={{ textAlign: 'center', color: '#ccc', fontSize: '14px', marginTop: '12px' }}>{selected.descripcion}</div>}
            <button onClick={() => setSelected(null)} style={{ display: 'block', margin: '16px auto 0', padding: '10px 24px', borderRadius: '8px', background: '#1e1e1e', border: '1px solid #2a2a2a', color: '#888', fontSize: '14px', cursor: 'pointer' }}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  )
}
