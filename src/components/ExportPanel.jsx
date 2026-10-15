import { useState } from 'react'
import { hasSet } from '../lib/fingerset.js'

// chargé à la demande : l'export embarque le rendu serveur de React, inutile au démarrage
const loadExport = () => import('../lib/export.js')

export default function ExportPanel({ design }) {
  const canSet = hasSet(design)
  const [o, setO] = useState({ set: canSet, colors: !!design.colors?.on, mirror: false, outline: true })
  const [busy, setBusy] = useState(false)
  const toggle = (k) => setO((p) => ({ ...p, [k]: !p[k] }))

  async function run(kind) {
    setBusy(true)
    try {
      const m = await loadExport()
      if (kind === 'png') await m.exportPNG(design, o)
      else if (kind === 'pdf') await m.exportPDF(design, o)
      else m.exportSVG(design, o)
    } catch (e) {
      console.error(e)
      alert(kind === 'svg' ? "L'export a échoué." : `L'export ${kind.toUpperCase()} a échoué. Essaie l'export SVG.`)
    } finally {
      setBusy(false)
    }
  }

  const [shareMsg, setShareMsg] = useState('')
  async function share() {
    setBusy(true)
    setShareMsg('')
    try {
      const m = await loadExport()
      // aperçu fidèle : jamais en miroir, avec couleurs et contours
      const res = await m.shareDesign(design, { set: o.set })
      if (res === 'downloaded') setShareMsg("Partage direct indisponible ici : l'image a été téléchargée, envoie-la à ta cliente.")
    } catch (e) {
      console.error(e)
      setShareMsg("Le partage a échoué.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="controls">
      <div className="share-box">
        <button className="pink" disabled={busy} onClick={share}>📤 Partager un aperçu à la cliente</button>
        <span className="muted">Image avec couleurs (WhatsApp, Instagram, SMS…) pour faire valider le design avant la pose.</span>
        {shareMsg && <span className="muted">{shareMsg}</span>}
      </div>
      <p className="muted">
        Fichier à <b>taille réelle</b>, pour imprimer un calque papier, des stickers ou des water decals. À l'impression,
        choisis « Taille réelle / 100 % » (pas « Ajuster à la page »).
      </p>
      {canSet && (
        <label className="check">
          <input type="checkbox" checked={o.set} onChange={() => toggle('set')} />
          Planche complète 10 doigts (sinon : ce design seul)
        </label>
      )}
      <label className="check">
        <input type="checkbox" checked={o.colors} onChange={() => toggle('colors')} />
        Inclure les couleurs d'origine
      </label>
      <label className="check">
        <input type="checkbox" checked={o.outline} onChange={() => toggle('outline')} />
        Contour des ongles (pointillés)
      </label>
      <label className="check">
        <input type="checkbox" checked={o.mirror} onChange={() => toggle('mirror')} />
        Miroir (water decals / papier transfert)
      </label>
      <div className="row">
        <button className="chip gold" disabled={busy} onClick={() => run('pdf')}>PDF à imprimer (A4)</button>
        <button className="chip" disabled={busy} onClick={() => run('svg')}>SVG</button>
        <button className="chip gold" disabled={busy} onClick={() => run('png')}>{busy ? 'Export…' : 'PNG 300 dpi'}</button>
      </div>
    </div>
  )
}
