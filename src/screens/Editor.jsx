import { useEffect, useRef, useState } from 'react'
import NailView from '../components/NailView.jsx'
import Grid from '../components/Grid.jsx'
import TipPicker from '../components/TipPicker.jsx'
import ClientPicker from '../components/ClientPicker.jsx'
import ExportPanel from '../components/ExportPanel.jsx'
import LayersBar from '../components/LayersBar.jsx'
import { getGuides, saveGuides } from '../lib/display.js'
import { allShapes } from '../lib/shapes.js'
import { deleteCustomShape, isCustomShape, saveCustomShape } from '../lib/customShapes.js'
import OutlineTool from '../components/OutlineTool.jsx'
import { cropCanvas, downscale, hasCrop, loadImage, toLineArt } from '../lib/lineart.js'
import CropTool from '../components/CropTool.jsx'
import { DEFAULT_FRENCH, FRENCH_STYLES } from '../lib/french.js'
import { motifFromDesign } from '../lib/mymotifs.js'
import { DEFAULT_TEXT, FONTS } from '../lib/fonts.js'
import useHistory from '../lib/useHistory.js'
import AccentPicker from '../components/AccentPicker.jsx'
import { hasSet } from '../lib/fingerset.js'
import { tipLength } from '../lib/tips.js'
import { resizeNail } from '../lib/clients.js'

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
  // appliqué à l'état le plus récent : deux réglages faits coup sur coup ne s'écrasent plus
  const set = (patch) => onChange((d) => ({ ...d, ...patch }))
  // Zoom d'affichage pour les retouches fines ; 1:1 = taille réelle (le traçage reste toujours en 1:1)
  const [zoom, setZoom] = useState(1)
  const viewPx = pxPerMm * zoom
  // ↶ / ↷ : toutes les modifications de l'éditeur (une étape = jusqu'à une courte pause)
  const history = useHistory(design, onChange)

  // Recalcule le trait quand les réglages de traitement changent
  useEffect(() => {
    let alive = true
    const t = setTimeout(async () => {
      if (!srcCanvas.current) srcCanvas.current = downscale(await loadImage(design.original))
      const src = srcCanvas.current
      const crop = hasCrop(design.crop) ? design.crop : null
      const lineart = toLineArt(src, design.process, design.erase || [], crop)
      if (!alive) return
      if (crop) {
        // le recadrage change les proportions et la photo couleur affichée
        const cropOriginal = cropCanvas(src, crop).toDataURL('image/jpeg', 0.9)
        const aspect = (crop.h * src.height) / (crop.w * src.width)
        onChange((d) => ({ ...d, lineart, cropOriginal, aspect }))
      } else if (lineart !== design.lineart || design.cropOriginal) {
        onChange((d) => ({ ...d, lineart, cropOriginal: null, aspect: src.height / src.width }))
      }
    }, 120)
    return () => {
      alive = false
      clearTimeout(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [design.process.mode, design.process.seuil, design.process.epaisseur, design.erase, design.crop])

  // « Mes motifs » : enregistre le trait tel qu'il est (gomme et recadrage compris) pour le réutiliser
  const [savingMotif, setSavingMotif] = useState(false)
  const [motifMsg, setMotifMsg] = useState('')
  async function saveAsMotif() {
    setSavingMotif(true)
    try {
      const m = await motifFromDesign(design)
      setMotifMsg(`✓ « ${m.name} » ajouté à Mes motifs`)
    } catch (e) {
      console.error(e)
      setMotifMsg("Impossible d'enregistrer ce motif.")
    } finally {
      setSavingMotif(false)
    }
  }

  // Recadrage : la taille du motif à l'écran suit la part d'image conservée
  const [cropping, setCropping] = useState(false)
  function applyCrop(c) {
    setCropping(false)
    onChange((d) => ({ ...d, crop: c, img: { ...d.img, w: (d.img.w * c.w) / (d.crop?.w ?? 1) } }))
  }

  // Retouches (gomme ou crayon) : chaque tracé est mémorisé (annulable) et réappliqué à chaque recalcul du trait.
  // Les points sont convertis de l'image affichée (recadrée) vers l'image entière.
  // mode 'erase' = gomme, 'draw' = crayon (ajoute du trait) ; size = rayon en mm
  const [eraser, setEraser] = useState({ on: false, mode: 'erase', size: 1.5 })
  const pickTool = (mode) =>
    setEraser((e) =>
      e.on && e.mode === mode ? { ...e, on: false } : { on: true, mode, size: mode === 'draw' ? 0.25 : 1.5 },
    )
  const strokes = design.erase || []
  const full = (d, u, v) => {
    const c = d.crop || { x: 0, y: 0, w: 1, h: 1 }
    return [c.x + u * c.w, c.y + v * c.h]
  }
  const eraseHandlers = {
    start: (u, v) =>
      onChange((d) => ({
        ...d,
        erase: [
          ...(d.erase || []),
          { mode: eraser.mode, r: (eraser.size / d.img.w) * (d.crop?.w ?? 1), pts: [full(d, u, v)] },
        ],
      })),
    move: (u, v) =>
      onChange((d) => {
        const list = d.erase || []
        const last = list[list.length - 1]
        if (!last) return d
        return { ...d, erase: [...list.slice(0, -1), { ...last, pts: [...last.pts, full(d, u, v)] }] }
      }),
  }

  const p = design.process
  const setProcess = (patch) => set({ process: { ...p, ...patch } })
  // repères (axe central + marge de sécurité), réglage commun à l'éditeur et au traçage
  const [guides, setGuidesState] = useState(getGuides)
  const setGuides = (patch) => setGuidesState((g) => saveGuides({ ...g, ...patch }))

  // calque sélectionné (null = motif principal) : c'est lui que l'on déplace et règle
  const [activeLayer, setActiveLayer] = useState(null)
  const layer = activeLayer && (design.layers || []).find((l) => l.id === activeLayer)
  const activeImg = layer ? layer.img : design.img
  const moveActive = (img) =>
    layer
      ? set({ layers: design.layers.map((l) => (l.id === layer.id ? { ...l, img } : l)) })
      : set({ img })
  const setImg = (patch) => moveActive({ ...activeImg, ...patch })
  // formes disponibles (dont les capsules dessinées à la main) et outil de tracé du contour
  const [shapes, setShapes] = useState(allShapes)
  const [outlining, setOutlining] = useState(false)
  function applyOutline(shape) {
    saveCustomShape(shape)
    setShapes(allShapes())
    setOutlining(false)
    // la forme dessinée devient celle de l'ongle, à ses dimensions mesurées
    set({ shape: shape.id, ...resizeNail(design, shape.w, shape.h) })
  }

  // changer de forme avec une capsule du commerce : la longueur suit la forme (un stiletto « M » est plus long)
  function changeShape(shape) {
    if (design.mode !== 'direct' && design.tip?.brand && shape !== 'none')
      return set({ shape, ...resizeNail(design, design.nailW, tipLength(design.tip.length, shape)) })
    set({ shape })
  }

  const txt = { ...DEFAULT_TEXT, ...design.text }
  const setText = (patch) => set({ text: { ...txt, ...patch } })
  // zone de placement du texte : l'ongle, ou le motif seul en mode « sans ongle »
  const areaW = design.shape === 'none' ? design.img.w : design.nailW
  const areaH = design.shape === 'none' ? design.img.w * design.aspect : design.nailH
  const french = { ...DEFAULT_FRENCH, ...design.french }
  const setFrench = (patch) => set({ french: { ...french, ...patch } })
  const colors = { on: false, opacity: 0.4, ...design.colors }
  const setColors = (patch) => set({ colors: { ...colors, ...patch } })

  return (
    <div className="screen editor">
      <header className="topbar light">
        <button className="ghost" onClick={onBack}>‹ Designs</button>
        <button className="ghost icon" disabled={!history.canUndo} onClick={history.undo} title="Annuler (Ctrl+Z)" aria-label="Annuler">↶</button>
        <button className="ghost icon" disabled={!history.canRedo} onClick={history.redo} title="Rétablir (Ctrl+Y)" aria-label="Rétablir">↷</button>
        <input className="name-input" value={design.name} onChange={(e) => set({ name: e.target.value })} />
        <button className="pink" onClick={onTrace}>Tracer</button>
      </header>

      <Grid pxPerMm={viewPx} className={`editor-stage ${zoom > 1 ? 'zoomed' : ''}`}>
        <div className="zoom-bar" role="group" aria-label="Zoom">
          {[1, 2, 3, 4].map((z) => (
            <button key={z} className={`chip mini ${zoom === z ? 'on' : ''}`} onClick={() => setZoom(z)}>
              {z === 1 ? '1:1' : `×${z}`}
            </button>
          ))}
        </div>
        <div className="stage-inner">
          {eraser.on ? (
            <NailView design={design} pxPerMm={viewPx} onErase={eraseHandlers} guides={guides} />
          ) : (
            <NailView design={design} pxPerMm={viewPx} onMove={moveActive} activeLayer={activeLayer} guides={guides} />
          )}
        </div>
        <p className="hint">
          {!eraser.on
            ? 'Glisse pour déplacer · pince pour zoomer'
            : eraser.mode === 'draw'
              ? '✏ Crayon : dessine pour compléter ou refermer le trait'
              : '🧽 Gomme : frotte sur le trait à effacer'}
        </p>
      </Grid>

      <section className="panel">
        <div className="panel-head">
          <span className="eyebrow">ÉDITION</span>
          {/* les dimensions de l'ongle plutôt que l'identifiant interne, illisible pour l'utilisatrice */}
          <code className="design-id">
            {design.mode === 'direct' ? 'ongle direct' : `capsule ${design.nailW} × ${design.nailH} mm`}
          </code>
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
            <div className="row">
              <button className="chip gold" disabled={savingMotif} onClick={saveAsMotif}>
                ⭐ Enregistrer dans Mes motifs
              </button>
              {motifMsg && <span className="muted">{motifMsg}</span>}
            </div>
            <div className="eraser">
              <div className="row">
                <button className={`chip ${hasCrop(design.crop) ? 'on' : ''}`} onClick={() => setCropping(true)}>
                  ✂ Recadrer{hasCrop(design.crop) ? ' (actif)' : ''}
                </button>
                <button className={`chip ${eraser.on && eraser.mode === 'erase' ? 'on' : ''}`} onClick={() => pickTool('erase')}>
                  🧽 Gomme
                </button>
                <button className={`chip ${eraser.on && eraser.mode === 'draw' ? 'on' : ''}`} onClick={() => pickTool('draw')}>
                  ✏ Crayon
                </button>
                <button className="chip" disabled={!strokes.length} onClick={() => set({ erase: strokes.slice(0, -1) })}>
                  ↶ Dernière retouche
                </button>
                <button
                  className="chip"
                  disabled={!strokes.length}
                  onClick={() => confirm('Retirer toutes les retouches (gomme et crayon) ?') && set({ erase: [] })}
                >
                  Tout restaurer
                </button>
              </div>
              {eraser.on && (
                <Slider
                  label={eraser.mode === 'draw' ? 'Épaisseur du crayon' : 'Taille de la gomme'}
                  unit=" mm"
                  value={eraser.size * 2}
                  min={eraser.mode === 'draw' ? 0.2 : 0.5}
                  max={eraser.mode === 'draw' ? 3 : 8}
                  step={eraser.mode === 'draw' ? 0.1 : 0.5}
                  onChange={(v) => setEraser((e) => ({ ...e, size: v / 2 }))}
                />
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
            {hasSet(design) && <AccentPicker design={design} onChange={set} />}
            <div className="seg wrap">
              {Object.entries(shapes).map(([k, l]) => (
                <button key={k} className={design.shape === k ? 'on' : ''} onClick={() => changeShape(k)}>{l}</button>
              ))}
            </div>
            <div className="row">
              <button className="chip gold" onClick={() => setOutlining(true)}>✍ Dessiner ma capsule</button>
              {isCustomShape(design.shape) && (
                <button
                  className="chip mini danger"
                  onClick={() => {
                    if (!confirm('Supprimer cette forme dessinée ? (les designs qui l\'utilisent repasseront en ovale)')) return
                    deleteCustomShape(design.shape)
                    setShapes(allShapes())
                    set({ shape: 'oval' })
                  }}
                >
                  Supprimer cette forme
                </button>
              )}
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
            {design.shape !== 'none' && (
              <div className="french">
                <label className="check">
                  <input type="checkbox" checked={french.on} onChange={(e) => setFrench({ on: e.target.checked })} />
                  Gabarit French (ligne du sourire)
                </label>
                {french.on && (
                  <>
                    <div className="seg wrap">
                      {Object.entries(FRENCH_STYLES).map(([k, l]) => (
                        <button key={k} className={french.style === k ? 'on' : ''} onClick={() => setFrench({ style: k })}>{l}</button>
                      ))}
                    </div>
                    <Slider label="Hauteur du bord libre" unit=" mm" value={french.height} min={2} max={Math.max(4, design.nailH - 2)} step={0.5} onChange={(height) => setFrench({ height })} />
                    <Slider label="Profondeur du sourire" unit=" mm" value={french.depth} min={0} max={8} step={0.5} onChange={(depth) => setFrench({ depth })} />
                    <label className="check">
                      <input type="checkbox" checked={french.double} onChange={(e) => setFrench({ double: e.target.checked })} />
                      Double French (2e ligne à {french.gap} mm)
                    </label>
                  </>
                )}
              </div>
            )}
            <label className="check">
              <input type="checkbox" checked={guides.on} onChange={(e) => setGuides({ on: e.target.checked })} />
              Repères : axe central + marge de sécurité (cuticule / parois)
            </label>
            {guides.on && design.shape !== 'none' && (
              <Slider label="Marge de sécurité" unit=" mm" value={guides.margin} min={0} max={2.5} step={0.25} onChange={(margin) => setGuides({ margin })} />
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
            <p className="muted">Prénom, initiales, date… ajoutés par-dessus le motif, à décalquer comme le reste.</p>
            <input className="text-input" placeholder="Ton texte…" value={txt.value} onChange={(e) => setText({ value: e.target.value })} />
            <div className="seg wrap">
              {Object.entries(FONTS).map(([k, f]) => (
                <button
                  key={k}
                  className={txt.font === k ? 'on' : ''}
                  style={{ fontFamily: f.family }}
                  onClick={() => setText({ font: k })}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <label className="check">
              <input type="checkbox" checked={txt.outline} onChange={(e) => setText({ outline: e.target.checked })} />
              Contour seul (décalquer le bord des lettres, puis remplir)
            </label>
            <Slider label="Taille" unit=" mm" value={txt.size} min={1} max={12} step={0.5} onChange={(size) => setText({ size })} />
            <Slider label="Position verticale" unit=" mm" value={txt.y} min={0} max={areaH} step={0.5} onChange={(y) => setText({ y })} />
            <Slider label="Position horizontale" unit=" mm" value={txt.x} min={-areaW / 2} max={areaW / 2} step={0.5} onChange={(x) => setText({ x })} />
            <Slider label="Rotation" unit="°" value={txt.rot} min={-90} max={90} step={1} onChange={(rot) => setText({ rot })} />
            <Slider label="Espacement des lettres" unit=" mm" value={txt.spacing} min={-0.5} max={3} step={0.1} onChange={(spacing) => setText({ spacing })} />
          </div>
        )}
      </section>
      {outlining && <OutlineTool pxPerMm={pxPerMm} onDone={applyOutline} onCancel={() => setOutlining(false)} />}
      {cropping && (
        <CropTool src={design.original} initial={design.crop} onDone={applyCrop} onCancel={() => setCropping(false)} />
      )}
    </div>
  )
}
