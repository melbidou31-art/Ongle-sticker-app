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

// Mode enfant : longueurs affichées directement en millimètres, adaptées aux petits ongles
export const KID_LENGTHS = {
  k8: { label: '8 mm', mm: 8 },
  k10: { label: '10 mm', mm: 10 },
  k12: { label: '12 mm', mm: 12 },
  k14: { label: '14 mm', mm: 14 },
  k16: { label: '16 mm', mm: 16 },
}
export const isKidLength = (k) => !!KID_LENGTHS[k]
const lengthInfo = (k) => LENGTHS[k] || KID_LENGTHS[k]

// anciennes clés (designs enregistrés avant) → nouvelles
const LEGACY = { short: 'm', medium: 'l', long: 'xl', xlong: 'xxl' }
export const lengthKey = (k) => (lengthInfo(k) ? k : LEGACY[k] || 'l')
export const lengthLabel = (k) => lengthInfo(lengthKey(k)).label

/** Longueur réelle d'une capsule : longueur commerciale × coefficient de la forme (stiletto plus long…).
 *  En mode enfant, la longueur choisie en mm est appliquée telle quelle. */
export function tipLength(key, shape) {
  const k = lengthKey(key)
  if (isKidLength(k)) return KID_LENGTHS[k].mm
  return Math.round(LENGTHS[k].mm * (SHAPE_LENGTH[shape] ?? 1) * 2) / 2
}

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

// ---- Marques perso : capsules de l'utilisatrice (nom, référence, tailles mesurées en mm) ----
const CUSTOM_KEY = 'customBrands'
export const listCustomBrands = () => getSetting(CUSTOM_KEY, [])
export function saveCustomBrand(brand) {
  const all = listCustomBrands().filter((b) => b.id !== brand.id)
  all.push({ ...brand, custom: true })
  setSetting(CUSTOM_KEY, all)
  return all
}
export function deleteCustomBrand(id) {
  const all = listCustomBrands().filter((b) => b.id !== id)
  setSetting(CUSTOM_KEY, all)
  return all
}
export const newCustomBrand = () => ({
  id: `perso-${crypto.randomUUID().slice(0, 8)}`,
  name: 'Ma marque',
  ref: '',
  custom: true,
  sizes: [{ label: '1', w: 15 }],
})

/** Marques du commerce + marques perso. */
export const allBrands = () => [...BRANDS, ...listCustomBrands()]
export const findBrand = (id) => allBrands().find((b) => b.id === id)

/** Largeur à utiliser : la mesure perso si elle existe, sinon la valeur de la marque (exacte si marque perso). */
export function tipWidth(brandId, size, measures = getMeasures()) {
  const measured = measures[brandId]?.[size]
  if (measured) return { w: measured, exact: true }
  const brand = findBrand(brandId)
  const s = brand?.sizes.find((x) => x.label === size)
  return s ? { w: s.w, exact: !!brand.custom } : null
}
