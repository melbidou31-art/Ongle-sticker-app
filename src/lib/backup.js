// Sauvegarde / restauration de toutes les données de l'app dans un fichier .json.
// Sert aussi à transférer ses designs et clientes d'un appareil à un autre (PC → téléphone…).
// Le calibrage de l'écran n'est PAS inclus : il est propre à chaque appareil.
import { getSetting, listDesigns, saveDesign, setSetting } from './db.js'
import { listClients } from './clients.js'
import { getMeasures } from './tips.js'

const APP = 'ongle-trace'
const VERSION = 1

export async function buildBackup() {
  return {
    app: APP,
    version: VERSION,
    date: new Date().toISOString(),
    designs: await listDesigns(),
    clients: listClients(),
    tipMeasures: getMeasures(),
    traceDisplay: getSetting('traceDisplay', null),
  }
}

export async function downloadBackup() {
  const data = await buildBackup()
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  // date locale (pas UTC) dans le nom du fichier
  const now = new Date()
  const day = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  a.download = `ongle-trace-sauvegarde-${day}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(a.href), 2000)
  return { designs: data.designs.length, clients: data.clients.length }
}

/**
 * Restaure un fichier de sauvegarde en FUSIONNANT avec l'existant :
 * un design ou une cliente avec le même identifiant est remplacé, le reste est conservé.
 */
export async function restoreBackup(text) {
  let data
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error("Ce fichier n'est pas une sauvegarde Ongle Trace.")
  }
  if (data?.app !== APP || !Array.isArray(data.designs)) throw new Error("Ce fichier n'est pas une sauvegarde Ongle Trace.")
  if (data.version > VERSION) throw new Error("Sauvegarde créée par une version plus récente de l'app.")

  let designs = 0
  for (const d of data.designs) {
    // garde-fou : un design doit au minimum avoir un id et ses images
    if (!d?.id || !d.original || !d.lineart) continue
    await saveDesign(d)
    designs++
  }

  const clients = Array.isArray(data.clients) ? data.clients.filter((c) => c?.id && Array.isArray(c.nails)) : []
  if (clients.length) {
    const byId = new Map(listClients().map((c) => [c.id, c]))
    for (const c of clients) byId.set(c.id, c)
    setSetting('clients', [...byId.values()].sort((a, b) => a.name.localeCompare(b.name)))
  }

  if (data.tipMeasures && typeof data.tipMeasures === 'object') {
    const merged = { ...getMeasures() }
    for (const [brand, sizes] of Object.entries(data.tipMeasures)) merged[brand] = { ...(merged[brand] || {}), ...sizes }
    setSetting('tipMeasures', merged)
  }
  if (data.traceDisplay && !getSetting('traceDisplay', null)) setSetting('traceDisplay', data.traceDisplay)

  return { designs, clients: clients.length }
}
