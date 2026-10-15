// Tailles de capsules (press-on / soft gel) par marque.
// Aucune marque ne publie de tableau en mm facile d'accès : les largeurs ci-dessous sont des
// APPROXIMATIONS (≈ 1 mm d'écart entre deux tailles, constaté par les utilisatrices).
// Pour un résultat exact, utiliser « Ma boîte » : on mesure ses propres capsules à l'écran.
import { getSetting, setSetting } from './db.js'
import { SHAPE_LENGTH } from './shapes.js'

// Longueurs de capsules, notées comme les tailles de vêtements (XS → XXL), approx. cuticule → bord libre, en mm.
// La même longueur s'applique aux 10 doigts d'un set.
export const LENGTHS = {
  xs: { label: 'XS', name: 'Extra court', mm: 14 },
  s: { label: 'S', name: 'Très court', mm: 17 },
  m: { label: 'M', name: 'Court', mm: 20 },
  l: { label: 'L', name: 'Moyen', mm: 26 },
  xl: { label: 'XL', name: 'Long', mm: 32 },
  xxl: { label: 'XXL', name: 'Très long', mm: 38 },
}

// anciennes clés (designs enregistrés avant) → nouvelles
const LEGACY = { short: 'm', medium: 'l', long: 'xl', xlong: 'xxl' }
export const lengthKey = (k) => (LENGTHS[k] ? k : LEGACY[k] || 'l')

/** Longueur réelle d'une capsule : longueur commerciale × coefficient de la forme (stiletto plus long…). */
export const tipLength = (key, shape) =>
  Math.round(LENGTHS[lengthKey(key)].mm * (SHAPE_LENGTH[shape] ?? 1) * 2) / 2

// Génère une série de tailles : largeur de départ, pas de 1 mm
const series = (labels, firstW) => labels.map((label, i) => ({ label: String(label), w: firstW - i }))
const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i)

export const BRANDS = [
  {
    id: 'apres',
    name: 'Apres Gel-X',
    sizes: series(['00', 0, 1, 2, 3, 4, 4.5, 5, 5.5, 6, 6.5, 7, 8, 9], 18),
    source: 'apresnail.com (14 tailles, demi-tailles 4.5 / 5.5 / 6.5)',
  },
  { id: 'kiara', name: 'Kiara Sky Gelly Tips', sizes: series(range(0, 9), 17), source: 'Boîtes de 500, tailles 0 à 9' },
  { id: 'beetles', name: 'Beetles', sizes: series(range(0, 14), 18), source: 'beetlesgel.com (15 tailles, 0 à 14)' },
  { id: 'modelones', name: 'Modelones', sizes: series(range(0, 9), 17), source: 'Boîtes de 500, tailles 0 à 9' },
  { id: 'makartt', name: 'Makartt', sizes: series(range(0, 11), 17), source: 'Tailles 0 à 11 selon les boîtes' },
  { id: 'bornpretty', name: 'Born Pretty', sizes: series(range(0, 11), 17), source: 'Tailles 0 à 11 selon les boîtes' },
]

// Corrige les demi-tailles Apres : une demi-taille est à mi-chemin entre ses voisines
{
  const s = BRANDS[0].sizes
  let w = 18
  for (let i = 0; i < s.length; i++) {
    if (i > 0) w -= s[i].label.includes('.') || s[i - 1].label.includes('.') ? 0.5 : 1
    s[i].w = w
  }
}

// ---- Ma boîte : largeurs mesurées par l'utilisatrice, par marque et par taille ----
const KEY = 'tipMeasures'
export const getMeasures = () => getSetting(KEY, {})
export function saveMeasure(brandId, size, w) {
  const all = getMeasures()
  all[brandId] = { ...(all[brandId] || {}), [size]: Math.round(w * 10) / 10 }
  setSetting(KEY, all)
  return all
}

/** Largeur à utiliser : la mesure perso si elle existe, sinon la valeur approximative. */
export function tipWidth(brandId, size, measures = getMeasures()) {
  const measured = measures[brandId]?.[size]
  if (measured) return { w: measured, exact: true }
  const s = BRANDS.find((b) => b.id === brandId)?.sizes.find((x) => x.label === size)
  return s ? { w: s.w, exact: false } : null
}
