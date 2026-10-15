// Stockage local des designs (IndexedDB : plus de place que localStorage pour les images)

const DB = 'ongle-trace'
const STORE = 'designs'
const MOTIFS = 'motifs' // « Mes motifs » : images enregistrées par l'utilisatrice (version 2)

function open() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 2)
    req.onupgradeneeded = () => {
      // crée seulement ce qui manque : les designs existants sont conservés
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: 'id' })
      if (!db.objectStoreNames.contains(MOTIFS)) db.createObjectStore(MOTIFS, { keyPath: 'id' })
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function run(mode, fn, store = STORE) {
  const db = await open()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, mode)
    const req = fn(tx.objectStore(store))
    tx.oncomplete = () => resolve(req?.result)
    tx.onerror = () => reject(tx.error)
  })
}

export const listDesigns = async () =>
  ((await run('readonly', (s) => s.getAll())) || []).sort((a, b) => b.updatedAt - a.updatedAt)
export const saveDesign = (d) => run('readwrite', (s) => s.put({ ...d, updatedAt: Date.now() }))
export const deleteDesign = (id) => run('readwrite', (s) => s.delete(id))
// rangement (favori, collection) : ne change pas la date de modification, donc pas l'ordre « Récents »
export const updateDesignMeta = (d) => run('readwrite', (s) => s.put(d))

export const listMyMotifs = async () =>
  ((await run('readonly', (s) => s.getAll(), MOTIFS)) || []).sort((a, b) => b.createdAt - a.createdAt)
export const saveMyMotif = (m) => run('readwrite', (s) => s.put(m), MOTIFS)
export const deleteMyMotif = (id) => run('readwrite', (s) => s.delete(id), MOTIFS)

// Réglages (calibrage écran) : petits, donc localStorage suffit
export function getSetting(key, fallback) {
  try {
    const v = localStorage.getItem(key)
    return v == null ? fallback : JSON.parse(v)
  } catch {
    return fallback
  }
}
export function setSetting(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {}
}

// Valeur par défaut avant calibrage : ~6,3 px CSS/mm sur téléphone, ~3,8 sur ordinateur
export const defaultPxPerMm = () =>
  matchMedia('(pointer: coarse)').matches ? 6.3 : 96 / 25.4

export function newDesign({ original, lineart, aspect }) {
  return {
    id: crypto.randomUUID().toUpperCase(),
    name: 'Nouveau design',
    createdAt: Date.now(),
    original,
    lineart,
    aspect, // hauteur / largeur de l'image
    process: { mode: 'trait', seuil: 50, epaisseur: 0 },
    crop: null, // zone conservée { x, y, w, h } (relative à l'image entière) ; cropOriginal = photo recadrée
    erase: [], // traits de gomme (coordonnées relatives à l'image), réappliqués au recalcul
    layers: [], // motifs supplémentaires : { id, name, lineart, original, aspect, img: { x, y, w, rot } }
    shape: 'none', // motif seul sur le quadrillage ; une forme d'ongle est optionnelle
    mode: 'pressOn', // 'pressOn' (capsule) ou 'direct' (ongle naturel de la cliente)
    tip: null, // { brand, size, length } si une capsule du commerce est choisie
    client: null, // { id, finger } en mode ongle direct
    tipSet: null, // 10 tailles (pouce G → auriculaire D) pour un set press-on
    nailW: 14,
    nailH: 30,
    img: { x: 0, y: 0, w: 20, rot: 0 },
    flip: false,
    clip: true,
    colors: { on: false, opacity: 0.4 }, // calque des couleurs d'origine sous le trait
    text: { value: '', size: 3, y: 8 },
  }
}
