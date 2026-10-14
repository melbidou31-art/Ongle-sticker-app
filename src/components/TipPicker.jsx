import { useState } from 'react'
import { BRANDS, LENGTHS, getMeasures, saveMeasure, tipWidth } from '../lib/tips.js'
import { resizeNail } from '../lib/clients.js'

/**
 * Choix d'une capsule du commerce (marque + taille + longueur) qui règle la taille de l'ongle.
 * « Enregistrer ma mesure » mémorise la largeur actuelle (ajustée sur la vraie capsule posée
 * sur l'écran) pour cette marque et cette taille.
 */
export default function TipPicker({ design, onChange }) {
  const [measures, setMeasures] = useState(getMeasures)
  const tip = design.tip || { brand: '', size: '', length: 'medium' }
  const brand = BRANDS.find((b) => b.id === tip.brand)

  function apply(next) {
    const t = { ...tip, ...next }
    const width = t.brand && t.size ? tipWidth(t.brand, t.size, measures) : null
    const w = width ? width.w : design.nailW
    const h = t.brand ? LENGTHS[t.length].mm : design.nailH
    // le motif suit la nouvelle taille de capsule
    onChange({ tip: t, ...resizeNail(design, w, h) })
  }

  function chooseBrand(id) {
    if (!id) return onChange({ tip: null })
    const b = BRANDS.find((x) => x.id === id)
    // taille du milieu par défaut
    apply({ brand: id, size: b.sizes[Math.floor(b.sizes.length / 2)].label })
  }

  const current = brand && tip.size ? tipWidth(tip.brand, tip.size, measures) : null

  return (
    <div className="tip-picker">
      <label className="field">
        <span>Capsule du commerce</span>
        <select value={tip.brand} onChange={(e) => chooseBrand(e.target.value)}>
          <option value="">Réglage manuel</option>
          {BRANDS.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
      </label>

      {brand && (
        <>
          <div className="sizes">
            {brand.sizes.map((s) => {
              const mine = measures[brand.id]?.[s.label]
              return (
                <button
                  key={s.label}
                  className={`size ${tip.size === s.label ? 'on' : ''} ${mine ? 'mine' : ''}`}
                  onClick={() => apply({ size: s.label })}
                  title={`${mine || s.w} mm`}
                >
                  {s.label}
                </button>
              )
            })}
          </div>
          <div className="seg wrap">
            {Object.entries(LENGTHS).map(([k, l]) => (
              <button key={k} className={tip.length === k ? 'on' : ''} onClick={() => apply({ length: k })}>
                {l.label}
              </button>
            ))}
          </div>
          {current && (
            <p className="muted">
              Taille {tip.size} : <b>{design.nailW} mm</b> de large ·{' '}
              {current.exact ? (
                <span className="ok">✓ mesurée sur ta boîte</span>
              ) : (
                <span className="approx">approx. — source : {brand.source}</span>
              )}
            </p>
          )}
          <div className="measure-box">
            <p className="muted">
              Pour une taille exacte : pose ta vraie capsule taille {tip.size} sur le contour, ajuste « Largeur » ci-dessous
              jusqu'à ce qu'ils se superposent, puis enregistre.
            </p>
            <button
              className="chip gold"
              onClick={() => setMeasures(saveMeasure(tip.brand, tip.size, design.nailW))}
            >
              Enregistrer {design.nailW} mm pour la taille {tip.size}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
