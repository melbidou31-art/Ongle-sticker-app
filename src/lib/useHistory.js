import { useCallback, useEffect, useRef, useState } from 'react'

// Champs recalculés automatiquement à partir des réglages : leurs changements ne sont pas des « étapes »
const DERIVED = new Set(['lineart', 'cropOriginal', 'aspect', 'updatedAt'])
const LIMIT = 50
const SETTLE_MS = 500 // une étape = les modifications groupées jusqu'à une pause (un glissé, un curseur…)

/** Vrai si un réglage (pas un champ recalculé) a changé ; comparaison par référence, donc rapide. */
function changed(a, b) {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)])
  for (const k of keys) if (!DERIVED.has(k) && a[k] !== b[k]) return true
  return false
}

/**
 * Historique annuler / rétablir pour l'éditeur.
 * Les états sont des objets design entiers (immuables), partagés par référence : peu coûteux en mémoire.
 */
export default function useHistory(design, onChange) {
  const stable = useRef(design) // dernier état enregistré comme étape
  const past = useRef([])
  const future = useRef([])
  const restoring = useRef(false)
  const [, bump] = useState(0) // pour rafraîchir l'état des boutons

  // enregistre l'étape en cours si un réglage a changé depuis la dernière
  const flush = useCallback((current) => {
    if (!changed(stable.current, current)) return false
    past.current = [...past.current, stable.current].slice(-LIMIT)
    future.current = []
    stable.current = current
    bump((n) => n + 1)
    return true
  }, [])

  useEffect(() => {
    if (restoring.current) {
      restoring.current = false
      stable.current = design
      return
    }
    const t = setTimeout(() => flush(design), SETTLE_MS)
    return () => clearTimeout(t)
  }, [design, flush])

  function go(from, to) {
    flush(design) // une modification encore « en cours » devient une étape avant d'être annulée
    const target = from.current[from.current.length - 1]
    if (!target) return
    from.current = from.current.slice(0, -1)
    to.current = [...to.current, stable.current]
    restoring.current = true
    stable.current = target
    bump((n) => n + 1)
    onChange(target)
  }

  const undo = () => go(past, future)
  const redo = () => go(future, past)

  // Ctrl+Z / Ctrl+Y (ou Ctrl+Maj+Z), sauf pendant la saisie dans un champ texte
  useEffect(() => {
    function onKey(e) {
      if (!(e.ctrlKey || e.metaKey) || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return
      const k = e.key.toLowerCase()
      if (k === 'z' && !e.shiftKey) (e.preventDefault(), undo())
      else if (k === 'y' || (k === 'z' && e.shiftKey)) (e.preventDefault(), redo())
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return {
    undo,
    redo,
    canUndo: past.current.length > 0 || changed(stable.current, design),
    canRedo: future.current.length > 0,
  }
}
