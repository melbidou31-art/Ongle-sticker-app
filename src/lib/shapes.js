// Formes d'ongle, en millimètres. Cuticule en haut (y = 0), bord libre en bas (y = h).

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

export function nailPath(shape, w, h) {
  const c = w * 0.32 // profondeur de l'arrondi de la cuticule
  const top = `M 0 ${c} C 0 ${-c * 0.2}, ${w} ${-c * 0.2}, ${w} ${c}`
  switch (shape) {
    case 'coffin': {
      const tw = w * 0.56
      return `${top} C ${w} ${h * 0.45}, ${w / 2 + tw / 2} ${h * 0.8}, ${w / 2 + tw / 2} ${h}
        L ${w / 2 - tw / 2} ${h} C ${w / 2 - tw / 2} ${h * 0.8}, 0 ${h * 0.45}, 0 ${c} Z`
    }
    case 'almond':
      return `${top} C ${w} ${h * 0.7}, ${w * 0.64} ${h}, ${w / 2} ${h}
        C ${w * 0.36} ${h}, 0 ${h * 0.7}, 0 ${c} Z`
    case 'stiletto':
      // flancs presque droits qui se resserrent dès le premier tiers jusqu'à une pointe fine
      return `${top} C ${w} ${h * 0.32}, ${w * 0.66} ${h * 0.72}, ${w / 2} ${h}
        C ${w * 0.34} ${h * 0.72}, 0 ${h * 0.32}, 0 ${c} Z`
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
