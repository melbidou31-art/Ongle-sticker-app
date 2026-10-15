import { useEffect, useState } from 'react'
import { listDesigns } from '../lib/db.js'
import { FINGERS } from '../lib/clients.js'

/**
 * Ongles accent : pour chaque doigt du set, « même motif » ou le motif d'un autre design de la bibliothèque
 * (ex. annulaires pailletés, initiale sur le pouce). Visible seulement quand le design a un set 10 doigts.
 */
export default function AccentPicker({ design, onChange }) {
  const [others, setOthers] = useState([])
  const [open, setOpen] = useState(!!Object.keys(design.accents || {}).length)
  useEffect(() => {
    listDesigns()
      .then((all) => setOthers(all.filter((d) => d.id !== design.id)))
      .catch(() => setOthers([]))
  }, [design.id])

  const accents = design.accents || {}
  const count = Object.keys(accents).length

  function setAccent(finger, id) {
    const next = { ...accents }
    if (id) next[finger] = id
    else delete next[finger]
    onChange({ accents: next })
  }

  return (
    <div className="accents">
      <button className="chip" onClick={() => setOpen((v) => !v)}>
        💅 Ongles accent{count ? ` (${count})` : ''} {open ? '▴' : '▾'}
      </button>
      {open && (
        <>
          <p className="muted">
            Un autre motif sur certains doigts (ex. annulaires) : choisis un design de ta bibliothèque, il est mis à la
            taille de l'ongle. Visible en traçage (◀ ▶) et dans l'export de la planche.
          </p>
          {others.length === 0 ? (
            <p className="muted">Crée d'abord un autre design dans la bibliothèque.</p>
          ) : (
            <div className="hands-set">
              {[0, 5].map((start) => (
                <div key={start} className="set-hand">
                  <span className="muted">{start ? 'Main droite' : 'Main gauche'}</span>
                  {FINGERS.slice(start, start + 5).map((f, k) => (
                    <label key={f} className="set-row">
                      <span>{f.replace(/ [GD]$/, '')}</span>
                      <select value={accents[start + k] || ''} onChange={(e) => setAccent(start + k, e.target.value)}>
                        <option value="">Même motif</option>
                        {others.map((o) => (
                          <option key={o.id} value={o.id}>{o.name}</option>
                        ))}
                      </select>
                    </label>
                  ))}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
