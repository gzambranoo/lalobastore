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
                <td style={{ padding: '11px 0', textAlign: 'right', color: '#cc1a1a', fontWeight: 700 }}>${price.toLocaleString('es-CL')}</td>
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
          Todos los pedidos están <strong style={{ color: '#fff' }}>sujetos a confirmación de disponibilidad</strong> del artículo. En caso de no estar disponible, te avisaremos a la brevedad.
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

      <a href="https://wa.me/56982633425?text=Hola%2C%20tengo%20una%20consulta%20sobre%20La%20Loba%20Store"
        target="_blank" rel="noopener noreferrer"
        style={{ display: 'flex', alignItems: 'center', gap: '14px', background: '#0a1f0a', border: '1px solid #166534', borderRadius: '14px', padding: '18px 20px', textDecoration: 'none', cursor: 'pointer' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#25d366', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </div>
        <div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#4ade80', marginBottom: '3px' }}>Contáctanos por WhatsApp</div>
          <div style={{ fontSize: '13px', color: '#888' }}>Haz clic aquí para escribirnos directo</div>
        </div>
        <span style={{ color: '#4ade80', fontSize: '20px', marginLeft: 'auto' }}>→</span>
      </a>
    </div>
  )
}
