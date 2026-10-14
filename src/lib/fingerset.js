// Set complet de 10 ongles : dimensions de chaque doigt selon le mode du design.
import { listClients, resizeNail } from './clients.js'
import { BRANDS, LENGTHS, getMeasures, tipWidth } from './tips.js'

// Écart de taille habituel d'un set press-on, à partir de la taille du pouce
// (pouce, index, majeur, annulaire, auriculaire) — approx., à ajuster par cliente
const SET_OFFSETS = [0, 4, 3, 4, 7]

/** Tailles par défaut d'un set de 10 pour une marque, autour de la taille actuelle. */
export function defaultTipSet(brandId, thumbSize) {
  const sizes = BRANDS.find((b) => b.id === brandId)?.sizes || []
  let t = sizes.findIndex((s) => s.label === thumbSize)
  if (t < 0) t = 1
  const hand = SET_OFFSETS.map((o) => sizes[Math.min(sizes.length - 1, t + o)]?.label)
  return [...hand, ...hand]
}

/** Dimensions {w, h, label} du doigt `finger` (0–9), ou null si le design n'a pas de set. */
export function fingerDims(design, finger) {
  if (design.mode === 'direct' && design.client?.id) {
    const c = listClients().find((x) => x.id === design.client.id)
    return c ? { ...c.nails[finger] } : null
  }
  const t = design.tip
  if (t?.brand && design.tipSet?.[finger]) {
    const width = tipWidth(t.brand, design.tipSet[finger], getMeasures())
    return width ? { w: width.w, h: LENGTHS[t.length].mm, size: design.tipSet[finger] } : null
  }
  return null
}

export const hasSet = (design) => !!fingerDims(design, 0)

/** Variante du design mise aux dimensions d'un doigt (le motif suit proportionnellement). */
export function forFinger(design, finger) {
  const d = fingerDims(design, finger)
  return d ? { ...design, ...resizeNail(design, d.w, d.h) } : design
}
