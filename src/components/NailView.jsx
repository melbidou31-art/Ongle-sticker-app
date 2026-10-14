import { useRef } from 'react'
import { nailPath } from '../lib/shapes.js'

const PAD = 4 // marge autour de l'ongle, en mm

/**
 * Affiche l'ongle à taille réelle (pxPerMm) avec le motif.
 * Si `onMove` est fourni : glisser = déplacer, pincer = agrandir/réduire.
 */
export default function NailView({ design, pxPerMm, onMove, showOutline = true }) {
  const { nailW, nailH, shape, img, flip, clip, text, lineart, aspect } = design
  const W = nailW + PAD * 2
  const H = nailH + PAD * 2
  const d = nailPath(shape, nailW, nailH)
  const iw = img.w
  const ih = img.w * aspect
  const cx = PAD + nailW / 2 + img.x
  const cy = PAD + nailH / 2 + img.y
  const clipId = `clip-${design.id}`

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
      style={{ touchAction: onMove ? 'none' : 'auto', cursor: onMove ? 'grab' : 'default' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <defs>
        <clipPath id={clipId}>
          <path d={d} transform={`translate(${PAD} ${PAD})`} />
        </clipPath>
      </defs>
      <path d={d} transform={`translate(${PAD} ${PAD})`} fill="rgba(255,255,255,0.55)" />
      <g clipPath={clip ? `url(#${clipId})` : undefined}>
        <g transform={`translate(${cx} ${cy}) rotate(${img.rot}) scale(${flip ? -1 : 1} 1)`}>
          <image href={lineart} x={-iw / 2} y={-ih / 2} width={iw} height={ih} />
        </g>
        {text.value && (
          <text
            x={PAD + nailW / 2}
            y={PAD + text.y}
            fontSize={text.size}
            textAnchor="middle"
            fontFamily="Georgia, serif"
            transform={flip ? `translate(${2 * (PAD + nailW / 2)} 0) scale(-1 1)` : undefined}
          >
            {text.value}
          </text>
        )}
      </g>
      {showOutline && (
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
