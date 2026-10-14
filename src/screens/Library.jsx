import { useRef } from 'react'

export default function Library({ designs, onImport, onOpen, onTrace, onDelete, onCalibrate, onClients, busy }) {
  const input = useRef(null)
  return (
    <div className="screen library">
      <header className="lib-head">
        <div className="brand">
          <div className="logo">o</div>
          <div>
            <div className="eyebrow gold">BY BERRY</div>
            <div className="title">ONGLE TRACE</div>
          </div>
        </div>
        <p className="tagline">
          Une table lumineuse pour nail artists. Importe une référence, pose ta capsule sur l'écran et laisse tes mains faire le travail.
        </p>
        <div className="row">
          <button className="pink big" disabled={busy} onClick={() => input.current.click()}>
            {busy ? 'Traitement…' : '+ Importer une image'}
          </button>
          <button className="ghost dark" onClick={onCalibrate}>📏 Calibrer l'écran</button>
          <button className="ghost dark" onClick={onClients}>👤 Clientes</button>
        </div>
        <input
          ref={input}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0]
            e.target.value = ''
            if (f) onImport(f)
          }}
        />
      </header>

      {designs.length === 0 ? (
        <p className="empty">Aucun design pour l'instant. Importe un dessin ou une photo pour commencer.</p>
      ) : (
        <ul className="cards">
          {designs.map((d) => (
            <li key={d.id} className="card">
              <button className="thumb" onClick={() => onOpen(d)}>
                <img src={d.lineart} alt="" />
              </button>
              <div className="card-body">
                <b>{d.name}</b>
                <code>{d.id.slice(0, 8)}</code>
                <div className="row">
                  <button className="chip" onClick={() => onOpen(d)}>Éditer</button>
                  <button className="chip gold" onClick={() => onTrace(d)}>Tracer</button>
                  <button
                    className="chip danger"
                    onClick={() => confirm(`Supprimer « ${d.name} » ?`) && onDelete(d)}
                  >
                    ✕
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
