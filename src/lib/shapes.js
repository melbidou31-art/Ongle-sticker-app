// Formes d'ongle, en millimètres. Cuticule en haut (y = 0), bord libre en bas (y = h).
import { customPath, findCustomShape, isCustomShape, listCustomShapes } from './customShapes.js'

export const SHAPES = {
  none: 'Aucun (motif seul)',
  coffin: 'Ballerine',
  almond: 'Amande',
  stiletto: 'Stiletto',
  oval: 'Ovale',
  round: 'Rond',
  squoval: 'Carré arrondi',
  square: 'Carré',
}

// À longueur commerciale égale (« M »…), les capsules pointues sont plus longues que les carrées.
// Coefficients approximatifs appliqués à la longueur choisie (cf. IMPROVEMENTS.md).
export const SHAPE_LENGTH = { stiletto: 1.25, almond: 1.12, coffin: 1, oval: 1, round: 0.95, squoval: 0.95, square: 0.95 }

/** Formes de l'app + formes dessinées à la main (« Mes capsules »), pour les sélecteurs. */
export function allShapes() {
  const out = { ...SHAPES }
  for (const s of listCustomShapes()) out[s.id] = `✍ ${s.name}`
  return out
}

/**
 * Capsule mesurée à l'écran : flancs droits, cuticule arrondie et bout dont la courbe se règle,
 * de 0 (bout droit, comme un carré) à 100 (bout en demi-cercle, comme un rond).
 */
export function capsulePath(w, h, curve) {
  const c = w * 0.32
  const top = `M 0 ${c} C 0 ${-c * 0.2}, ${w} ${-c * 0.2}, ${w} ${c}`
  // profondeur de la courbe du bout, sans dépasser la place laissée par la cuticule
  const d = Math.min(Math.max(0, h - c - 1), (Math.max(0, Math.min(100, curve)) / 100) * (w / 2))
  if (d < 0.4) {
    const r = 0.4
    return `${top} L ${w} ${h - r} Q ${w} ${h}, ${w - r} ${h} L ${r} ${h} Q 0 ${h}, 0 ${h - r} Z`
  }
  return `${top} L ${w} ${h - d} A ${w / 2} ${d} 0 0 1 0 ${h - d} Z`
}

export function nailPath(shape, w, h) {
  if (isCustomShape(shape)) {
    const custom = findCustomShape(shape)
    if (custom) return customPath(custom, w, h)
    shape = 'oval' // forme perso supprimée : repli sur une forme standard
  }
  const c = w * 0.32 // profondeur de l'arrondi de la cuticule
  const top = `M 0 ${c} C 0 ${-c * 0.2}, ${w} ${-c * 0.2}, ${w} ${c}`
  switch (shape) {
    case 'coffin': {
      // ballerine : flancs droits le long du lit de l'ongle, puis s'affinent en ligne droite vers un bout plat
      const tw = w * 0.58
      const r = w * 0.06 // coins du bout légèrement adoucis
      const a = h * 0.36 // fin de la partie droite
      return `${top} L ${w} ${a} L ${w / 2 + tw / 2} ${h - r} Q ${w / 2 + tw / 2} ${h}, ${w / 2 + tw / 2 - r} ${h}
        L ${w / 2 - tw / 2 + r} ${h} Q ${w / 2 - tw / 2} ${h}, ${w / 2 - tw / 2} ${h - r} L 0 ${a} Z`
    }
    case 'almond':
      // amande : flancs droits, puis se resserrent en courbe vers un bout pointu mais arrondi
      return `${top} L ${w} ${h * 0.4} C ${w} ${h * 0.74}, ${w * 0.66} ${h}, ${w / 2} ${h}
        C ${w * 0.34} ${h}, 0 ${h * 0.74}, 0 ${h * 0.4} Z`
    case 'stiletto':
      // stiletto : flancs droits sur le lit de l'ongle, puis s'affinent en longue courbe jusqu'à une pointe nette
      // (points de contrôle à l'extérieur de la corde → flancs légèrement bombés, jamais creusés)
      return `${top} L ${w} ${h * 0.36} C ${w} ${h * 0.64}, ${w * 0.76} ${h * 0.88}, ${w / 2} ${h}
        C ${w * 0.24} ${h * 0.88}, 0 ${h * 0.64}, 0 ${h * 0.36} Z`
    case 'oval':
      // bout en ellipse, plus allongé que le rond
      return `${top} L ${w} ${h * 0.55} C ${w} ${h * 0.85}, ${w * 0.72} ${h}, ${w / 2} ${h}
        C ${w * 0.28} ${h}, 0 ${h * 0.85}, 0 ${h * 0.55} Z`
    case 'round':
      // bout en demi-cercle
      return `${top} L ${w} ${h - w / 2} A ${w / 2} ${w / 2} 0 0 1 0 ${h - w / 2} Z`
    case 'squoval': {
      const r = w / 4
      return `${top} L ${w} ${h - r} Q ${w} ${h}, ${w - r} ${h} L ${r} ${h} Q 0 ${h}, 0 ${h - r} Z`
    }
    case 'square':
    default: {
      // coins nets (très léger adoucissement pour un tracé propre)
      const r = 0.4
      return `${top} L ${w} ${h - r} Q ${w} ${h}, ${w - r} ${h} L ${r} ${h} Q 0 ${h}, 0 ${h - r} Z`
    }
  }
}
