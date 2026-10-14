import { useRef, useState } from 'react'
import { downscale, fileToDataURL, loadImage, toLineArt } from '../lib/lineart.js'
import { MOTIFS, motifCanvas, motifSVG } from '../lib/motifs.js'

/** Crée un calque à partir d'un canvas (motif de la bibliothèque ou image importée). */
function layerFrom(canvas, name) {
  return {
    id: crypto.randomUUID(),
    name,
    original: canvas.toDataURL('image/jpeg', 0.9),
    lineart: toLineArt(canvas),
    aspect: canvas.height / canvas.width,
    img: { x: 0, y: 0, w: 8, rot: 0 },
  }
}

/**
 * Calques : motif principal + motifs ajoutés (ex. Ghostface + roses + nœud).
 * Le calque sélectionné est celui que l'on déplace / règle dans l'onglet Position.
 */
export default function LayersBar({ design, active, onSelect, onChange }) {
  const input = useRef(null)
  const [picking, setPicking] = useState(false)
  const [busy, setBusy] = useState(false)
  const layers = design.layers || []

  async function add(getCanvas, name) {
    setBusy(true)
    try {
      const l = layerFrom(await getCanvas(), name)
      onChange((d) => ({ ...d, layers: [...(d.layers || []), l] }))
      onSelect(l.id)
      setPicking(false)
    } catch (e) {
      console.error(e)
      alert("Impossible d'ajouter ce motif.")
    } finally {
      setBusy(false)
    }
  }

  function remove() {
    onChange((d) => ({ ...d, layers: (d.layers || []).filter((l) => l.id !== active) }))
    onSelect(null)
  }

  return (
    <div className="layers">
      <div className="row">
        <span className="eyebrow gold">CALQUES</span>
        <button className={`chip mini ${active == null ? 'on' : ''}`} onClick={() => onSelect(null)}>
          Principal
        </button>
        {layers.map((l, i) => (
          <button key={l.id} className={`chip mini ${active === l.id ? 'on' : ''}`} onClick={() => onSelect(l.id)}>
            {i + 2}. {l.name}
          </button>
        ))}
      </div>
      <div className="row">
        <button className="chip mini" disabled={busy} onClick={() => setPicking((v) => !v)}>+ Motif</button>
        <button className="chip mini" disabled={busy} onClick={() => input.current.click()}>+ Image</button>
        {active != null && (
          <button className="chip mini danger" onClick={remove}>Retirer ce calque</button>
        )}
      </div>
      {picking && (
        <div className="motif-grid small">
          {MOTIFS.map((m) => (
            <button key={m.id} className="motif" disabled={busy} onClick={() => add(() => motifCanvas(m), m.name)} title={m.name}>
              <img src={'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(motifSVG(m))} alt="" />
            </button>
          ))}
        </div>
      )}
      <input
        ref={input}
        type="file"
        accept="image/*"
        hidden
        onChange={async (e) => {
          const f = e.target.files?.[0]
          e.target.value = ''
          if (f) add(async () => downscale(await loadImage(await fileToDataURL(f))), f.name.replace(/\.[^.]+$/, '').slice(0, 20))
        }}
      />
    </div>
  )
}
