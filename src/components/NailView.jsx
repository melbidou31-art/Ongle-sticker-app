import { useRef } from 'react'
import { nailPath } from '../lib/shapes.js'

const PAD = 4 // marge autour de l'ongle, en mm

/**
 * Affiche l'ongle à taille réelle (pxPerMm) avec le motif.
 * Forme 'none' : le motif seul, directement sur le quadrillage (sans contour d'ongle).
 * Si `onMove` est fourni : glisser = déplacer, pincer = agrandir/réduire.
 */
export default function NailView({
  design, pxPerMm, onMove, onErase, showOutline = true, clipKey = '', colors, lineColor, dark = false, activeLayer,
}) {
  const { nailW, nailH, shape, img, flip, clip, text, lineart, aspect } = design
  // calque couleurs : réglage du design, sauf si l'écran de traçage le force
  const showColors = colors ?? !!design.colors?.on
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

  // calques : motifs supplémentaires ; `activeLayer` (id, ou null = motif principal) est celui qu'on déplace
  const layers = design.layers || []
  const moving = (activeLayer && layers.find((l) => l.id === activeLayer)?.img) || img

  const pointers = useRef(new Map())
  const start = useRef(null)
  const erasing = useRef(false)

  // Position du pointeur en coordonnées relatives à l'image (0–1), en tenant compte de rotation et miroir
  function toImage(e) {
    const svg = e.currentTarget
    const p = svg.createSVGPoint()
    p.x = e.clientX
    p.y = e.clientY
    const q = p.matrixTransform(svg.getScreenCTM().inverse())
    const a = (-img.rot * Math.PI) / 180
    const dx = q.x - cx
    const dy = q.y - cy
    let lx = dx * Math.cos(a) - dy * Math.sin(a)
    const ly = dx * Math.sin(a) + dy * Math.cos(a)
    if (flip) lx = -lx
    return [(lx + iw / 2) / iw, (ly + ih / 2) / ih]
  }

  function onPointerDown(e) {
    if (onErase) {
      try {
        e.currentTarget.setPointerCapture(e.pointerId)
      } catch {}
      erasing.current = true
      return onErase.start(...toImage(e))
    }
    if (!onMove) return
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {}
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    start.current = { img: { ...moving }, pts: new Map(pointers.current) }
  }

  function onPointerMove(e) {
    if (onErase) return erasing.current && onErase.move(...toImage(e))
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
    erasing.current = false
    pointers.current.delete(e.pointerId)
    start.current = { img: { ...moving }, pts: new Map(pointers.current) }
  }

  return (
    <svg
      className="nail-svg"
      width={W * pxPerMm}
      height={H * pxPerMm}
      viewBox={`0 0 ${W} ${H}`}
      style={{
        touchAction: onMove || onErase ? 'none' : 'auto',
        cursor: onErase ? 'crosshair' : onMove ? 'grab' : 'default',
        overflow: 'visible',
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {lineColor && (
        // recolore le trait noir (garde sa transparence)
        <defs>
          <filter id={`${clipId}-ink`}>
            <feFlood floodColor={lineColor} />
            <feComposite in2="SourceGraphic" operator="in" />
          </filter>
        </defs>
      )}
      {!free && (
        <>
          <defs>
            <clipPath id={clipId}>
              <path d={d} transform={`translate(${PAD} ${PAD})`} />
            </clipPath>
          </defs>
          <path d={d} transform={`translate(${PAD} ${PAD})`} fill={dark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.55)'} />
        </>
      )}
      <g clipPath={clip && !free ? `url(#${clipId})` : undefined}>
        {[{ id: null, img, lineart, original: design.original, aspect }, ...layers].map((m) => {
          const w = m.img.w
          const h = m.img.w * m.aspect
          return (
            <g
              key={m.id || 'main'}
              transform={`translate(${PAD + aw / 2 + m.img.x} ${PAD + ah / 2 + m.img.y}) rotate(${m.img.rot}) scale(${flip ? -1 : 1} 1)`}
            >
              {showColors && (
                // photo d'origine sous le trait ; « multiply » rend son fond blanc transparent sur la grille
                <image
                  href={m.original}
                  x={-w / 2}
                  y={-h / 2}
                  width={w}
                  height={h}
                  opacity={design.colors?.opacity ?? 0.4}
                  style={{ mixBlendMode: dark ? 'normal' : 'multiply' }}
                />
              )}
              <image
                href={m.lineart}
                x={-w / 2}
                y={-h / 2}
                width={w}
                height={h}
                filter={lineColor ? `url(#${clipId}-ink)` : undefined}
              />
              {onMove && activeLayer !== undefined && (m.id ?? null) === activeLayer && layers.length > 0 && (
                // cadre du motif sélectionné (éditeur uniquement)
                <rect x={-w / 2} y={-h / 2} width={w} height={h} fill="none" stroke="#e8a0b4" strokeWidth={0.2} strokeDasharray="1 0.6" />
              )}
            </g>
          )
        })}
        {text.value && (
          <text
            x={PAD + aw / 2}
            y={PAD + text.y}
            fontSize={text.size}
            textAnchor="middle"
            fontFamily="Georgia, serif"
            fill={lineColor || '#000'}
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
