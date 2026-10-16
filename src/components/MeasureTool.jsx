import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Grid from './Grid.jsx'
import { capsulePath } from '../lib/shapes.js'

const round = (v) => Math.round(v * 2) / 2 // au demi-millimètre

/**
 * Règle à l'écran (taille réelle grâce au calibrage) : on pose l'ongle ou la capsule sur l'écran
 * et on fait glisser les repères sur ses bords. Renvoie { w, h } en mm.
 * `withCurve` : en plus, la courbe du bout libre (0 = droit … 100 = demi-cercle) se règle sur la vraie capsule,
 * avec le contour dessiné par-dessus ; renvoie alors aussi `curve`.
 */
export default function MeasureTool({
  pxPerMm, title, initial = { w: 14, h: 20 }, withLength = true, withCurve = false, onDone, onCancel,
}) {
  const area = useRef(null)
  // positions des repères en mm, relatives au centre de la zone
  const [m, setM] = useState({ l: -initial.w / 2, r: initial.w / 2, t: -initial.h / 2, b: initial.h / 2 })
  const drag = useRef(null)
  const [curve, setCurve] = useState(initial.curve ?? 50)
  const nudgeCurve = (dv) => setCurve((c) => Math.max(0, Math.min(100, c + dv)))

  const w = round(m.r - m.l)
  const h = round(m.b - m.t)
  const result = withCurve ? { w, h, curve } : { w, h }
  const valueText = `${w} mm${withLength ? ` × ${h} mm` : ''}${withCurve ? ` · courbe ${curve} %` : ''}`

  function down(key) {
    return (e) => {
      e.preventDefault()
      drag.current = key
      try {
        e.currentTarget.setPointerCapture(e.pointerId)
      } catch {}
    }
  }
  function move(e) {
    if (!drag.current) return
    const box = area.current.getBoundingClientRect()
    const x = (e.clientX - box.left - box.width / 2) / pxPerMm
    const y = (e.clientY - box.top - box.height / 2) / pxPerMm
    setM((p) => {
      const k = drag.current
      if (k === 'l') return { ...p, l: Math.min(x, p.r - 3) }
      if (k === 'r') return { ...p, r: Math.max(x, p.l + 3) }
      if (k === 't') return { ...p, t: Math.min(y, p.b - 3) }
      return { ...p, b: Math.max(y, p.t + 3) }
    })
  }
  const up = () => (drag.current = null)

  const px = (v) => `calc(50% + ${v * pxPerMm}px)`

  // rendu au niveau de la page (portail) : à l'intérieur d'un panneau qui défile, Safari iOS coupait l'outil
  // et sa barre « Valider » devenait inaccessible
  return createPortal(
    <div className="measure-tool">
      <header className="topbar">
        <button className="ghost dark" onClick={onCancel}>Annuler</button>
        <div className="measure-value">
          <span className="eyebrow gold">{title}</span>
          <b>{valueText}</b>
        </div>
        <button className="pink" onClick={() => onDone(result)}>Valider</button>
      </header>
      <p className="muted pad">
        Pose l'ongle (ou la capsule) au centre et fais glisser les repères roses sur ses bords
        {withLength ? ' : largeur au point le plus large, longueur de la cuticule au bord libre.' : ' au point le plus large.'}
        {withCurve && ' Puis règle la courbe du bout pour que le contour rose suive celui de la capsule.'}
      </p>
      {withCurve && (
        <div className="curve-row pad">
          <span className="muted">Courbe du bout</span>
          <button className="chip mini" onClick={() => nudgeCurve(-5)} aria-label="Courbe : moins">−</button>
          <input type="range" min={0} max={100} step={1} value={curve} onChange={(e) => setCurve(+e.target.value)} aria-label="Courbe du bout" />
          <button className="chip mini" onClick={() => nudgeCurve(5)} aria-label="Courbe : plus">+</button>
          <small className="muted">{curve === 0 ? 'droit' : curve >= 95 ? 'rond' : `${curve} %`}</small>
        </div>
      )}
      <div ref={area} className="measure-area" onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
        <Grid pxPerMm={pxPerMm} className="measure-grid" />
        {withCurve && (
          // contour de la capsule à taille réelle, calé sur les repères
          <svg
            className="capsule-outline"
            style={{ left: px(m.l), top: px(m.t), width: (m.r - m.l) * pxPerMm, height: (m.b - m.t) * pxPerMm }}
            viewBox={`0 0 ${m.r - m.l} ${m.b - m.t}`}
          >
            <path d={capsulePath(m.r - m.l, m.b - m.t, curve)} fill="rgba(232, 160, 180, 0.12)" stroke="var(--pink)" strokeWidth={0.3} />
          </svg>
        )}
        <div className="guide v" style={{ left: px(m.l) }} />
        <div className="guide v" style={{ left: px(m.r) }} />
        <button className="handle v" style={{ left: px(m.l), top: '88%' }} onPointerDown={down('l')} aria-label="Bord gauche" />
        <button className="handle v" style={{ left: px(m.r), top: '88%' }} onPointerDown={down('r')} aria-label="Bord droit" />
        {withLength && (
          <>
            <div className="guide h" style={{ top: px(m.t) }} />
            <div className="guide h" style={{ top: px(m.b) }} />
            <button className="handle h" style={{ top: px(m.t), left: '88%' }} onPointerDown={down('t')} aria-label="Cuticule" />
            <button className="handle h" style={{ top: px(m.b), left: '88%' }} onPointerDown={down('b')} aria-label="Bord libre" />
          </>
        )}
      </div>
      <footer className="tool-footer">
        <button className="ghost dark" onClick={onCancel}>Annuler</button>
        <button className="pink big" onClick={() => onDone(result)}>✓ Valider {valueText}</button>
      </footer>
    </div>,
    document.body,
  )
}
