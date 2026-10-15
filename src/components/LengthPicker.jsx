import { KID_LENGTHS, LENGTHS, isKidLength } from '../lib/tips.js'

/**
 * Choix de la longueur (la même pour les 10 doigts) : XS → XXL, ou en mode enfant directement en millimètres.
 * Le mode est déduit de la valeur : basculer convertit vers une longueur par défaut de l'autre mode.
 */
export default function LengthPicker({ value, onChange }) {
  const kid = isKidLength(value)
  const options = kid ? KID_LENGTHS : LENGTHS
  return (
    <div className="length-picker">
      <div className="row">
        <span className="muted">Longueur (la même pour les 10 doigts)</span>
        <label className="check kid-toggle">
          <input type="checkbox" checked={kid} onChange={(e) => onChange(e.target.checked ? 'k12' : 'm')} />
          👧 Mode enfant
        </label>
      </div>
      <div className="seg wrap lengths">
        {Object.entries(options).map(([k, l]) => (
          <button key={k} className={value === k ? 'on' : ''} onClick={() => onChange(k)} title={l.name || l.label}>
            <b>{l.label}</b>
            {l.name && <small>{l.name}</small>}
          </button>
        ))}
      </div>
    </div>
  )
}
