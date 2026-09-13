export default function InfoPage({ config }) {
  const prices = [
    { label: 'Camiseta Fan', price: 19990 },
    { label: 'Camiseta Retro', price: 22990 },
    { label: 'Camiseta Fan Manga Larga', price: 24990 },
    { label: 'Camiseta Player Version', price: 27990 },
    { label: 'Camiseta Player Version Manga Larga', price: 34990 },
    { label: 'Cortavientos', price: 44990 },
    { label: 'Short Fan', price: 13990 },
    { label: 'Short Player Version', price: 17990 },
  ]

  return (
    <div style={{ paddingTop: '24px', maxWidth: '700px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '6px' }}>Información y precios</h1>
      <p style={{ color: '#666', fontSize: '14px', marginBottom: '28px' }}>Todo lo que necesitas saber antes de hacer tu pedido</p>

      <div style={{ background: '#141414', border: '1px solid #1e1e1e', borderRadius: '14px', padding: '20px', marginBottom: '16px' }}>
        <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>💰 Lista de precios</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <tbody>
            {prices.map(({ label, price }, i) => (
              <tr key={i} style={{ borderBottom: i < prices.length - 1 ? '1px solid #1e1e1e' : 'none' }}>
                <td style={{ padding: '11px 0', color: '#ccc' }}>{label}</td>
                <td style={{ padding: '11px 0', textAlign: 'right', color: '#cc1a1a', fontWeight: 700, whiteSpace: 'nowrap' }}>${price.toLocaleString('es-CL')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ borderTop: '1px solid #1e1e1e', marginTop: '12px', paddingTop: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
            <span style={{ color: '#888' }}>Estampado (nombre + número)</span>
            <span style={{ color: '#f59e0b', fontWeight: 700 }}>+${config.recargo_estampado?.toLocaleString('es-CL')}</span>
          </div>
        </div>
      </div>

      <div style={{ background: '#1a1400', border: '1px solid #854d0e', borderRadius: '14px', padding: '20px', marginBottom: '16px' }}>
        <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '10px' }}>📦 Tiempo de entrega</div>
        <div style={{ fontSize: '28px', fontWeight: 900, color: '#f59e0b', marginBottom: '6px' }}>14 — 20 días</div>
        <div style={{ fontSize: '13px', color: '#888', lineHeight: 1.6 }}>Una vez confirmado y pagado el pedido, el tiempo estimado de llegada es de 14 a 20 días hábiles.</div>
      </div>

      <div style={{ background: '#1a0a0a', border: '1px solid #7f1d1d', borderRadius: '14px', padding: '20px', marginBottom: '16px' }}>
        <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '10px' }}>⚠️ Disponibilidad</div>
        <div style={{ fontSize: '14px', color: '#ccc', lineHeight: 1.7 }}>
          Todos los pedidos están <strong style={{ color: '#fff' }}>sujetos a confirmación de disponibilidad</strong> del artículo. En caso de no estar disponible, te avisaremos a la brevedad para buscar una alternativa o realizar el reembolso.
        </div>
      </div>

      <div style={{ background: '#141414', border: '1px solid #1e1e1e', borderRadius: '14px', padding: '20px', marginBottom: '16px' }}>
        <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '14px' }}>🛒 ¿Cómo comprar?</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[['1','Elige tu camiseta del catálogo'],['2','Selecciona talla, versión y si quieres estampado'],['3','Agrega al carrito'],['4','Ingresa tus datos y confirma el pedido'],['5','Te contactamos por WhatsApp para coordinar pago y entrega']].map(([n,t]) => (
            <div key={n} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <span style={{ background: '#cc1a1a', color: '#fff', borderRadius: '50%', width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, flexShrink: 0 }}>{n}</span>
              <span style={{ fontSize: '14px', color: '#ccc', paddingTop: '3px' }}>{t}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: '#141414', border: '1px solid #1e1e1e', borderRadius: '14px', padding: '20px', marginBottom: '16px' }}>
        <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '14px' }}>👕 Versiones</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ padding: '12px', background: '#1e1e1e', borderRadius: '10px' }}>
            <div style={{ fontWeight: 700, marginBottom: '4px', color: '#ccc' }}>Fan Version</div>
            <div style={{ fontSize: '13px', color: '#666' }}>Réplica de alta calidad. Ideal para el día a día y el estadio.</div>
          </div>
          <div style={{ padding: '12px', background: '#1a0a2a', border: '1px solid #7c3aed', borderRadius: '10px' }}>
            <div style={{ fontWeight: 700, marginBottom: '4px', color: '#a78bfa' }}>Player Version ⚡</div>
            <div style={{ fontSize: '13px', color: '#888' }}>Misma tela y corte que usan los jugadores en cancha. Material premium, ajuste atlético.</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
        <div style={{ background: '#0a1a0a', border: '1px solid #16a34a', borderRadius: '14px', padding: '18px' }}>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#4ade80', marginBottom: '8px' }}>● En stock</div>
          <div style={{ fontSize: '13px', color: '#888' }}>Disponible inmediatamente.</div>
        </div>
        <div style={{ background: '#1a1400', border: '1px solid #f59e0b', borderRadius: '14px', padding: '18px' }}>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#f59e0b', marginBottom: '8px' }}>○ A pedido</div>
          <div style={{ fontSize: '13px', color: '#888' }}>Se encarga. Tiempo: 14-20 días.</div>
        </div>
      </div>

      <div style={{ background: '#1a0000', border: '1px solid #2a0a0a', borderRadius: '14px', padding: '20px' }}>
        <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>📲 Contacto</div>
        <div style={{ fontSize: '14px', color: '#888', lineHeight: 1.7 }}>Nos pondremos en contacto contigo una vez recibido tu pedido para coordinar el pago y la entrega.</div>
      </div>
    </div>
  )
}
