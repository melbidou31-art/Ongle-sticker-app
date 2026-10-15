import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const MIN = 0.05 // taille minimale de la zone (5 % de l'image)
const clamp = (v, a, b) => Math.max(a, Math.min(b, v))

/**
 * Recadrage : on garde seulement la partie utile de la photo (le motif, sans doigts ni fond).
 * La zone est exprimée en coordonnées relatives à l'image entière (0–1).
 */
export default function CropTool({ src, initial, onDone, onCancel }) {
  const box = useRef(null)
  const [c, setC] = useState(initial || { x: 0, y: 0, w: 1, h: 1 })
  const drag = useRef(null)

  function pos(e) {
    const b = box.current.getBoundingClientRect()
    return { u: (e.clientX - b.left) / b.width, v: (e.clientY - b.top) / b.height }
  }

  function down(kind) {
    return (e) => {
      e.preventDefault()
      e.stopPropagation()
      try {
        box.current.setPointerCapture(e.pointerId)
      } catch {}
      drag.current = { kind, start: pos(e), c0: c }
    }
  }

  function move(e) {
    const d = drag.current
    if (!d) return
    const p = pos(e)
    const du = p.u - d.start.u
    const dv = p.v - d.start.v
    const { x, y, w, h } = d.c0
    if (d.kind === 'move') return setC({ x: clamp(x + du, 0, 1 - w), y: clamp(y + dv, 0, 1 - h), w, h })
    // coins : on bouge le bord gauche/droit et haut/bas concernés
    let [l, t, r, b] = [x, y, x + w, y + h]
    if (d.kind.includes('l')) l = clamp(l + du, 0, r - MIN)
    if (d.kind.includes('r')) r = clamp(r + du, l + MIN, 1)
    if (d.kind.includes('t')) t = clamp(t + dv, 0, b - MIN)
    if (d.kind.includes('b')) b = clamp(b + dv, t + MIN, 1)
    setC({ x: l, y: t, w: r - l, h: b - t })
  }
  const up = () => (drag.current = null)

  const pct = (v) => `${v * 100}%`

  // portail : rendu au niveau de la page, jamais coupé par un conteneur qui défile (Safari iOS)
  return createPortal(
    <div className="measure-tool">
      <header className="topbar">
        <button className="ghost dark" onClick={onCancel}>Annuler</button>
        <div className="measure-value">
          <span className="eyebrow gold">RECADRER</span>
          <b>Garde seulement le motif</b>
        </div>
        <button className="pink" onClick={() => onDone(c)}>Valider</button>
      </header>
      <p className="muted pad">Déplace le cadre et tire ses coins pour entourer le motif à tracer.</p>
      <div className="crop-wrap">
        <div ref={box} className="crop-box" onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
          <img src={src} alt="" draggable={false} />
          <div
            className="crop-rect"
            style={{ left: pct(c.x), top: pct(c.y), width: pct(c.w), height: pct(c.h) }}
            onPointerDown={down('move')}
          >
            {['tl', 'tr', 'bl', 'br'].map((k) => (
              <span key={k} className={`crop-handle ${k}`} onPointerDown={down(k)} />
            ))}
          </div>
        </div>
      </div>
      <footer className="tool-footer">
        <button className="chip" onClick={() => setC({ x: 0, y: 0, w: 1, h: 1 })}>Image entière</button>
        <button className="pink big" onClick={() => onDone(c)}>✓ Valider</button>
      </footer>
    </div>,
    document.body,
  )
}
