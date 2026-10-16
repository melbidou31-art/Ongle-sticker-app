import { useRef } from 'react'

/**
 * Glisser (1 doigt) pour déplacer une image, pincer (2 doigts) pour la redimensionner.
 * `img` = { x, y, w, … } en mm ; `onMove(img)` reçoit la nouvelle position / taille.
 * Renvoie les gestionnaires d'événements à poser sur l'élément qui reçoit les touches
 * (l'ongle lui-même, ou toute la zone quadrillée pour ne pas avoir à viser l'ongle).
 */
export default function useMoveGesture(img, pxPerMm, onMove) {
  const pointers = useRef(new Map())
  const start = useRef(null)
  // toujours partir de la position la plus récente (sinon l'image « sautait » quand un 2e doigt se posait
  // avant que l'écran ait suivi le 1er)
  const latest = useRef(img)
  latest.current = img

  const reset = () => (start.current = { img: { ...latest.current }, pts: new Map(pointers.current) })

  return {
    onPointerDown(e) {
      if (!onMove || e.target.closest?.('button')) return // les boutons posés sur la zone (zoom…) restent cliquables
      try {
        e.currentTarget.setPointerCapture(e.pointerId)
      } catch {}
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
      reset()
    },
    onPointerMove(e) {
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
    },
    onPointerUp(e) {
      if (!pointers.current.has(e.pointerId)) return
      pointers.current.delete(e.pointerId)
      reset()
    },
  }
}
