// Réglages d'affichage du mode traçage (mémorisés sur l'appareil, communs à tous les designs)
import { getSetting, setSetting } from './db.js'

export const LINE_COLORS = [
  { id: 'black', label: 'Noir', value: null },
  { id: 'red', label: 'Rouge', value: '#e0002a' },
  { id: 'blue', label: 'Bleu', value: '#0047ff' },
  { id: 'white', label: 'Blanc', value: '#ffffff' },
]

export const SURFACES = [
  { id: 'grid', label: 'Quadrillé' },
  { id: 'plain', label: 'Blanc' },
  { id: 'dark', label: 'Sombre' },
]

const KEY = 'traceDisplay'
const DEFAULT = { line: 'black', surface: 'grid', mirrorRight: false }

export const getDisplay = () => ({ ...DEFAULT, ...getSetting(KEY, {}) })
export function saveDisplay(d) {
  setSetting(KEY, d)
  return d
}

/** Couleur effective du trait : sur fond sombre, le noir devient blanc pour rester visible. */
export function inkColor(d) {
  const c = LINE_COLORS.find((x) => x.id === d.line)?.value ?? null
  if (d.surface === 'dark' && !c) return '#ffffff'
  return c
}
