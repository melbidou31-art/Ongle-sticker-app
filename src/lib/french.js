// Gabarit French : ligne du « sourire » tracée en vecteur, en mm, dans l'ongle.
// Les cotes sont fixes en millimètres, donc la ligne s'adapte à la largeur de chaque doigt / capsule.

export const FRENCH_STYLES = {
  classic: 'Classique',
  v: 'En V',
  oblique: 'Oblique',
  deep: 'Sourire profond',
}

export const DEFAULT_FRENCH = { on: false, style: 'classic', height: 7, depth: 2.5, double: false, gap: 1.2 }

/**
 * Tracé(s) de la ligne pour un ongle de w × h mm (cuticule en haut, bord libre en bas).
 * height = hauteur du bord blanc au centre (depuis le bord libre) ; depth = remontée vers les parois.
 * Renvoie une liste de chemins SVG (1 ou 2 avec le double french).
 */
export function frenchPaths(f, w, h) {
  const line = (y0, depth) => {
    switch (f.style) {
      case 'v':
        return `M 0 ${y0 - depth} L ${w / 2} ${y0} L ${w} ${y0 - depth}`
      case 'oblique':
        return `M 0 ${y0 - depth} L ${w} ${y0 + depth * 0.6}`
      case 'deep':
        // sourire très creusé : les coins remontent nettement le long des parois
        return `M 0 ${y0 - depth * 2} C ${w * 0.15} ${y0 + depth * 0.6}, ${w * 0.85} ${y0 + depth * 0.6}, ${w} ${y0 - depth * 2}`
      case 'classic':
      default:
        // le point de contrôle à y0 + depth place le bas de la courbe exactement à y0 au centre
        return `M 0 ${y0 - depth} Q ${w / 2} ${y0 + depth}, ${w} ${y0 - depth}`
    }
  }
  const y0 = h - f.height
  const paths = [line(y0, f.depth)]
  if (f.double) paths.push(line(y0 - f.gap, f.depth))
  return paths
}
