import { useRef, useState } from 'react'
import { downloadBackup, restoreBackup } from '../lib/backup.js'

export default function BackupPanel({ onRestored }) {
  const input = useRef(null)
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  async function save() {
    setBusy(true)
    try {
      const n = await downloadBackup()
      setMsg(`✓ Sauvegarde créée : ${n.designs} design(s), ${n.motifs} motif(s) perso, ${n.clients} cliente(s).`)
    } catch (e) {
      console.error(e)
      setMsg('La sauvegarde a échoué.')
    } finally {
      setBusy(false)
    }
  }

  async function restore(file) {
    setBusy(true)
    try {
      const n = await restoreBackup(await file.text())
      setMsg(`✓ Restauré : ${n.designs} design(s), ${n.motifs} motif(s) perso, ${n.clients} cliente(s).`)
      onRestored()
    } catch (e) {
      setMsg(e.message || 'Restauration impossible.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="backup">
      <p className="muted">
        Tes designs, clientes et mesures de capsules sont enregistrés <b>uniquement sur cet appareil</b>. Fais une
        sauvegarde régulièrement, ou pour les transférer sur un autre appareil (ouvre le fichier avec « Restaurer »).
        Le calibrage de l'écran n'est pas inclus : refais-le sur chaque appareil.
      </p>
      <div className="row">
        <button className="chip gold" disabled={busy} onClick={save}>⬇ Sauvegarder (fichier .json)</button>
        <button className="chip" disabled={busy} onClick={() => input.current.click()}>⬆ Restaurer une sauvegarde</button>
      </div>
      {msg && <p className="muted">{msg}</p>}
      <input
        ref={input}
        type="file"
        accept="application/json,.json"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0]
          e.target.value = ''
          if (f) restore(f)
        }}
      />
    </div>
  )
}
