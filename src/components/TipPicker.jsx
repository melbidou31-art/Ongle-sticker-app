import { useState } from 'react'
import {
  allBrands, deleteCustomBrand, getMeasures, lengthKey, newCustomBrand, saveCustomBrand, saveMeasure,
  tipLength, tipWidth,
} from '../lib/tips.js'
import BrandEditor from './BrandEditor.jsx'
import LengthPicker from './LengthPicker.jsx'
import { FINGERS, resizeNail } from '../lib/clients.js'
import { defaultTipSet } from '../lib/fingerset.js'
import MeasureTool from './MeasureTool.jsx'

/**
 * Choix d'une capsule du commerce (marque + taille + longueur) qui règle la taille de l'ongle.
 * « Enregistrer ma mesure » mémorise la largeur actuelle (ajustée sur la vraie capsule posée
 * sur l'écran) pour cette marque et cette taille.
 */
export default function TipPicker({ design, pxPerMm, onChange }) {
  const [measures, setMeasures] = useState(getMeasures)
  const [measuring, setMeasuring] = useState(false)
  const rawTip = design.tip || { brand: '', size: '', length: 'l' }
  const tip = { ...rawTip, length: lengthKey(rawTip.length) } // anciennes longueurs converties
  const [brands, setBrands] = useState(allBrands)
  const brand = brands.find((b) => b.id === tip.brand)
  const [editing, setEditing] = useState(null) // marque perso en cours de création / modification

  function saveBrand(b) {
    saveCustomBrand(b)
    setBrands(allBrands())
    setEditing(null)
    // la marque créée (ou modifiée) devient la capsule choisie
    const keep = b.sizes.find((s) => s.label === tip.size) ? tip.size : b.sizes[0].label
    apply({ brand: b.id, size: keep }, b.id === tip.brand ? {} : { tipSet: null })
  }

  function apply(next, extra = {}) {
    const t = { ...tip, ...next }
    const width = t.brand && t.size ? tipWidth(t.brand, t.size, measures) : null
    const w = width ? width.w : design.nailW
    const shape = design.shape === 'none' ? 'coffin' : design.shape
    const h = t.brand ? tipLength(t.length, shape) : design.nailH
    // le motif suit la nouvelle taille de capsule
    onChange({ tip: t, ...resizeNail(design, w, h), shape, ...extra })
  }

  function chooseBrand(id) {
    // les tailles d'un set ne sont pas transposables d'une marque à l'autre
    if (!id) return onChange({ tip: null, tipSet: null })
    if (id === '__new') return setEditing(newCustomBrand())
    const b = brands.find((x) => x.id === id)
    // taille du milieu par défaut
    apply({ brand: id, size: b.sizes[Math.floor(b.sizes.length / 2)].label }, { tipSet: null })
  }

  const current = brand && tip.size ? tipWidth(tip.brand, tip.size, measures) : null

  return (
    <div className="tip-picker">
      <label className="field">
        <span>Capsule du commerce</span>
        <select value={tip.brand} onChange={(e) => chooseBrand(e.target.value)}>
          <option value="">Réglage manuel</option>
          <optgroup label="Marques du commerce">
            {brands.filter((b) => !b.custom).map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </optgroup>
          <optgroup label="Mes marques">
            {brands.filter((b) => b.custom).map((b) => (
              <option key={b.id} value={b.id}>{b.name}{b.ref ? ` — ${b.ref}` : ''}</option>
            ))}
            <option value="__new">+ Nouvelle marque / mes capsules…</option>
          </optgroup>
        </select>
      </label>

      {brand?.custom && !editing && (
        <button className="chip mini" onClick={() => setEditing(brand)}>✎ Modifier « {brand.name} »</button>
      )}

      {editing && (
        <BrandEditor
          key={editing.id}
          brand={editing}
          pxPerMm={pxPerMm}
          onSave={saveBrand}
          onCancel={() => setEditing(null)}
          onDelete={
            brands.some((b) => b.id === editing.id)
              ? () => {
                  deleteCustomBrand(editing.id)
                  setBrands(allBrands())
                  setEditing(null)
                  if (tip.brand === editing.id) onChange({ tip: null, tipSet: null })
                }
              : undefined
          }
        />
      )}

      {brand && !editing && (
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
          <LengthPicker value={tip.length} onChange={(length) => apply({ length })} />
          {current && (
            <p className="muted">
              Taille {tip.size} : <b>{design.nailW} mm</b> de large ·{' '}
              {current.exact ? (
                <span className="ok">✓ {brand.custom ? `mesure de ta marque${brand.ref ? ` (${brand.ref})` : ''}` : 'mesurée sur ta boîte'}</span>
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
            <div className="row">
              <button
                className="chip gold"
                onClick={() => setMeasures(saveMeasure(tip.brand, tip.size, design.nailW))}
              >
                Enregistrer {design.nailW} mm pour la taille {tip.size}
              </button>
              <button className="chip" onClick={() => setMeasuring(true)}>📏 Mesurer la capsule</button>
            </div>
          </div>
          {measuring && (
            <MeasureTool
              pxPerMm={pxPerMm}
              title={`${brand.name.toUpperCase()} · TAILLE ${tip.size}`}
              initial={{ w: design.nailW, h: design.nailH }}
              withLength={false}
              onCancel={() => setMeasuring(false)}
              onDone={({ w }) => {
                setMeasuring(false)
                const m = saveMeasure(tip.brand, tip.size, w)
                setMeasures(m)
                onChange(resizeNail(design, w, design.nailH))
              }}
            />
          )}
          <div className="measure-box">
            <span className="eyebrow gold">SET 10 DOIGTS</span>
            {design.tipSet ? (
              <>
                <div className="hands-set">
                  {[0, 5].map((start) => (
                    <div key={start} className="set-hand">
                      <span className="muted">{start ? 'Main droite' : 'Main gauche'}</span>
                      {FINGERS.slice(start, start + 5).map((f, k) => (
                        <label key={f} className="set-row">
                          <span>{f.replace(/ [GD]$/, '')}</span>
                          <select
                            value={design.tipSet[start + k]}
                            onChange={(e) =>
                              onChange({ tipSet: design.tipSet.map((s, j) => (j === start + k ? e.target.value : s)) })
                            }
                          >
                            {brand.sizes.map((s) => (
                              <option key={s.label} value={s.label}>{s.label}</option>
                            ))}
                          </select>
                        </label>
                      ))}
                    </div>
                  ))}
                </div>
                <p className="muted">En mode traçage, passe d'un doigt à l'autre : chaque capsule prend sa taille.</p>
              </>
            ) : (
              <button className="chip gold" onClick={() => onChange({ tipSet: defaultTipSet(tip.brand, tip.size) })}>
                Créer un set 10 doigts (pouce = taille {tip.size})
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
