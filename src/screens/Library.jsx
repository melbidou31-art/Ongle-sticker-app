import { useMemo, useRef, useState } from 'react'
import BackupPanel from '../components/BackupPanel.jsx'
import MotifPicker from '../components/MotifPicker.jsx'
import { BRANDS, LENGTHS } from '../lib/tips.js'
import { listClients } from '../lib/clients.js'

// recherche insensible à la casse et aux accents
const norm = (s) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

/** Étiquette courte : à quoi sert ce design (capsule, cliente, motif seul…) */
function designTag(d, clients) {
  const layers = d.layers?.length ? ` · ${d.layers.length + 1} motifs` : ''
  if (d.mode === 'direct' && d.client?.id) {
    const c = clients.find((x) => x.id === d.client.id)
    return `Ongle direct · ${c ? c.name : 'cliente supprimée'}${layers}`
  }
  if (d.tip?.brand) {
    const b = BRANDS.find((x) => x.id === d.tip.brand)
    const set = d.tipSet ? ' · set 10' : ` · taille ${d.tip.size}`
    return `${b?.name || 'Capsule'} ${LENGTHS[d.tip.length]?.label.toLowerCase() || ''}${set}${layers}`
  }
  if (!d.shape || d.shape === 'none') return `Motif seul · ${Math.round(d.img.w)} mm${layers}`
  return `Ongle ${d.nailW} × ${d.nailH} mm${layers}`
}

export default function Library({
  designs, onImport, onMotif, onOpen, onTrace, onDelete, onDuplicate, onCalibrate, onClients, onRestored, onGuide,
  calibrated, busy,
}) {
  const input = useRef(null)
  const [showMotifs, setShowMotifs] = useState(false)
  const [showBackup, setShowBackup] = useState(false)
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('recent')
  const clients = useMemo(listClients, [designs])

  const shown = useMemo(() => {
    const q = norm(query.trim())
    const list = q ? designs.filter((d) => norm(d.name).includes(q) || norm(designTag(d, clients)).includes(q)) : designs
    return sort === 'name' ? [...list].sort((a, b) => a.name.localeCompare(b.name, 'fr')) : list
  }, [designs, query, sort, clients])
  return (
    <div className="screen library">
      <header className="lib-head">
        <div className="brand">
          <div className="logo">o</div>
          <div>
            <div className="eyebrow gold">BY BERRY</div>
            <div className="title">ONGLE TRACE</div>
          </div>
        </div>
        <p className="tagline">
          Une table lumineuse pour nail artists. Importe une référence, pose ta capsule sur l'écran et laisse tes mains faire le travail.
        </p>
        <div className="row">
          <button className="pink big" disabled={busy} onClick={() => input.current.click()}>
            {busy ? 'Traitement…' : '+ Importer une image'}
          </button>
          <button className="ghost dark" disabled={busy} onClick={() => setShowMotifs((v) => !v)}>✨ Motifs</button>
          <button className="ghost dark" onClick={onCalibrate}>📏 Calibrer l'écran</button>
          <button className="ghost dark" onClick={onClients}>👤 Clientes</button>
          <button className="ghost dark" onClick={() => setShowBackup((v) => !v)}>💾 Sauvegarde</button>
          <button className="ghost dark" onClick={onGuide}>❓ Guide</button>
        </div>
        {!calibrated && (
          <div className="banner">
            <span>
              <b>Écran pas encore calibré</b> — les tailles en mm sont approximatives tant que tu n'as pas calibré cet
              appareil (30 secondes, avec une carte bancaire).
            </span>
            <button className="pink" onClick={onCalibrate}>📏 Calibrer</button>
          </div>
        )}
        {showBackup && <BackupPanel onRestored={onRestored} />}
        {showMotifs && <MotifPicker busy={busy} onPick={onMotif} />}
        <input
          ref={input}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0]
            e.target.value = ''
            if (f) onImport(f)
          }}
        />
      </header>

      {designs.length > 0 && (
        <div className="lib-tools">
          <input
            className="text-input search"
            type="search"
            placeholder="🔍 Rechercher un design…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select className="sort" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Trier">
            <option value="recent">Récents</option>
            <option value="name">Nom A→Z</option>
          </select>
        </div>
      )}

      {designs.length === 0 ? (
        <p className="empty">Aucun design pour l'instant. Importe un dessin ou une photo, ou pars d'un ✨ motif.</p>
      ) : shown.length === 0 ? (
        <p className="empty">Aucun design ne correspond à « {query} ».</p>
      ) : (
        <ul className="cards">
          {shown.map((d) => (
            <li key={d.id} className="card">
              <button className="thumb" onClick={() => onOpen(d)}>
                <img src={d.lineart} alt="" />
              </button>
              <div className="card-body">
                <b>{d.name}</b>
                <span className="tag">{designTag(d, clients)}</span>
                <div className="row">
                  <button className="chip" onClick={() => onOpen(d)}>Éditer</button>
                  <button className="chip gold" onClick={() => onTrace(d)}>Tracer</button>
                  <button className="chip" onClick={() => onDuplicate(d)} title="Dupliquer">⧉</button>
                  <button
                    className="chip danger"
                    onClick={() => confirm(`Supprimer « ${d.name} » ?`) && onDelete(d)}
                  >
                    ✕
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
