import { useEffect, useRef, useState } from 'react'
import NailView from '../components/NailView.jsx'
import Grid from '../components/Grid.jsx'
import { FINGERS, resizeNail } from '../lib/clients.js'
import { fingerDims, forFinger, hasSet } from '../lib/fingerset.js'

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
  const dims = set ? fingerDims(design, finger) : null
  const current = set ? forFinger(design, finger) : design
  const go = (d) =>
    setFinger((f) => (view === 'hand' ? (f < 5 ? 5 : 0) : (f + d + 10) % 10))

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
          {locked ? (
            <button
              className={`pink hold ${holding ? 'holding' : ''}`}
              style={{ '--hold': `${HOLD_MS}ms` }}
              onPointerDown={startHold}
              onPointerUp={cancelHold}
              onPointerLeave={cancelHold}
              onContextMenu={(e) => e.preventDefault()}
            >
              🔓 Unlock design <small>(maintenir)</small>
            </button>
          ) : (
            <button className="pink" onClick={() => setLocked(true)}>🔒 Lock design</button>
          )}
          <button
            className={`ghost dark ${showColors ? 'on-gold' : ''}`}
            onClick={() => setShowColors((v) => !v)}
            title="Couleurs d'origine sous le trait"
          >
            🎨
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

      <Grid pxPerMm={pxPerMm} className="trace-stage">
        <div className={`lock-pill ${locked ? '' : 'open'}`}>{locked ? '🔒 DESIGN LOCKED' : '✋ DÉPLACEMENT LIBRE'}</div>
        {set && view === 'hand' ? (
          <div className="hand-row">
            {[0, 1, 2, 3, 4].map((k) => {
              const f = (finger < 5 ? 0 : 5) + k
              return <NailView key={f} clipKey={f} design={forFinger(design, f)} pxPerMm={pxPerMm} colors={showColors} />
            })}
          </div>
        ) : (
          <NailView
            colors={showColors}
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
    </div>
  )
}
