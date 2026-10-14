import { useState } from 'react'
import { FINGERS, deleteClient, listClients, newClient, saveClient } from '../lib/clients.js'

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

export default function Clients({ onBack }) {
  const [clients, setClients] = useState(listClients)
  const [edit, setEdit] = useState(null)

  function update(patch) {
    setEdit((c) => ({ ...c, ...patch }))
  }
  function setNail(i, patch) {
    setEdit((c) => ({ ...c, nails: c.nails.map((n, j) => (j === i ? { ...n, ...patch } : n)) }))
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
              setClients(saveClient(edit))
              setEdit(null)
            }}
          >
            Enregistrer
          </button>
        </header>
        <p className="muted pad">
          Mesure chaque ongle naturel au point le plus large (d'une paroi latérale à l'autre, en suivant la courbe),
          et sa longueur de la cuticule au bord libre souhaité. En millimètres.
        </p>
        <div className="hands">
          {[0, 5].map((start) => (
            <table key={start} className="nails-table">
              <thead>
                <tr><th>{start ? 'Main droite' : 'Main gauche'}</th><th>Largeur</th><th>Longueur</th></tr>
              </thead>
              <tbody>
                {edit.nails.slice(start, start + 5).map((n, k) => (
                  <tr key={k}>
                    <td>{FINGERS[start + k].replace(/ [GD]$/, '')}</td>
                    <td><NumberField value={n.w} onChange={(w) => setNail(start + k, { w })} /></td>
                    <td><NumberField value={n.h} onChange={(h) => setNail(start + k, { h })} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ))}
        </div>
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
                <span className="muted">{c.nails.map((n) => n.w).join(' · ')} mm</span>
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
