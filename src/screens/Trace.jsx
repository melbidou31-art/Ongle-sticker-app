import { useEffect, useRef, useState } from 'react'
import NailView from '../components/NailView.jsx'
import Grid from '../components/Grid.jsx'
import { FINGERS, resizeNail } from '../lib/clients.js'
import { fingerDims, forFinger, hasSet } from '../lib/fingerset.js'
import { LINE_COLORS, SURFACES, getDisplay, getGuides, inkColor, saveDisplay, saveGuides } from '../lib/display.js'

const HOLD_MS = 700 // appui long pour déverrouiller : évite qu'une capsule posée ne débloque l'écran

// Garde l'écran allumé pendant le traçage (si le navigateur le permet)
function useWakeLock() {
  useEffect(() => {
    let lock = null
    const request = async () => {
      try {
        lock = await navigator.wakeLock?.request('screen')
      } catch {}
    }
    const onVisible = () => document.visibilityState === 'visible' && request()
    request()
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      lock?.release().catch(() => {})
    }
  }, [])
}

export default function Trace({ design, pxPerMm, onChange, onExit }) {
  const [locked, setLocked] = useState(true)
  const [holding, setHolding] = useState(false)
  const timer = useRef(null)
  useWakeLock()

  // Set 10 doigts : navigation doigt par doigt (ou main entière)
  const set = hasSet(design)
  const [finger, setFinger] = useState(design.client?.finger ?? 0)
  const [view, setView] = useState('single')
  // couleurs d'origine : bascule rapide pendant le traçage (trait seul ↔ trait + couleurs)
  const [showColors, setShowColors] = useState(!!design.colors?.on)
  // affichage : couleur du trait, fond, miroir de la main droite
  const [display, setDisplay] = useState(getDisplay)
  const [showOptions, setShowOptions] = useState(false)
  const updateDisplay = (patch) => setDisplay((d) => saveDisplay({ ...d, ...patch }))
  const ink = inkColor(display)
  const dark = display.surface === 'dark'
  const [guides, setGuidesState] = useState(getGuides)
  const toggleGuides = () => setGuidesState((g) => saveGuides({ ...g, on: !g.on }))
  // variante d'un doigt ; la main droite peut être en miroir pour un set symétrique
  const variant = (f) => {
    const v = forFinger(design, f)
    return display.mirrorRight && f >= 5 ? { ...v, flip: !v.flip } : v
  }

  const dims = set ? fingerDims(design, finger) : null
  const current = set ? variant(finger) : design
  const go = (d) =>
    setFinger((f) => (view === 'hand' ? (f < 5 ? 5 : 0) : (f + d + 10) % 10))

  // par défaut : immersif sur téléphone/tablette (écran tactile), classique sur ordinateur
  const immersiveOn = display.immersive ?? matchMedia('(pointer: coarse)').matches
  const immersive = locked && immersiveOn
  const stage = (
    <TraceStage
      {...{ pxPerMm, display, locked, set, view, finger, variant, current, design, onChange, showColors, ink, dark, guides }}
    />
  )

  function startHold() {
    setHolding(true)
    timer.current = setTimeout(() => {
      setLocked(false)
      setHolding(false)
    }, HOLD_MS)
  }
  function cancelHold() {
    clearTimeout(timer.current)
    setHolding(false)
  }

  function toggleFullscreen() {
    const el = document.documentElement
    if (document.fullscreenElement) document.exitFullscreen?.()
    else el.requestFullscreen?.().catch(() => {})
  }

  // bouton de déverrouillage (appui long), partagé par l'en-tête et la barre immersive
  const unlockButton = (compact) => (
    <button
      className={`pink hold ${holding ? 'holding' : ''} ${compact ? 'compact' : ''}`}
      style={{ '--hold': `${HOLD_MS}ms` }}
      onPointerDown={startHold}
      onPointerUp={cancelHold}
      onPointerLeave={cancelHold}
      onContextMenu={(e) => e.preventDefault()}
    >
      🔓 {compact ? 'Maintenir' : <>Unlock design <small>(maintenir)</small></>}
    </button>
  )
  const colorsButton = (
    <button
      className={`ghost dark ${showColors ? 'on-gold' : ''}`}
      onClick={() => setShowColors((v) => !v)}
      title="Couleurs d'origine sous le trait"
    >
      🎨
    </button>
  )

  // Mode immersif : verrouillé, tout se réduit à une fine barre pour laisser l'écran au traçage
  if (immersive)
    return (
      <div className="screen trace immersive">
        <div className="immersive-bar">
          {unlockButton(true)}
          {set && view === 'single' ? (
            <div className="mini-nav">
              <button className="ghost dark" onClick={() => go(-1)} aria-label="Doigt précédent">◀</button>
              <span>{FINGERS[finger]}{dims?.size ? ` · ${dims.size}` : ''}</span>
              <button className="ghost dark" onClick={() => go(1)} aria-label="Doigt suivant">▶</button>
            </div>
          ) : (
            <span className="eyebrow gold">🔒 LOCKED</span>
          )}
          {colorsButton}
        </div>
        {stage}
      </div>
    )

  return (
    <div className="screen trace">
      <header className="trace-head">
        <div className="brand">
          <div className="logo">o</div>
          <div>
            <div className="eyebrow gold">BY BERRY</div>
            <div className="title">ONGLE TRACE</div>
          </div>
          <span className="badge">• PRIVATE</span>
        </div>
        <div className="eyebrow gold mode">TRACING MODE / HANDS ON</div>
        <div className="row">
          {locked ? unlockButton(false) : <button className="pink" onClick={() => setLocked(true)}>🔒 Lock design</button>}
          {colorsButton}
          <button
            className={`ghost dark ${showOptions ? 'on-gold' : ''}`}
            onClick={() => setShowOptions((v) => !v)}
            title="Affichage : couleur du trait, fond, miroir"
          >
            ⚙
          </button>
          <button className="ghost dark" onClick={toggleFullscreen}>⛶</button>
          {!locked && <button className="ghost dark" onClick={onExit}>Quitter</button>}
        </div>
      </header>

      {set && (
        <div className="finger-nav">
          <button className="ghost dark" onClick={() => go(-1)} aria-label="Doigt précédent">◀</button>
          <div className="finger-label">
            <b>{view === 'hand' ? (finger < 5 ? 'Main gauche' : 'Main droite') : FINGERS[finger]}</b>
            <span className="muted">
              {view === 'hand'
                ? '5 ongles'
                : `${current.nailW} × ${current.nailH} mm${dims?.size ? ` · taille ${dims.size}` : ''}`}
            </span>
          </div>
          <button className="ghost dark" onClick={() => go(1)} aria-label="Doigt suivant">▶</button>
          <button className="chip" onClick={() => setView(view === 'hand' ? 'single' : 'hand')}>
            {view === 'hand' ? '1 doigt' : 'Main entière'}
          </button>
        </div>
      )}

      {showOptions && (
        <div className="trace-options">
          <div className="opt">
            <span className="muted">Trait</span>
            {LINE_COLORS.map((c) => (
              <button
                key={c.id}
                className={`swatch ${display.line === c.id ? 'on' : ''}`}
                style={{ background: c.value || '#000' }}
                onClick={() => updateDisplay({ line: c.id })}
                title={c.label}
                aria-label={`Trait ${c.label}`}
              />
            ))}
          </div>
          <div className="opt">
            <span className="muted">Fond</span>
            {SURFACES.map((s) => (
              <button key={s.id} className={`chip ${display.surface === s.id ? 'on' : ''}`} onClick={() => updateDisplay({ surface: s.id })}>
                {s.label}
              </button>
            ))}
          </div>
          <label className="check">
            <input type="checkbox" checked={guides.on} onChange={toggleGuides} />
            Repères (axe + marge {guides.margin} mm)
          </label>
          {set && (
            <label className="check">
              <input type="checkbox" checked={display.mirrorRight} onChange={(e) => updateDisplay({ mirrorRight: e.target.checked })} />
              Main droite en miroir
            </label>
          )}
          <label className="check">
            <input type="checkbox" checked={immersiveOn} onChange={(e) => updateDisplay({ immersive: e.target.checked })} />
            Mode immersif une fois verrouillé
          </label>
        </div>
      )}

      {stage}
    </div>
  )
}

