import { useState } from 'react'
import { FINGERS, listClients, resizeNail } from '../lib/clients.js'
import { allShapes } from '../lib/shapes.js'

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
    // forme habituelle de la cliente, appliquée quand on la choisit (ou si le motif était seul) ;
    // changer de doigt garde la forme éventuellement modifiée à la main
    const newClient = s.id !== sel.id
    const shape = newClient || design.shape === 'none' ? { shape: c.shape || 'oval' } : {}
    onChange({ client: s, ...resizeNail(design, n.w, n.h), ...shape })
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
            {FINGERS[sel.finger]} : <b>{client.nails[sel.finger].w} × {client.nails[sel.finger].h} mm</b> · forme{' '}
            habituelle : {(allShapes()[client.shape || 'oval'] || 'ovale').toLowerCase()} · le motif est mis à l'échelle
            automatiquement.
          </p>
          {/* rappel des notes de la fiche (allergies…) au moment de préparer la pose */}
          {client.notes?.trim() && <p className="client-note">📝 {client.notes.trim()}</p>}
        </>
      )}
      <button className="chip" onClick={onManageClients}>Gérer les clientes</button>
    </div>
  )
}
