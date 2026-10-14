import { useEffect, useRef, useState } from 'react'
import NailView from '../components/NailView.jsx'
import Grid from '../components/Grid.jsx'
import TipPicker from '../components/TipPicker.jsx'
import ClientPicker from '../components/ClientPicker.jsx'
import ExportPanel from '../components/ExportPanel.jsx'
import LayersBar from '../components/LayersBar.jsx'
import { SHAPES } from '../lib/shapes.js'
import { downscale, loadImage, toLineArt } from '../lib/lineart.js'

function Slider({ label, value, min, max, step = 1, unit = '', onChange }) {
  return (
    <label className="slider">
      <span>
        {label} <b>{Math.round(value * 10) / 10}{unit}</b>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(+e.target.value)} />
    </label>
  )
}

export default function Editor({ design, pxPerMm, onChange, onTrace, onBack, onManageClients }) {
  const [tab, setTab] = useState('motif')
  const srcCanvas = useRef(null)
  const set = (patch) => onChange({ ...design, ...patch })

  // Recalcule le trait quand les réglages de traitement changent
  useEffect(() => {
    let alive = true
    const t = setTimeout(async () => {
      if (!srcCanvas.current) srcCanvas.current = downscale(await loadImage(design.original))
      const lineart = toLineArt(srcCanvas.current, design.process, design.erase || [])
      if (alive && lineart !== design.lineart) onChange((d) => ({ ...d, lineart }))
    }, 120)
    return () => {
      alive = false
      clearTimeout(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [design.process.mode, design.process.seuil, design.process.epaisseur, design.erase])

  // Gomme : chaque tracé est mémorisé (annulable) et réappliqué à chaque recalcul du trait
  const [eraser, setEraser] = useState({ on: false, size: 1.5 }) // size = rayon en mm
  const strokes = design.erase || []
  const eraseHandlers = {
    start: (u, v) =>
      onChange((d) => ({ ...d, erase: [...(d.erase || []), { r: eraser.size / d.img.w, pts: [[u, v]] }] })),
    move: (u, v) =>
      onChange((d) => {
        const list = d.erase || []
        const last = list[list.length - 1]
        if (!last) return d
        return { ...d, erase: [...list.slice(0, -1), { ...last, pts: [...last.pts, [u, v]] }] }
      }),
  }

  const p = design.process
  const setProcess = (patch) => set({ process: { ...p, ...patch } })
  // calque sélectionné (null = motif principal) : c'est lui que l'on déplace et règle
  const [activeLayer, setActiveLayer] = useState(null)
  const layer = activeLayer && (design.layers || []).find((l) => l.id === activeLayer)
  const activeImg = layer ? layer.img : design.img
  const moveActive = (img) =>
    layer
      ? set({ layers: design.layers.map((l) => (l.id === layer.id ? { ...l, img } : l)) })
      : set({ img })
  const setImg = (patch) => moveActive({ ...activeImg, ...patch })
  const setText = (patch) => set({ text: { ...design.text, ...patch } })
  const colors = { on: false, opacity: 0.4, ...design.colors }
  const setColors = (patch) => set({ colors: { ...colors, ...patch } })

  return (
    <div className="screen editor">
      <header className="topbar light">
        <button className="ghost" onClick={onBack}>‹ Designs</button>
        <input className="name-input" value={design.name} onChange={(e) => set({ name: e.target.value })} />
        <button className="pink" onClick={onTrace}>Tracer</button>
      </header>

      <Grid pxPerMm={pxPerMm} className="editor-stage">
        {eraser.on ? (
          <NailView design={design} pxPerMm={pxPerMm} onErase={eraseHandlers} />
        ) : (
          <NailView design={design} pxPerMm={pxPerMm} onMove={moveActive} activeLayer={activeLayer} />
        )}
        <p className="hint">{eraser.on ? '🧽 Gomme : frotte sur le trait à effacer' : 'Glisse pour déplacer · pince pour zoomer'}</p>
      </Grid>

      <section className="panel">
        <div className="panel-head">
          <span className="eyebrow">EDITING</span>
          <code className="design-id">{design.id}</code>
        </div>
        <nav className="tabs">
          {[['motif', 'Motif'], ['ongle', 'Ongle'], ['position', 'Calques'], ['texte', 'Texte'], ['export', 'Export']].map(([k, l]) => (
            <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>
          ))}
        </nav>

        {tab === 'motif' && (
          <div className="controls">
            <div className="seg">
              <button className={p.mode === 'trait' ? 'on' : ''} onClick={() => setProcess({ mode: 'trait' })}>Dessin au trait</button>
              <button className={p.mode === 'contours' ? 'on' : ''} onClick={() => setProcess({ mode: 'contours' })}>Photo → contours</button>
            </div>
            <Slider label="Seuil" value={p.seuil} min={0} max={100} onChange={(seuil) => setProcess({ seuil })} />
            <Slider label="Épaisseur du trait" value={p.epaisseur} min={0} max={3} onChange={(epaisseur) => setProcess({ epaisseur })} />
            <div className="eraser">
              <div className="row">
                <button className={`chip ${eraser.on ? 'on' : ''}`} onClick={() => setEraser((e) => ({ ...e, on: !e.on }))}>
                  🧽 Gomme {eraser.on ? 'activée' : ''}
                </button>
                <button className="chip" disabled={!strokes.length} onClick={() => set({ erase: strokes.slice(0, -1) })}>
                  ↶ Annuler
                </button>
                <button
                  className="chip"
                  disabled={!strokes.length}
                  onClick={() => confirm('Restaurer tout le trait effacé ?') && set({ erase: [] })}
                >
                  Tout restaurer
                </button>
              </div>
              {eraser.on && (
                <Slider label="Taille de la gomme" unit=" mm" value={eraser.size * 2} min={0.5} max={8} step={0.5} onChange={(v) => setEraser((e) => ({ ...e, size: v / 2 }))} />
              )}
            </div>
            <label className="check">
              <input type="checkbox" checked={!!colors.on} onChange={(e) => setColors({ on: e.target.checked })} />
              🎨 Afficher les couleurs d'origine sous le trait
            </label>
            {colors.on && (
              <Slider label="Intensité des couleurs" unit=" %" value={Math.round(colors.opacity * 100)} min={10} max={100} step={5} onChange={(v) => setColors({ opacity: v / 100 })} />
            )}
          </div>
        )}

        {tab === 'ongle' && (
          <div className="controls">
            <div className="seg">
              <button className={design.mode !== 'direct' ? 'on' : ''} onClick={() => set({ mode: 'pressOn' })}>
                Press-on (capsule)
              </button>
              <button className={design.mode === 'direct' ? 'on' : ''} onClick={() => set({ mode: 'direct' })}>
                Ongle direct
              </button>
            </div>
            {design.mode === 'direct' ? (
              <ClientPicker design={design} onChange={set} onManageClients={onManageClients} />
            ) : (
              <TipPicker design={design} pxPerMm={pxPerMm} onChange={set} />
            )}
            <div className="seg wrap">
              {Object.entries(SHAPES).map(([k, l]) => (
                <button key={k} className={design.shape === k ? 'on' : ''} onClick={() => set({ shape: k })}>{l}</button>
              ))}
            </div>
            {design.shape === 'none' ? (
              <p className="muted">Motif seul sur le quadrillage. Choisis une forme ou une capsule pour afficher un contour d'ongle.</p>
            ) : (
              <>
                <Slider label="Largeur" unit=" mm" value={design.nailW} min={8} max={22} step={0.5} onChange={(nailW) => set({ nailW })} />
                <Slider label="Longueur" unit=" mm" value={design.nailH} min={10} max={50} step={0.5} onChange={(nailH) => set({ nailH })} />
                <label className="check">
                  <input type="checkbox" checked={design.clip} onChange={(e) => set({ clip: e.target.checked })} />
                  Couper le motif à la forme de l'ongle
                </label>
              </>
            )}
          </div>
        )}

        {tab === 'position' && (
          <div className="controls">
            <LayersBar design={design} active={activeLayer} onSelect={setActiveLayer} onChange={onChange} />
            <Slider label={layer ? `Taille de « ${layer.name} »` : 'Taille du motif'} unit=" mm" value={activeImg.w} min={2} max={60} step={0.5} onChange={(w) => setImg({ w })} />
            <Slider label="Rotation" unit="°" value={activeImg.rot} min={-180} max={180} onChange={(rot) => setImg({ rot })} />
            <div className="row">
              <button className="chip" onClick={() => setImg({ x: 0, y: 0 })}>Recentrer</button>
              <button className={`chip ${design.flip ? 'on' : ''}`} onClick={() => set({ flip: !design.flip })}>Miroir ⇋</button>
            </div>
          </div>
        )}

        {tab === 'export' && <ExportPanel design={design} />}

        {tab === 'texte' && (
          <div className="controls">
            <p className="muted">Text overlay : ajoute du texte sans modifier l'image.</p>
            <input className="text-input" placeholder="Ton texte…" value={design.text.value} onChange={(e) => setText({ value: e.target.value })} />
            <Slider label="Taille" unit=" mm" value={design.text.size} min={1} max={10} step={0.5} onChange={(size) => setText({ size })} />
            <Slider label="Position verticale" unit=" mm" value={design.text.y} min={0} max={design.nailH} step={0.5} onChange={(y) => setText({ y })} />
          </div>
        )}
      </section>
    </div>
  )
}
