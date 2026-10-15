// Profils clientes : largeur et longueur de chacun des 10 ongles naturels, en mm.
// Sert au mode « Ongle direct » (et à choisir les bonnes capsules en press-on).
import { getSetting, setSetting } from './db.js'
import { tipLength, tipWidth } from './tips.js'

export const FINGERS = [
  'Pouce G', 'Index G', 'Majeur G', 'Annulaire G', 'Auriculaire G',
  'Pouce D', 'Index D', 'Majeur D', 'Annulaire D', 'Auriculaire D',
]

// Valeurs moyennes d'un ongle naturel adulte (approx.), pour pré-remplir un nouveau profil
const AVERAGE = [
  { w: 16, h: 14 }, { w: 12, h: 12 }, { w: 13, h: 13 }, { w: 12, h: 12 }, { w: 9, h: 10 },
]
// Largeurs moyennes d'ongles d'enfant (approx.) : pouce, index, majeur, annulaire, auriculaire
const KID_WIDTHS = [11, 8, 8.5, 8, 6.5]
export const kidWidths = () => [...KID_WIDTHS, ...KID_WIDTHS]
/** Vrai si les mesures sont encore les valeurs adultes par défaut (jamais modifiées). */
export const isDefaultAdult = (nails) =>
  nails.every((n, i) => n.w === AVERAGE[i % 5].w && n.h === AVERAGE[i % 5].h)

const KEY = 'clients'
export const listClients = () => getSetting(KEY, [])

export function saveClient(client) {
  const all = listClients().filter((c) => c.id !== client.id)
  all.push(client)
  all.sort((a, b) => a.name.localeCompare(b.name))
  setSetting(KEY, all)
  return all
}

export function deleteClient(id) {
  const all = listClients().filter((c) => c.id !== id)
  setSetting(KEY, all)
  return all
}

export function newClient(name = 'Nouvelle cliente') {
  return {
    id: crypto.randomUUID(),
    name,
    shape: 'oval', // forme habituelle de ses ongles (appliquée en mode ongle direct)
    nails: [...AVERAGE, ...AVERAGE].map((n) => ({ ...n })),
  }
}

/**
 * Mesures des 10 ongles à partir d'une saisie « par marque et numéro » :
 * largeur = taille de capsule de chaque doigt, longueur = longueur XS–XXL commune (selon la forme).
 */
export function nailsFromSizing(sizing, shape) {
  return sizing.sizes.map((size) => ({
    w: tipWidth(sizing.brand, size)?.w ?? 12,
    h: tipLength(sizing.length, shape),
  }))
}

/**
 * Redimensionne l'ongle d'un design en gardant le motif proportionnel :
 * même placement relatif, même taille relative à la largeur de l'ongle.
 */
export function resizeNail(design, nailW, nailH) {
  const kx = nailW / design.nailW
  const ky = nailH / design.nailH
  const scale = (img) => ({ ...img, w: img.w * kx, x: img.x * kx, y: img.y * ky })
  return {
    nailW,
    nailH,
    img: scale(design.img),
    layers: (design.layers || []).map((l) => ({ ...l, img: scale(l.img) })),
    text: { ...design.text, size: design.text.size * kx, y: design.text.y * ky, x: (design.text.x || 0) * kx },
  }
}
