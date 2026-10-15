// Set complet de 10 ongles : dimensions de chaque doigt selon le mode du design.
import { listClients, resizeNail } from './clients.js'
import { findBrand, getMeasures, tipLength, tipWidth } from './tips.js'

// Écart de taille habituel d'un set press-on, à partir de la taille du pouce
// (pouce, index, majeur, annulaire, auriculaire) — approx., à ajuster par cliente
const SET_OFFSETS = [0, 4, 3, 4, 7]

/** Tailles par défaut d'un set de 10 pour une marque, autour de la taille actuelle. */
export function defaultTipSet(brandId, thumbSize) {
  const sizes = findBrand(brandId)?.sizes || []
  let t = sizes.findIndex((s) => s.label === thumbSize)
  if (t < 0) t = 1
  // le pouce doit laisser de la place aux doigts plus petits (sinon tout le set prenait la même taille)
  t = Math.max(0, Math.min(t, sizes.length - 1 - Math.max(...SET_OFFSETS)))
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
    return width ? { w: width.w, h: tipLength(t.length, design.shape), size: design.tipSet[finger] } : null
  }
  return null
}

export const hasSet = (design) => !!fingerDims(design, 0)

// Champs du « motif » d'un design (ce qu'on emprunte pour un ongle accent) ; la forme, la capsule,
// la cliente, le French et le miroir restent ceux du set.
const MOTIF_FIELDS = ['lineart', 'original', 'cropOriginal', 'colorSrc', 'aspect', 'img', 'layers', 'text', 'colors']

/**
 * Variante du design mise aux dimensions d'un doigt (le motif suit proportionnellement).
 * Ongle accent : si `design.accents[finger]` désigne un autre design (présent dans `others`, id → design),
 * son motif remplace celui du set sur ce doigt, mis à l'échelle de l'ongle.
 */
export function forFinger(design, finger, others = {}) {
  const d = fingerDims(design, finger)
  if (!d) return design
  let base = design
  const other = others[design.accents?.[finger]]
  if (other) {
    base = { ...design }
    for (const k of MOTIF_FIELDS) base[k] = other[k]
    // le motif emprunté est placé par rapport à son propre ongle : on part de ses dimensions
    if (other.shape !== 'none') Object.assign(base, { nailW: other.nailW, nailH: other.nailH })
  }
  return { ...base, ...resizeNail(base, d.w, d.h) }
}

/** Index id → design, pour retrouver les motifs des ongles accent. */
export const byId = (designs) => Object.fromEntries(designs.map((x) => [x.id, x]))
