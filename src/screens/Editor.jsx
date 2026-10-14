import { useEffect, useRef, useState } from 'react'
import NailView from '../components/NailView.jsx'
import Grid from '../components/Grid.jsx'
import TipPicker from '../components/TipPicker.jsx'
import ClientPicker from '../components/ClientPicker.jsx'
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
      const lineart = toLineArt(srcCanvas.current, design.process)
      if (alive && lineart !== design.lineart) onChange((d) => ({ ...d, lineart }))
    }, 120)
    return () => {
      alive = false
      clearTimeout(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [design.process.mode, design.process.seuil, design.process.epaisseur])

  const p = design.process
  const setProcess = (patch) => set({ process: { ...p, ...patch } })
  const setImg = (patch) => set({ img: { ...design.img, ...patch } })
  const setText = (patch) => set({ text: { ...design.text, ...patch } })

  return (
    <div className="screen editor">
      <header className="topbar light">
        <button className="ghost" onClick={onBack}>‹ Designs</button>
        <input className="name-input" value={design.name} onChange={(e) => set({ name: e.target.value })} />
        <button className="pink" onClick={onTrace}>Tracer</button>
      </header>

      <Grid pxPerMm={pxPerMm} className="editor-stage">
        <NailView design={design} pxPerMm={pxPerMm} onMove={(img) => set({ img })} />
        <p className="hint">Glisse pour déplacer · pince pour zoomer</p>
      </Grid>

      <section className="panel">
        <div className="panel-head">
          <span className="eyebrow">EDITING</span>
          <code className="design-id">{design.id}</code>
        </div>
        <nav className="tabs">
          {[['motif', 'Motif'], ['ongle', 'Ongle'], ['position', 'Position'], ['texte', 'Texte']].map(([k, l]) => (
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
              <TipPicker design={design} onChange={set} />
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
            <Slider label="Taille du motif" unit=" mm" value={design.img.w} min={2} max={60} step={0.5} onChange={(w) => setImg({ w })} />
            <Slider label="Rotation" unit="°" value={design.img.rot} min={-180} max={180} onChange={(rot) => setImg({ rot })} />
            <div className="row">
              <button className="chip" onClick={() => setImg({ x: 0, y: 0 })}>Recentrer</button>
              <button className={`chip ${design.flip ? 'on' : ''}`} onClick={() => set({ flip: !design.flip })}>Miroir ⇋</button>
            </div>
          </div>
        )}

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
