import { useRef } from 'react'
import { nailPath } from '../lib/shapes.js'

const PAD = 4 // marge autour de l'ongle, en mm

/**
 * Affiche l'ongle à taille réelle (pxPerMm) avec le motif.
 * Forme 'none' : le motif seul, directement sur le quadrillage (sans contour d'ongle).
 * Si `onMove` est fourni : glisser = déplacer, pincer = agrandir/réduire.
 */
export default function NailView({ design, pxPerMm, onMove, showOutline = true, clipKey = '' }) {
  const { nailW, nailH, shape, img, flip, clip, text, lineart, aspect } = design
  const iw = img.w
  const ih = img.w * aspect
  const free = shape === 'none'
  // zone de référence : l'ongle, ou le motif lui-même en mode libre
  const aw = free ? iw : nailW
  const ah = free ? ih : nailH
  const W = aw + PAD * 2
  const H = ah + PAD * 2
  const d = free ? '' : nailPath(shape, nailW, nailH)
  const cx = PAD + aw / 2 + img.x
  const cy = PAD + ah / 2 + img.y
  // clipKey : plusieurs ongles du même design affichés ensemble (main entière)
  const clipId = `clip-${design.id}${clipKey}`

  const pointers = useRef(new Map())
  const start = useRef(null)

  function onPointerDown(e) {
    if (!onMove) return
    e.currentTarget.setPointerCapture(e.pointerId)
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    start.current = { img: { ...img }, pts: new Map(pointers.current) }
  }

  function onPointerMove(e) {
    if (!onMove || !pointers.current.has(e.pointerId)) return
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    const s = start.current
    const now = [...pointers.current.values()]
    const before = [...s.pts.values()]
    if (now.length === 1 && before.length === 1) {
      onMove({
        ...s.img,
        x: s.img.x + (now[0].x - before[0].x) / pxPerMm,
        y: s.img.y + (now[0].y - before[0].y) / pxPerMm,
      })
    } else if (now.length >= 2 && before.length >= 2) {
      const dist = (p) => Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y)
      const k = dist(now) / Math.max(1, dist(before))
      onMove({ ...s.img, w: Math.max(2, Math.min(60, s.img.w * k)) })
    }
  }

  function onPointerUp(e) {
    pointers.current.delete(e.pointerId)
    start.current = { img: { ...img }, pts: new Map(pointers.current) }
  }

  return (
    <svg
      className="nail-svg"
      width={W * pxPerMm}
      height={H * pxPerMm}
      viewBox={`0 0 ${W} ${H}`}
      style={{ touchAction: onMove ? 'none' : 'auto', cursor: onMove ? 'grab' : 'default', overflow: 'visible' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {!free && (
        <>
          <defs>
            <clipPath id={clipId}>
              <path d={d} transform={`translate(${PAD} ${PAD})`} />
            </clipPath>
          </defs>
          <path d={d} transform={`translate(${PAD} ${PAD})`} fill="rgba(255,255,255,0.55)" />
        </>
      )}
      <g clipPath={clip && !free ? `url(#${clipId})` : undefined}>
        <g transform={`translate(${cx} ${cy}) rotate(${img.rot}) scale(${flip ? -1 : 1} 1)`}>
          <image href={lineart} x={-iw / 2} y={-ih / 2} width={iw} height={ih} />
        </g>
        {text.value && (
          <text
            x={PAD + aw / 2}
            y={PAD + text.y}
            fontSize={text.size}
            textAnchor="middle"
            fontFamily="Georgia, serif"
            transform={flip ? `translate(${2 * (PAD + aw / 2)} 0) scale(-1 1)` : undefined}
          >
            {text.value}
          </text>
        )}
      </g>
      {showOutline && !free && (
        <path
          d={d}
          transform={`translate(${PAD} ${PAD})`}
          fill="none"
          stroke="#b9b3a8"
          strokeWidth={0.18}
          strokeDasharray="0.8 0.6"
        />
      )}
    </svg>
  )
}
