// Protection des données stockées dans le navigateur.
// Sans stockage « persistant », le navigateur peut effacer les designs quand l'appareil manque de place.

/** Demande au navigateur de ne pas effacer les données de l'app (silencieux si non pris en charge). */
export async function requestPersist() {
  try {
    if (await navigator.storage?.persisted?.()) return true
    return (await navigator.storage?.persist?.()) ?? false
  } catch {
    return false
  }
}

/** Espace utilisé / disponible (en Mo) et état de protection ; null si le navigateur ne le dit pas. */
export async function storageInfo() {
  try {
    const est = await navigator.storage?.estimate?.()
    if (!est) return null
    return {
      usedMb: (est.usage || 0) / 1048576,
      quotaMb: (est.quota || 0) / 1048576,
      persisted: !!(await navigator.storage.persisted?.()),
    }
  } catch {
    return null
  }
}
