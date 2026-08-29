export default function InfoPage({ config }) {
  return (
    <div style={{ paddingTop: '24px', maxWidth: '700px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '6px' }}>Información y precios</h1>
      <p style={{ color: '#666', fontSize: '14px', marginBottom: '28px' }}>Todo lo que necesitas saber antes de hacer tu pedido</p>

      {/* How to buy */}
      <div style={{ background: '#141414', border: '1px solid #1e1e1e', borderRadius: '14px', padding: '20px', marginBottom: '16px' }}>
        <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>🛒 ¿Cómo comprar?</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            ['1', 'Elige tu camiseta del catálogo'],
            ['2', 'Selecciona talla, versión y si quieres estampado'],
            ['3', 'Agrega al carrito — puedes agregar varios productos'],
            ['4', 'Revisa el resumen y coordina el pago y envío por WhatsApp'],
          ].map(([n, t]) => (
            <div key={n} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <span style={{ background: '#cc1a1a', color: '#fff', borderRadius: '50%', width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, flexShrink: 0 }}>{n}</span>
              <span style={{ fontSize: '14px', color: '#ccc', paddingTop: '3px' }}>{t}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stock vs order */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
        <div style={{ background: '#0a1a0a', border: '1px solid #16a34a', borderRadius: '14px', padding: '18px' }}>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#4ade80', marginBottom: '8px' }}>● En stock</div>
          <div style={{ fontSize: '13px', color: '#888', lineHeight: 1.6 }}>Disponible inmediatamente. Se coordina entrega o despacho.</div>
        </div>
        <div style={{ background: '#1a1400', border: '1px solid #f59e0b', borderRadius: '14px', padding: '18px' }}>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#f59e0b', marginBottom: '8px' }}>○ A pedido</div>
          <div style={{ fontSize: '13px', color: '#888', lineHeight: 1.6 }}>Se encarga especialmente para ti. Tiempo estimado: 2-3 semanas.</div>
        </div>
      </div>

      {/* Price table */}
      <div style={{ background: '#141414', border: '1px solid #1e1e1e', borderRadius: '14px', padding: '20px', marginBottom: '16px' }}>
        <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '14px' }}>💰 Cargos adicionales</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <tbody>
            {[
              ['Talla XL, XXL, XXXL', `+$${config.recargo_xl?.toLocaleString('es-CL')}`],
              ['Estampado (nombre + número)', `+$${config.recargo_estampado?.toLocaleString('es-CL')}`],
              ['Versión Player', `+$${config.recargo_player?.toLocaleString('es-CL')}`],
            ].map(([label, value], i) => (
              <tr key={i} style={{ borderBottom: '1px solid #1e1e1e' }}>
                <td style={{ padding: '12px 0', color: '#ccc' }}>{label}</td>
                <td style={{ padding: '12px 0', textAlign: 'right', color: '#cc1a1a', fontWeight: 700 }}>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Versions */}
      <div style={{ background: '#141414', border: '1px solid #1e1e1e', borderRadius: '14px', padding: '20px', marginBottom: '16px' }}>
        <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '14px' }}>👕 Versiones</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ padding: '12px', background: '#1e1e1e', borderRadius: '10px' }}>
            <div style={{ fontWeight: 700, marginBottom: '4px', color: '#ccc' }}>Fan Version</div>
            <div style={{ fontSize: '13px', color: '#666' }}>Camiseta réplica de alta calidad. Ideal para usar el día a día y en el estadio.</div>
          </div>
          <div style={{ padding: '12px', background: '#1a0a2a', border: '1px solid #7c3aed', borderRadius: '10px' }}>
            <div style={{ fontWeight: 700, marginBottom: '4px', color: '#a78bfa' }}>Player Version ⚡</div>
            <div style={{ fontSize: '13px', color: '#888' }}>Misma tela y corte que usan los jugadores en cancha. Material premium, ajuste atlético.</div>
          </div>
        </div>
      </div>

      {/* Contact */}
      <div style={{ background: '#1a0000', border: '1px solid #2a0a0a', borderRadius: '14px', padding: '20px' }}>
        <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>📲 Contacto</div>
        <div style={{ fontSize: '14px', color: '#888', lineHeight: 1.7 }}>
          Para coordinar pago y despacho, contáctanos por WhatsApp una vez que tengas tu carrito listo.
        </div>
      </div>
    </div>
  )
}
