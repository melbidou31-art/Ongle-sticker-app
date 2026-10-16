// Formes de capsules dessinées à la main (contour tracé sur l'écran autour d'une vraie capsule).
// Le contour est stocké normalisé (0–1 en largeur et en hauteur) : il s'adapte ensuite à n'importe quelle taille.
import { getSetting, setSetting } from './db.js'

const KEY = 'customShapes'
export const listCustomShapes = () => getSetting(KEY, [])
export const findCustomShape = (id) => listCustomShapes().find((s) => s.id === id)
export const isCustomShape = (id) => typeof id === 'string' && id.startsWith('perso-')

export function saveCustomShape(shape) {
  const all = listCustomShapes().filter((s) => s.id !== shape.id)
  all.push(shape)
  setSetting(KEY, all)
  return all
}
export function deleteCustomShape(id) {
  const all = listCustomShapes().filter((s) => s.id !== id)
  setSetting(KEY, all)
  return all
}

/**
 * Transforme un tracé à main levée (points en mm) en forme normalisée :
 * cadre englobant → taille réelle (w, h) ; points espacés d'au moins `step` mm pour un contour léger et lisse.
 */
export function shapeFromStroke(ptsMm, name, step = 0.4) {
  const xs = ptsMm.map((p) => p[0])
  const ys = ptsMm.map((p) => p[1])
  const minX = Math.min(...xs)
  const minY = Math.min(...ys)
  const w = Math.max(...xs) - minX
  const h = Math.max(...ys) - minY
  const kept = []
  for (const p of ptsMm) {
    const last = kept[kept.length - 1]
    if (!last || Math.hypot(p[0] - last[0], p[1] - last[1]) >= step) kept.push(p)
  }
  return {
    id: `perso-${crypto.randomUUID().slice(0, 8)}`,
    name: (name || 'Ma capsule').slice(0, 24),
    w: Math.round(w * 10) / 10,
    h: Math.round(h * 10) / 10,
    pts: kept.map(([x, y]) => [+((x - minX) / w).toFixed(4), +((y - minY) / h).toFixed(4)]),
  }
}

/**
 * Forme perso à partir d'un chemin SVG tracé à la taille w × h mm (ex. capsule mesurée avec sa courbe) :
 * le contour est échantillonné puis normalisé, comme un contour dessiné à la main.
 */
export function shapeFromPath(d, w, h, id, name, extra = {}) {
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  path.setAttribute('d', d)
  const len = path.getTotalLength()
  const n = 96
  const pts = []
  for (let i = 0; i < n; i++) {
    const p = path.getPointAtLength((i / n) * len)
    pts.push([+(p.x / w).toFixed(4), +(p.y / h).toFixed(4)])
  }
  return { id, name: (name || 'Ma capsule').slice(0, 24), w, h, pts, ...extra }
}

/** Chemin SVG fermé et lissé (courbes passant par les milieux des segments) pour une taille w × h mm. */
export function customPath(shape, w, h) {
  const p = shape.pts.map(([x, y]) => [x * w, y * h])
  if (p.length < 3) return ''
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
  const f = (v) => v.toFixed(2)
  const start = mid(p[p.length - 1], p[0])
  let d = `M ${f(start[0])} ${f(start[1])}`
  for (let i = 0; i < p.length; i++) {
    const m = mid(p[i], p[(i + 1) % p.length])
    d += ` Q ${f(p[i][0])} ${f(p[i][1])}, ${f(m[0])} ${f(m[1])}`
  }
  return `${d} Z`
}
