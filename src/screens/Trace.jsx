import { useEffect, useRef, useState } from 'react'
import NailView from '../components/NailView.jsx'
import Grid from '../components/Grid.jsx'

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
          <button className="ghost dark" onClick={toggleFullscreen}>⛶</button>
          {!locked && <button className="ghost dark" onClick={onExit}>Quitter</button>}
        </div>
      </header>

      <Grid pxPerMm={pxPerMm} className="trace-stage">
        <div className={`lock-pill ${locked ? '' : 'open'}`}>{locked ? '🔒 DESIGN LOCKED' : '✋ DÉPLACEMENT LIBRE'}</div>
        <NailView
          design={design}
          pxPerMm={pxPerMm}
          onMove={locked ? undefined : (img) => onChange({ ...design, img })}
        />
        {/* Couche qui avale toutes les touches quand c'est verrouillé */}
        {locked && <div className="touch-shield" onPointerDown={(e) => e.preventDefault()} onTouchStart={(e) => e.preventDefault()} />}
        <div className="ready">READY TO TRACE</div>
      </Grid>
    </div>
  )
}
