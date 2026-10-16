import { useRef } from 'react'
import { nailPath } from '../lib/shapes.js'
import { frenchPaths } from '../lib/french.js'
import { DEFAULT_TEXT, fontFamily } from '../lib/fonts.js'
import useMoveGesture from '../lib/useMoveGesture.js'

const PAD = 4 // marge autour de l'ongle, en mm

/**
 * Affiche l'ongle à taille réelle (pxPerMm) avec le motif.
 * Forme 'none' : le motif seul, directement sur le quadrillage (sans contour d'ongle).
 * Si `onMove` est fourni : glisser = déplacer, pincer = agrandir/réduire.
 */
export default function NailView({
  design, pxPerMm, onMove, onErase, showOutline = true, clipKey = '', colors, lineColor, dark = false, activeLayer,
  guides,
}) {
  const { nailW, nailH, shape, img, flip, clip, text, lineart, aspect } = design
  // calque couleurs : réglage du design, sauf si l'écran de traçage le force
  const showColors = colors ?? !!design.colors?.on
  const french = design.french
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

  const gesture = useMoveGesture(moving, pxPerMm, onMove)
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
    gesture.onPointerDown(e)
  }

  function onPointerMove(e) {
    if (onErase) return erasing.current && onErase.move(...toImage(e))
    gesture.onPointerMove(e)
  }

  function onPointerUp(e) {
    erasing.current = false
    gesture.onPointerUp(e)
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
        {[{ id: null, img, lineart, original: design.cropOriginal || design.colorSrc || design.original, aspect }, ...layers].map((m) => {
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
        {text.value && (() => {
          const t = { ...DEFAULT_TEXT, ...text }
          const tx = PAD + aw / 2 + t.x
          const ty = PAD + t.y
          const ink = lineColor || '#000'
          // miroir global puis rotation du texte autour de son point d'ancrage
          const mirror = flip ? `translate(${2 * (PAD + aw / 2)} 0) scale(-1 1) ` : ''
          return (
            <text
              x={tx}
              y={ty}
              fontSize={t.size}
              textAnchor="middle"
              dominantBaseline="middle"
              fontFamily={fontFamily(t.font)}
              letterSpacing={t.spacing}
              // contour seul : on décalque le bord des lettres, puis on remplit au pinceau
              fill={t.outline ? 'none' : ink}
              stroke={t.outline ? ink : undefined}
              strokeWidth={t.outline ? Math.max(0.12, t.size * 0.04) : undefined}
              strokeLinejoin="round"
              transform={`${mirror}rotate(${t.rot} ${tx} ${ty})`}
            >
              {t.value}
            </text>
          )
        })()}
      </g>
      {french?.on && !free && (
        // ligne French en vecteur (millimètres), découpée à la forme de l'ongle
        <g clipPath={`url(#${clipId})`} pointerEvents="none">
          <g transform={`translate(${PAD} ${PAD})`}>
            {frenchPaths(french, nailW, nailH).map((p, i) => (
              <path
                key={i}
                d={p}
                fill="none"
                stroke={lineColor || '#000'}
                strokeWidth={0.3}
                strokeLinecap="round"
                strokeDasharray={i ? '1 0.7' : undefined}
              />
            ))}
          </g>
        </g>
      )}
      {guides?.on && (
        <g pointerEvents="none">
          {!free && guides.margin > 0 && (
            // bande « ne pas peindre » le long de la cuticule et des parois (à l'intérieur de l'ongle)
            // (le découpage est sur le groupe : sur le tracé lui-même, il hériterait de son décalage)
            <g clipPath={`url(#${clipId})`}>
              <path
                d={d}
                transform={`translate(${PAD} ${PAD})`}
                fill="none"
                stroke="rgba(224,0,90,0.22)"
                strokeWidth={guides.margin * 2}
              />
            </g>
          )}
          {/* axe central et mi-hauteur, pour centrer et garder la symétrie */}
          <path
            d={`M ${PAD + aw / 2} ${PAD - 1} V ${PAD + ah + 1} M ${PAD - 1} ${PAD + ah / 2} H ${PAD + aw + 1}`}
            stroke={dark ? 'rgba(201,169,110,0.7)' : 'rgba(150,110,40,0.6)'}
            strokeWidth={0.15}
            strokeDasharray="1 0.8"
          />
        </g>
      )}
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
