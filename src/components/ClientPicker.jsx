import { useState } from 'react'
import { FINGERS, listClients, resizeNail } from '../lib/clients.js'

/** Mode « Ongle direct » : l'ongle prend les mesures du doigt choisi, le motif suit. */
export default function ClientPicker({ design, onChange, onManageClients }) {
  const [clients] = useState(listClients)
  const sel = design.client || { id: '', finger: 1 }
  const client = clients.find((c) => c.id === sel.id)

  function apply(next) {
    const s = { ...sel, ...next }
    const c = clients.find((x) => x.id === s.id)
    if (!c) return onChange({ client: s })
    const n = c.nails[s.finger]
    onChange({ client: s, ...resizeNail(design, n.w, n.h) })
  }

  if (clients.length === 0)
    return (
      <div className="tip-picker">
        <p className="muted">Aucun profil cliente. Enregistre ses 10 mesures d'ongles une fois pour les réutiliser.</p>
        <button className="chip gold" onClick={onManageClients}>+ Créer un profil cliente</button>
      </div>
    )

  return (
    <div className="tip-picker">
      <label className="field">
        <span>Cliente</span>
        <select value={sel.id} onChange={(e) => apply({ id: e.target.value })}>
          <option value="">Choisir…</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </label>
      {client && (
        <>
          <div className="fingers">
            {[0, 5].map((start) => (
              <div key={start} className="sizes">
                {FINGERS.slice(start, start + 5).map((f, k) => (
                  <button
                    key={f}
                    className={`size finger ${sel.finger === start + k ? 'on' : ''}`}
                    onClick={() => apply({ finger: start + k })}
                    title={`${client.nails[start + k].w} × ${client.nails[start + k].h} mm`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            ))}
          </div>
          <p className="muted">
            {FINGERS[sel.finger]} : <b>{client.nails[sel.finger].w} × {client.nails[sel.finger].h} mm</b> · le motif est
            mis à l'échelle automatiquement.
          </p>
        </>
      )}
      <button className="chip" onClick={onManageClients}>Gérer les clientes</button>
    </div>
  )
}
