import { useState } from 'react'
import MeasureTool from './MeasureTool.jsx'

/**
 * Création / modification d'une marque perso : nom, référence et liste de tailles (libellé + largeur en mm).
 * Chaque largeur se saisit ou se mesure à l'écran en posant la vraie capsule.
 */
export default function BrandEditor({ brand, pxPerMm, onSave, onDelete, onCancel }) {
  const [b, setB] = useState(brand)
  const [measuring, setMeasuring] = useState(null) // index de la taille en cours de mesure
  const setSize = (i, patch) => setB((x) => ({ ...x, sizes: x.sizes.map((s, j) => (j === i ? { ...s, ...patch } : s)) }))

  function addSize() {
    setB((x) => {
      const last = x.sizes[x.sizes.length - 1]
      const n = Number(last?.label)
      // taille suivante : numéro +1 et 1 mm de moins (à ajuster ou mesurer)
      return {
        ...x,
        sizes: [...x.sizes, { label: Number.isFinite(n) ? String(n + 1) : '', w: Math.max(6, (last?.w ?? 15) - 1) }],
      }
    })
  }

  const valid = b.name.trim() && b.sizes.length && b.sizes.every((s) => s.label.trim() && s.w > 0)

  return (
    <div className="brand-editor">
      <span className="eyebrow gold">{onDelete ? 'MODIFIER LA MARQUE' : 'NOUVELLE MARQUE'}</span>
      <label className="field">
        <span>Nom</span>
        <input className="text-input" value={b.name} onChange={(e) => setB({ ...b, name: e.target.value })} />
      </label>
      <label className="field">
        <span>Référence (boîte, forme, collection…)</span>
        <input
          className="text-input"
          placeholder="ex. Soft gel coffin medium, réf. 1234"
          value={b.ref}
          onChange={(e) => setB({ ...b, ref: e.target.value })}
        />
      </label>
      <table className="nails-table">
        <thead>
          <tr><th>Taille</th><th>Largeur (mm)</th><th /><th /></tr>
        </thead>
        <tbody>
          {b.sizes.map((s, i) => (
            <tr key={i}>
              <td>
                <input className="num" value={s.label} onChange={(e) => setSize(i, { label: e.target.value.slice(0, 6) })} />
              </td>
              <td>
                <input
                  className="num"
                  type="number"
                  inputMode="decimal"
                  step={0.5}
                  min={4}
                  max={30}
                  value={s.w}
                  onChange={(e) => setSize(i, { w: +e.target.value || 0 })}
                />
              </td>
              <td>
                <button className="chip mini" onClick={() => setMeasuring(i)} title="Mesurer la capsule à l'écran">📏</button>
              </td>
              <td>
                <button
                  className="chip mini danger"
                  disabled={b.sizes.length < 2}
                  onClick={() => setB({ ...b, sizes: b.sizes.filter((_, j) => j !== i) })}
                  aria-label={`Retirer la taille ${s.label}`}
                >
                  ✕
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="row">
        <button className="chip" onClick={addSize}>+ Taille</button>
      </div>
      <div className="row">
        <button className="pink" disabled={!valid} onClick={() => onSave({ ...b, name: b.name.trim(), ref: b.ref.trim() })}>
          Enregistrer la marque
        </button>
        <button className="chip" onClick={onCancel}>Annuler</button>
        {onDelete && (
          <button className="chip danger" onClick={() => confirm(`Supprimer la marque « ${b.name} » ?`) && onDelete()}>
            Supprimer
          </button>
        )}
      </div>
      {measuring != null && (
        <MeasureTool
          pxPerMm={pxPerMm}
          title={`${b.name.toUpperCase()} · TAILLE ${b.sizes[measuring].label}`}
          initial={{ w: b.sizes[measuring].w, h: 20 }}
          withLength={false}
          onCancel={() => setMeasuring(null)}
          onDone={({ w }) => {
            setSize(measuring, { w })
            setMeasuring(null)
          }}
        />
      )}
    </div>
  )
}
