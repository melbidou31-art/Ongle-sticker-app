import { useEffect, useState } from 'react'
import { extractPalette } from '../lib/palette.js'

/**
 * Couleurs dominantes de l'image d'origine, pour choisir ses vernis.
 * Calculée à la demande ; un appui sur une couleur l'ajoute aux notes du design.
 */
export default function PalettePanel({ src, notes, onAddToNotes }) {
  const [open, setOpen] = useState(false)
  const [palette, setPalette] = useState(null)
  const [error, setError] = useState(false)

  // recalcul si l'image change (recadrage…) pendant que la palette est affichée
  useEffect(() => {
    if (!open || !src) return
    let alive = true
    setPalette(null)
    setError(false)
    extractPalette(src)
      .then((p) => alive && setPalette(p))
      .catch(() => alive && setError(true))
    return () => {
      alive = false
    }
  }, [open, src])

  if (!src) return null
  if (!open)
    return (
      <button className="chip" onClick={() => setOpen(true)}>
        🎨 Palette de couleurs du motif
      </button>
    )

  return (
    <div className="palette">
      <div className="row">
        <span className="muted">Couleurs dominantes de l'image — touche une couleur pour l'ajouter aux notes</span>
        <button className="chip mini" onClick={() => setOpen(false)} aria-label="Masquer la palette">✕</button>
      </div>
      {error && <p className="approx">Impossible d'analyser cette image.</p>}
      {!palette && !error && <p className="muted">Analyse…</p>}
      {palette && (
        <div className="swatches">
          {palette.map((p) => {
            const added = (notes || '').includes(p.hex)
            return (
              <button
                key={p.hex}
                className={`palette-swatch ${added ? 'on' : ''}`}
                onClick={() => !added && onAddToNotes(p.hex)}
                title={added ? 'Déjà dans les notes' : `Ajouter ${p.hex} aux notes`}
              >
                <span className="dot" style={{ background: p.hex }} />
                <b>{p.hex}</b>
                <small>{added ? '✓ noté' : `${Math.round(p.share * 100)} %`}</small>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