function TraceStage({ pxPerMm, display, locked, set, view, finger, variant, current, design, onChange, showColors, ink, dark, guides }) {
  return (
      <Grid pxPerMm={pxPerMm} className="trace-stage" variant={display.surface}>
        <div className={`lock-pill ${locked ? '' : 'open'}`}>{locked ? '🔒 DESIGN LOCKED' : '✋ DÉPLACEMENT LIBRE'}</div>
        {set && view === 'hand' ? (
          <div className="hand-row">
            {[0, 1, 2, 3, 4].map((k) => {
              const f = (finger < 5 ? 0 : 5) + k
              return (
                <NailView key={f} clipKey={f} design={variant(f)} pxPerMm={pxPerMm} colors={showColors} lineColor={ink} dark={dark} guides={guides} />
              )
            })}
          </div>
        ) : (
          <NailView
            colors={showColors}
            lineColor={ink}
            dark={dark}
            guides={guides}
            design={current}
            pxPerMm={pxPerMm}
            onMove={
              locked
                ? undefined
                : // on déplace la variante du doigt, puis on ramène le placement à la taille de base
                  (img) => onChange({ ...design, img: resizeNail({ ...current, img }, design.nailW, design.nailH).img })
            }
          />
        )}
        {/* Couche qui avale toutes les touches quand c'est verrouillé */}
        {locked && <div className="touch-shield" onPointerDown={(e) => e.preventDefault()} onTouchStart={(e) => e.preventDefault()} />}
        <div className="ready">READY TO TRACE</div>
      </Grid>
  )
}
