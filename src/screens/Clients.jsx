import { useState } from 'react'
import {
  FINGERS, deleteClient, isDefaultAdult, kidWidths, listClients, nailsFromSizing, newClient, saveClient,
} from '../lib/clients.js'
import { MmInput } from '../components/LengthPicker.jsx'
import { allBrands } from '../lib/tips.js'
import LengthPicker from '../components/LengthPicker.jsx'
import { defaultTipSet } from '../lib/fingerset.js'
import MeasureTool from '../components/MeasureTool.jsx'
import { allShapes } from '../lib/shapes.js'

function NumberField({ value, onChange }) {
  return (
    <input
      className="num"
      type="number"
      inputMode="decimal"
      min={4}
      max={30}
      step={0.5}
      value={value}
      onChange={(e) => onChange(+e.target.value || 0)}
    />
  )
}

export default function Clients({ pxPerMm, onBack }) {
  const [clients, setClients] = useState(listClients)
  const [edit, setEdit] = useState(null)
  const [measuring, setMeasuring] = useState(null) // index du doigt en cours de mesure

  function update(patch) {
    setEdit((c) => ({ ...c, ...patch }))
  }
  function setNail(i, patch) {
    setEdit((c) => ({ ...c, nails: c.nails.map((n, j) => (j === i ? { ...n, ...patch } : n)) }))
  }

  // Saisie « marque + numéro » : marque, longueur commune XS–XXL, numéro de capsule par doigt
  const brands = allBrands()
  const sizing = edit?.sizing || { mode: 'mm' }
  const brand = brands.find((b) => b.id === sizing.brand)
  const setSizing = (patch) => setEdit((c) => ({ ...c, sizing: { ...(c.sizing || { mode: 'mm' }), ...patch } }))
  function toBrandMode() {
    const b = sizing.brand || brands[0].id
    setSizing({ mode: 'brand', brand: b, length: sizing.length || 'm', sizes: sizing.sizes || defaultTipSet(b) })
  }
  const computed = sizing.mode === 'brand' && brand ? nailsFromSizing(sizing, edit.shape || 'oval') : null

  // Mode enfant en saisie mm : une longueur commune (saisie à la main) appliquée aux 10 doigts
  const kidMm = sizing.mode !== 'brand' ? sizing.kidLength : null
  function setKidLength(mm) {
    setEdit((c) => ({
      ...c,
      sizing: { ...(c.sizing || { mode: 'mm' }), kidLength: mm },
      nails: c.nails.map((n) => ({ ...n, h: mm })),
    }))
  }
  function toggleKid(on) {
    if (!on) return setSizing({ kidLength: null })
    // fiche jamais modifiée : on part de largeurs d'enfant plutôt que d'adulte
    setEdit((c) => {
      const w = isDefaultAdult(c.nails) ? kidWidths() : c.nails.map((n) => n.w)
      return { ...c, sizing: { ...(c.sizing || { mode: 'mm' }), kidLength: 8 }, nails: w.map((x) => ({ w: x, h: 8 })) }
    })
  }

  if (edit)
    return (
      <div className="screen clients">
        <header className="topbar">
          <button className="ghost dark" onClick={() => setEdit(null)}>‹ Clientes</button>
          <input className="name-input" value={edit.name} onChange={(e) => update({ name: e.target.value })} />
          <button
            className="pink"
            onClick={() => {
              // en « marque + numéro », les mesures en mm sont recalculées pour le reste de l'app
              const c = sizing.mode === 'brand' && computed ? { ...edit, nails: computed } : edit
              setClients(saveClient(c))
              setEdit(null)
            }}
          >
            Enregistrer
          </button>
        </header>
        <div className="pad client-shape">
          <span className="muted">Saisie des ongles</span>
          <div className="seg">
            <button className={sizing.mode !== 'brand' ? 'on' : ''} onClick={() => setSizing({ mode: 'mm' })}>
              Largeur / longueur (mm)
            </button>
            <button className={sizing.mode === 'brand' ? 'on' : ''} onClick={toBrandMode}>
              Marque + numéro
            </button>
          </div>
        </div>
        {sizing.mode === 'brand' ? (
          <p className="muted pad">
            Choisis la marque de capsules utilisée pour elle, le numéro de chaque doigt et la longueur (la même pour les
            10 doigts) : les millimètres sont calculés automatiquement.
          </p>
        ) : (
          <p className="muted pad">
            Mesure chaque ongle naturel au point le plus large (d'une paroi latérale à l'autre, en suivant la courbe),
            et sa longueur de la cuticule au bord libre souhaité. En millimètres — ou 📏 pour le mesurer directement
            sur l'écran (calibre l'écran avant).
          </p>
        )}
        <div className="pad client-shape">
          <span className="muted">Forme habituelle de ses ongles</span>
          <div className="seg wrap">
            {Object.entries(allShapes())
              .filter(([k]) => k !== 'none')
              .map(([k, l]) => (
                <button key={k} className={(edit.shape || 'oval') === k ? 'on' : ''} onClick={() => update({ shape: k })}>
                  {l}
                </button>
              ))}
          </div>
        </div>
        {sizing.mode !== 'brand' && (
          <div className="pad client-shape">
            <label className="check kid-toggle">
              <input type="checkbox" checked={!!kidMm} onChange={(e) => toggleKid(e.target.checked)} />
              👧 Mode enfant (longueur saisie à la main, la même pour les 10 doigts)
            </label>
            {kidMm && <MmInput label="Longueur" value={kidMm} onChange={setKidLength} />}
          </div>
        )}
        {sizing.mode === 'brand' && (
          <div className="pad client-shape">
            <label className="field">
              <span>Marque</span>
              <select value={sizing.brand} onChange={(e) => setSizing({ brand: e.target.value, sizes: defaultTipSet(e.target.value) })}>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}{b.ref ? ` — ${b.ref}` : ''}</option>
                ))}
              </select>
            </label>
            <LengthPicker value={sizing.length} onChange={(length) => setSizing({ length })} />
          </div>
        )}
        <div className="hands">
          {sizing.mode === 'brand' ? (
            [0, 5].map((start) => (
              <table key={start} className="nails-table">
                <thead>
                  <tr><th>{start ? 'Main droite' : 'Main gauche'}</th><th>N°</th><th>Largeur × longueur</th></tr>
                </thead>
                <tbody>
                  {sizing.sizes.slice(start, start + 5).map((size, k) => (
                    <tr key={k}>
                      <td>{FINGERS[start + k].replace(/ [GD]$/, '')}</td>
                      <td>
                        <select
                          className="num"
                          value={size}
                          onChange={(e) => setSizing({ sizes: sizing.sizes.map((s, j) => (j === start + k ? e.target.value : s)) })}
                        >
                          {(brand?.sizes || []).map((s) => (
                            <option key={s.label} value={s.label}>{s.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="muted">
                        {computed ? `${computed[start + k].w} × ${computed[start + k].h} mm` : 'marque introuvable'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ))
          ) : [0, 5].map((start) => (
            <table key={start} className="nails-table">
              <thead>
                <tr>
                  <th>{start ? 'Main droite' : 'Main gauche'}</th><th>Largeur</th>
                  {!kidMm && <th>Longueur</th>}
                  <th />
                </tr>
              </thead>
              <tbody>
                {edit.nails.slice(start, start + 5).map((n, k) => (
                  <tr key={k}>
                    <td>{FINGERS[start + k].replace(/ [GD]$/, '')}</td>
                    <td><NumberField value={n.w} onChange={(w) => setNail(start + k, { w })} /></td>
                    {/* mode enfant : longueur commune saisie au-dessus */}
                    {!kidMm && <td><NumberField value={n.h} onChange={(h) => setNail(start + k, { h })} /></td>}
                    <td>
                      <button className="chip mini" onClick={() => setMeasuring(start + k)} title="Mesurer à l'écran">📏</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ))}
        </div>
        {measuring != null && (
          <MeasureTool
            pxPerMm={pxPerMm}
            title={FINGERS[measuring].toUpperCase()}
            initial={edit.nails[measuring]}
            withLength={!kidMm}
            onCancel={() => setMeasuring(null)}
            onDone={(v) => {
              // mode enfant : seule la largeur est mesurée, la longueur reste la longueur commune
              setNail(measuring, kidMm ? { w: v.w } : v)
              setMeasuring(null)
            }}
          />
        )}
      </div>
    )

  return (
    <div className="screen clients">
      <header className="topbar">
        <button className="ghost dark" onClick={onBack}>‹ Designs</button>
        <b>Clientes</b>
        <button className="pink" onClick={() => setEdit(newClient())}>+ Cliente</button>
      </header>
      {clients.length === 0 ? (
        <p className="empty">
          Aucune cliente. Ajoute ses mesures d'ongles une fois : en mode « Ongle direct », le motif s'adaptera tout seul à
          chacun de ses doigts.
        </p>
      ) : (
        <ul className="client-list">
          {clients.map((c) => (
            <li key={c.id}>
              <button className="client-row" onClick={() => setEdit(c)}>
                <b>{c.name}</b>
                <span className="muted">
                  {allShapes()[c.shape || 'oval'] || 'Ovale'} · {c.nails.map((n) => n.w).join(' · ')} mm
                </span>
              </button>
              <button
                className="chip danger"
                onClick={() => confirm(`Supprimer « ${c.name} » ?`) && setClients(deleteClient(c.id))}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
