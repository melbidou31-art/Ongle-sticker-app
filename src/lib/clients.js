// Profils clientes : largeur et longueur de chacun des 10 ongles naturels, en mm.
// Sert au mode « Ongle direct » (et à choisir les bonnes capsules en press-on).
import { getSetting, setSetting } from './db.js'

export const FINGERS = [
  'Pouce G', 'Index G', 'Majeur G', 'Annulaire G', 'Auriculaire G',
  'Pouce D', 'Index D', 'Majeur D', 'Annulaire D', 'Auriculaire D',
]

// Valeurs moyennes d'un ongle naturel adulte (approx.), pour pré-remplir un nouveau profil
const AVERAGE = [
  { w: 16, h: 14 }, { w: 12, h: 12 }, { w: 13, h: 13 }, { w: 12, h: 12 }, { w: 9, h: 10 },
]

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
    text: { ...design.text, size: design.text.size * kx, y: design.text.y * ky },
  }
}
