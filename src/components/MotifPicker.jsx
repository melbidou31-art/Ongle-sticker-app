import { useEffect, useRef, useState } from 'react'
import { MOTIFS, motifSVG } from '../lib/motifs.js'
import { deleteMyMotif } from '../lib/db.js'
import { listMyMotifs, motifFromFile } from '../lib/mymotifs.js'

const svgUrl = (m) => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(motifSVG(m))

/**
 * Choix d'un motif : « Mes motifs » (images enregistrées) puis motifs intégrés.
 * onPick({ kind: 'mine' | 'builtin', motif })
 */
export default function MotifPicker({ onPick, busy = false, small = false }) {
  const [mine, setMine] = useState([])
  const [adding, setAdding] = useState(false)
  const input = useRef(null)

  const reload = () => listMyMotifs().then(setMine).catch(() => setMine([]))
  useEffect(() => {
    reload()
  }, [])

  async function add(file) {
    setAdding(true)
    try {
      await motifFromFile(file)
      await reload()
    } catch (e) {
      console.error(e)
      alert("Impossible d'ajouter cette image.")
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="motif-picker">
      <div className="row">
        <span className="eyebrow gold">⭐ MES MOTIFS</span>
        <button className="chip mini" disabled={adding} onClick={() => input.current.click()}>
          {adding ? 'Ajout…' : '+ Ajouter une image'}
        </button>
      </div>
      {mine.length === 0 ? (
        <p className="muted">
          Aucun motif perso. Ajoute une image ici, ou « ⭐ Enregistrer dans Mes motifs » depuis l'éditeur (le trait
          nettoyé est gardé).
        </p>
      ) : (
        <div className={`motif-grid ${small ? 'small' : ''}`}>
          {mine.map((m) => (
            <div key={m.id} className="motif-cell">
              <button className="motif" disabled={busy} onClick={() => onPick({ kind: 'mine', motif: m })} title={m.name}>
                <img src={m.image} alt="" />
                {!small && <span>{m.name}</span>}
              </button>
              <button
                className="motif-del"
                aria-label={`Supprimer ${m.name}`}
                onClick={async () => {
                  if (!confirm(`Retirer « ${m.name} » de Mes motifs ?`)) return
                  await deleteMyMotif(m.id)
                  reload()
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
      <span className="eyebrow gold">✨ MOTIFS INTÉGRÉS</span>
      <div className={`motif-grid ${small ? 'small' : ''}`}>
        {MOTIFS.map((m) => (
          <button key={m.id} className="motif" disabled={busy} onClick={() => onPick({ kind: 'builtin', motif: m })} title={m.name}>
            <img src={svgUrl(m)} alt="" />
            {!small && <span>{m.name}</span>}
          </button>
        ))}
      </div>
      <input
        ref={input}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0]
          e.target.value = ''
          if (f) add(f)
        }}
      />
    </div>
  )
}
