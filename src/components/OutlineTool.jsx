import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Grid from './Grid.jsx'
import { shapeFromStroke } from '../lib/customShapes.js'

/**
 * Dessiner le contour d'une vraie capsule posée sur l'écran (cuticule en haut), au doigt ou au stylet.
 * Écran à taille réelle (calibrage) : le tracé donne la forme ET les dimensions exactes de la capsule.
 */
export default function OutlineTool({ pxPerMm, onDone, onCancel }) {
  const area = useRef(null)
  const drawing = useRef(false)
  const [pts, setPts] = useState([]) // points en mm, relatifs au coin de la zone
  const [name, setName] = useState('Ma capsule')

  function pos(e) {
    const b = area.current.getBoundingClientRect()
    return [(e.clientX - b.left) / pxPerMm, (e.clientY - b.top) / pxPerMm]
  }
  function down(e) {
    e.preventDefault()
    try {
      area.current.setPointerCapture(e.pointerId)
    } catch {}
    drawing.current = true
    setPts([pos(e)]) // un nouveau tracé remplace le précédent
  }
  function move(e) {
    if (drawing.current) setPts((p) => [...p, pos(e)])
  }
  const up = () => (drawing.current = false)

  // aperçu : cadre englobant du tracé, en mm
  const xs = pts.map((p) => p[0])
  const ys = pts.map((p) => p[1])
  const w = pts.length ? Math.max(...xs) - Math.min(...xs) : 0
  const h = pts.length ? Math.max(...ys) - Math.min(...ys) : 0
  const valid = pts.length > 15 && w > 4 && h > 4
  const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'} ${(x * pxPerMm).toFixed(1)} ${(y * pxPerMm).toFixed(1)}`).join(' ')

  // portail : rendu au niveau de la page, jamais coupé par le panneau qui défile (Safari iOS)
  return createPortal(
    <div className="measure-tool">
      <header className="topbar">
        <button className="ghost dark" onClick={onCancel}>Annuler</button>
        <div className="measure-value">
          <span className="eyebrow gold">CONTOUR DE CAPSULE</span>
          <b>{valid ? `${w.toFixed(1)} × ${h.toFixed(1)} mm` : 'Trace le contour'}</b>
        </div>
        <button className="pink" disabled={!valid} onClick={() => onDone(shapeFromStroke(pts, name))}>Valider</button>
      </header>
      <p className="muted pad">
        Pose la capsule à plat, <b>cuticule vers le haut</b>, et fais le tour de son bord d'un seul trait (un stylet aide).
        Recommence autant que tu veux : chaque nouveau tracé remplace le précédent.
      </p>
      <div className="row pad">
        <input className="text-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom de la forme" />
        <button className="chip" disabled={!pts.length} onClick={() => setPts([])}>Effacer</button>
      </div>
      <div ref={area} className="measure-area" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
        <Grid pxPerMm={pxPerMm} className="measure-grid" />
        <svg className="outline-svg" width="100%" height="100%">
          {pts.length > 1 && <path d={`${d}${drawing.current ? '' : ' Z'}`} fill="rgba(242,169,192,0.15)" stroke="#e0005a" strokeWidth="2" strokeLinejoin="round" />}
        </svg>
      </div>
      <footer className="tool-footer">
        <button className="ghost dark" onClick={onCancel}>Annuler</button>
        <button className="pink big" disabled={!valid} onClick={() => onDone(shapeFromStroke(pts, name))}>
          {valid ? `✓ Valider ${w.toFixed(1)} × ${h.toFixed(1)} mm` : 'Trace le contour…'}
        </button>
      </footer>
    </div>,
    document.body,
  )
}
