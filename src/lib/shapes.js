// Formes d'ongle, en millimètres. Cuticule en haut (y = 0), bord libre en bas (y = h).

export const SHAPES = {
  none: 'Aucun (motif seul)',
  coffin: 'Ballerine',
  almond: 'Amande',
  stiletto: 'Stiletto',
  oval: 'Ovale',
  square: 'Carré',
}

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
      return `${top} C ${w} ${h * 0.5}, ${w * 0.56} ${h * 0.88}, ${w / 2} ${h}
        C ${w * 0.44} ${h * 0.88}, 0 ${h * 0.5}, 0 ${c} Z`
    case 'oval':
      return `${top} L ${w} ${h - w / 2} A ${w / 2} ${w / 2} 0 0 1 0 ${h - w / 2} Z`
    case 'square':
    default: {
      const r = Math.min(2, w / 6)
      return `${top} L ${w} ${h - r} Q ${w} ${h}, ${w - r} ${h} L ${r} ${h} Q 0 ${h}, 0 ${h - r} Z`
    }
  }
}
