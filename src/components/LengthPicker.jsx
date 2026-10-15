import { useEffect, useState } from 'react'
import { KID_DEFAULT, LENGTHS, isKidLength, kidKey, kidMm } from '../lib/tips.js'

/**
 * Choix de la longueur (la même pour les 10 doigts) : XS → XXL, ou en mode enfant saisie à la main en mm.
 * Le mode est déduit de la valeur ; basculer passe à une longueur par défaut de l'autre mode.
 */
export default function LengthPicker({ value, onChange }) {
  const kid = isKidLength(value)
  return (
    <div className="length-picker">
      <div className="row">
        <span className="muted">Longueur (la même pour les 10 doigts)</span>
        <label className="check kid-toggle">
          <input type="checkbox" checked={kid} onChange={(e) => onChange(e.target.checked ? KID_DEFAULT : 'm')} />
          👧 Mode enfant
        </label>
      </div>
      {kid ? (
        <MmInput label="Longueur" value={kidMm(value)} onChange={(mm) => onChange(kidKey(mm))} />
      ) : (
        <div className="seg wrap lengths">
          {Object.entries(LENGTHS).map(([k, l]) => (
            <button key={k} className={value === k ? 'on' : ''} onClick={() => onChange(k)} title={l.name}>
              <b>{l.label}</b>
              <small>{l.name}</small>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Saisie d'une longueur en mm au clavier (avec − / + par demi-mm).
 * Le champ garde ce qui est tapé (ex. « 12, ») et n'applique que les valeurs valides (3 à 40 mm).
 */
export function MmInput({ label, value, onChange, min = 3, max = 40 }) {
  const [text, setText] = useState(String(value))
  useEffect(() => setText(String(value)), [value])
  const commit = (v) => {
    const n = parseFloat(String(v).replace(',', '.'))
    if (Number.isFinite(n) && n >= min && n <= max) onChange(n)
  }
  const step = (d) => onChange(Math.min(max, Math.max(min, Math.round((value + d) * 2) / 2)))
  return (
    <div className="mm-input">
      <span className="muted">{label}</span>
      <button className="chip" onClick={() => step(-0.5)} aria-label="Moins 0,5 mm">−</button>
      <input
        className="num"
        type="text"
        inputMode="decimal"
        value={text}
        onChange={(e) => {
          setText(e.target.value)
          commit(e.target.value)
        }}
        onBlur={() => setText(String(value))}
        aria-label={`${label} en millimètres`}
      />
      <span>mm</span>
      <button className="chip" onClick={() => step(0.5)} aria-label="Plus 0,5 mm">+</button>
    </div>
  )
}
