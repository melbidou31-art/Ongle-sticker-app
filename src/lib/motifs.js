// Bibliothèque de motifs au trait, dessinés dans une boîte 100 × 100.
// Chaque motif est du SVG (traits noirs) converti en image au moment de créer le design.

const range = (n) => Array.from({ length: n }, (_, i) => i)
const rot = (deg, inner) => `<g transform="rotate(${deg} 50 50)">${inner}</g>`

const butterflyWing = `
  <path d="M50 32 C38 6 6 8 12 36 C15 50 34 52 50 48 Z"/>
  <path d="M50 52 C32 52 16 66 26 82 C34 92 48 74 50 58 Z"/>`

export const MOTIFS = [
  { id: 'coeur', name: 'Cœur', svg: '<path d="M50 86 C20 66 8 46 18 29 C28 13 46 18 50 33 C54 18 72 13 82 29 C92 46 80 66 50 86 Z"/>' },
  { id: 'etoile', name: 'Étoile', svg: '<path d="M50 8 L61 38 L93 38 L67 57 L77 89 L50 70 L23 89 L33 57 L7 38 L39 38 Z"/>' },
  {
    id: 'lune',
    name: 'Lune & étoiles',
    svg: `<path d="M58 14 A36 36 0 1 0 86 72 A29 29 0 1 1 58 14 Z"/>
      <path d="M78 18 L80 24 L86 26 L80 28 L78 34 L76 28 L70 26 L76 24 Z"/>
      <path d="M86 44 L87 47 L90 48 L87 49 L86 52 L85 49 L82 48 L85 47 Z"/>`,
  },
  {
    id: 'fleur',
    name: 'Fleur',
    svg: range(5).map((i) => rot(i * 72, '<ellipse cx="50" cy="27" rx="13" ry="20"/>')).join('') + '<circle cx="50" cy="50" r="9"/>',
  },
  {
    id: 'marguerite',
    name: 'Marguerite',
    svg: range(10).map((i) => rot(i * 36, '<path d="M50 40 C44 28 44 12 50 8 C56 12 56 28 50 40 Z"/>')).join('') + '<circle cx="50" cy="50" r="10"/>',
  },
  {
    id: 'papillon',
    name: 'Papillon',
    svg: `${butterflyWing}<g transform="translate(100 0) scale(-1 1)">${butterflyWing}</g>
      <path d="M50 28 L50 80"/><path d="M50 30 C46 20 42 16 38 14"/><path d="M50 30 C54 20 58 16 62 14"/>`,
  },
  {
    id: 'noeud',
    name: 'Nœud',
    svg: `<path d="M44 46 C32 28 10 30 12 46 C12 62 32 64 44 50 Z"/>
      <path d="M56 46 C68 28 90 30 88 46 C88 62 68 64 56 50 Z"/>
      <rect x="43" y="40" width="14" height="14" rx="4"/>
      <path d="M46 54 L36 84 L44 80 L48 88"/><path d="M54 54 L64 84 L56 80 L52 88"/>`,
  },
  { id: 'eclair', name: 'Éclair', svg: '<path d="M58 6 L28 54 L48 54 L40 94 L74 40 L53 40 Z"/>' },
  {
    id: 'goutte',
    name: 'Goutte',
    svg: '<path d="M50 8 C50 8 20 48 20 64 A30 30 0 0 0 80 64 C80 48 50 8 50 8 Z"/><path d="M34 66 A16 16 0 0 0 44 80"/>',
  },
  {
    id: 'feuille',
    name: 'Feuille',
    svg: `<path d="M50 92 C14 70 14 26 50 8 C86 26 86 70 50 92 Z"/><path d="M50 96 L50 16"/>
      ${range(4).map((i) => `<path d="M50 ${74 - i * 14} L${34 + i * 2} ${62 - i * 14}"/><path d="M50 ${74 - i * 14} L${66 - i * 2} ${62 - i * 14}"/>`).join('')}`,
  },
  {
    id: 'flocon',
    name: 'Flocon',
    svg: range(6).map((i) => rot(i * 60, '<path d="M50 50 L50 8"/><path d="M50 22 L42 14"/><path d="M50 22 L58 14"/><path d="M50 34 L44 28"/><path d="M50 34 L56 28"/>')).join(''),
  },
  {
    id: 'toile',
    name: "Toile d'araignée",
    svg:
      range(8).map((i) => rot(i * 45, '<path d="M50 50 L50 4"/>')).join('') +
      [14, 26, 38].map((r) => {
        const pts = range(9).map((i) => {
          const a = (i * 45 * Math.PI) / 180
          return `${(50 + r * Math.sin(a)).toFixed(1)} ${(50 - r * Math.cos(a)).toFixed(1)}`
        })
        // fils légèrement creusés vers le centre entre deux rayons
        return `<path d="M${pts[0]} ${pts.slice(1).map((p, i) => {
          const a = ((i + 0.5) * 45 * Math.PI) / 180
          return `Q${(50 + r * 0.8 * Math.sin(a)).toFixed(1)} ${(50 - r * 0.8 * Math.cos(a)).toFixed(1)} ${p}`
        }).join(' ')}"/>`
      }).join(''),
  },
  {
    id: 'french',
    name: 'Ligne French',
    svg: '<path d="M6 58 Q50 22 94 58"/><path d="M6 66 Q50 30 94 66" stroke-dasharray="3 5"/>',
  },
  {
    id: 'chevrons',
    name: 'Chevrons',
    svg: range(4).map((i) => `<path d="M12 ${22 + i * 18} L50 ${8 + i * 18} L88 ${22 + i * 18}"/>`).join(''),
  },
]

export function motifSVG(m) {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-6 -6 112 112">` +
    `<g fill="none" stroke="#000" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${m.svg}</g></svg>`
  )
}

/** Rend le motif sur un canvas blanc (1000 px) pour créer un design comme une image importée. */
export async function motifCanvas(m, size = 1000) {
  const img = new Image()
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(motifSVG(m))
  await img.decode()
  const c = document.createElement('canvas')
  c.width = c.height = size
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, size, size)
  ctx.drawImage(img, 0, 0, size, size)
  return c
}
